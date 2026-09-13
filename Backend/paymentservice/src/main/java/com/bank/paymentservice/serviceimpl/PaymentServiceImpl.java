package com.bank.paymentservice.serviceimpl;

import com.bank.paymentservice.dto.FraudCheckResult;
import com.bank.paymentservice.dto.PaymentRequest;
import com.bank.paymentservice.dto.PaymentResponse;
import com.bank.paymentservice.entity.Payment;
import com.bank.paymentservice.repository.PaymentRepository;
import com.bank.paymentservice.service.EmailNotificationService;
import com.bank.paymentservice.service.FraudCheckService;
import com.bank.paymentservice.service.PaymentService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final RestTemplate restTemplate;
    private final FraudCheckService fraudCheckService;
    private final EmailNotificationService emailNotificationService;

    // Only these 4 payment methods are allowed, like real banking rails
    private static final Set<String> ALLOWED_PAYMENT_METHODS =
            Set.of("IMPS", "NEFT", "RTGS", "UPI");

    @Value("${account.service.url:http://localhost:8082}")
    private String accountServiceUrl;

    public PaymentServiceImpl(
            PaymentRepository paymentRepository,
            RestTemplate restTemplate,
            FraudCheckService fraudCheckService,
            EmailNotificationService emailNotificationService) {

        this.paymentRepository = paymentRepository;
        this.restTemplate = restTemplate;
        this.fraudCheckService = fraudCheckService;
        this.emailNotificationService = emailNotificationService;
    }

    // =====================================================
    // CREATE PAYMENT
    // =====================================================

    @Override
    @Transactional
    public PaymentResponse createPayment(
            PaymentRequest request) {

        if (request.getCustomerId() == null) {

            throw new RuntimeException(
                    "Customer ID is required");
        }

        if (request.getAccountId() == null) {

            throw new RuntimeException(
                    "Source Account ID is required");
        }

        if (request.getAmount() == null ||
                request.getAmount()
                        .compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Payment amount must be greater than zero");
        }

        String paymentType =
                request.getPaymentType()
                        .toUpperCase();

        // =================================================
        // VALIDATE PAYMENT METHOD (IMPS / NEFT / RTGS / UPI)
        // =================================================

        if (request.getPaymentMethod() == null) {

            throw new RuntimeException(
                    "Payment method is required (IMPS, NEFT, RTGS or UPI)");
        }

        String paymentMethod =
                request.getPaymentMethod()
                        .toUpperCase();

        if (!ALLOWED_PAYMENT_METHODS.contains(paymentMethod)) {

            throw new RuntimeException(
                    "Invalid payment method: " + paymentMethod
                            + ". Allowed methods are IMPS, NEFT, RTGS, UPI");
        }

        // =================================================
        // ONLINE PAYMENT
        // =================================================

        if ("ONLINE_PAYMENT".equals(paymentType)) {

            if (request.getRecipientAccountId() == null) {

                throw new RuntimeException(
                        "Recipient Account ID is required for online payment");
            }

            if (request.getAccountId()
                    .equals(request.getRecipientAccountId())) {

                throw new RuntimeException(
                        "Source and recipient accounts cannot be the same");
            }
        }

        // =================================================
        // SHOPKEEPER PAYMENT
        // =================================================

        if ("SHOPKEEPER_PAYMENT".equals(paymentType)) {

            if (request.getRecipientAccountId() == null) {

                throw new RuntimeException(
                        "Shopkeeper Account ID is required");
            }

            if (request.getAccountId()
                    .equals(request.getRecipientAccountId())) {

                throw new RuntimeException(
                        "Source and shopkeeper accounts cannot be the same");
            }
        }

        // =================================================
        // RUN FRAUD CHECK
        // =================================================

        FraudCheckResult fraudResult =
                fraudCheckService.evaluate(request);

        // =================================================
        // CREATE PAYMENT
        // =================================================

        Payment payment = new Payment();

        payment.setPaymentReference(
                generatePaymentReference());

        payment.setCustomerId(
                request.getCustomerId());

        payment.setAccountId(
                request.getAccountId());

        payment.setRecipientAccountId(
                request.getRecipientAccountId());

        payment.setLoanId(
                request.getLoanId());

        payment.setAmount(
                request.getAmount());

        payment.setPaymentType(
                paymentType);

        payment.setPaymentMethod(
                paymentMethod);

        payment.setDescription(
                request.getDescription());

        payment.setRiskScore(
                fraudResult.getRiskScore());

        payment.setFraudStatus(
                fraudResult.getFraudStatus());

        // =================================================
        // IF FRAUD CHECK BLOCKS THIS PAYMENT, STOP HERE
        // MONEY NEVER MOVES. RETURN A NORMAL RESPONSE
        // INSTEAD OF THROWING, SO THE RECORD IS NOT
        // ROLLED BACK BY THE @Transactional WRAPPER.
        // =================================================

        if ("BLOCKED".equals(fraudResult.getFraudStatus())) {

            payment.setStatus("FAILED");

            PaymentResponse blockedResponse =
                    mapToResponse(
                            paymentRepository.save(payment));

            emailNotificationService.sendPaymentEmail(
                    blockedResponse,
                    request.getCustomerEmail());

            return blockedResponse;
        }

        // =================================================
        // PAYMENT STARTS PENDING
        // =================================================

        payment.setStatus("PENDING");

        payment = paymentRepository.save(payment);

        // =================================================
        // IMMEDIATELY PROCESS PAYMENT
        // =================================================

        PaymentResponse finalResponse =
                processPayment(payment.getId());

        // =================================================
        // SEND SENDER EMAIL (SUCCESS / FAILED / FLAGGED)
        // =================================================

        emailNotificationService.sendPaymentEmail(
                finalResponse,
                request.getCustomerEmail());

        // =================================================
        // SEND RECIPIENT CREDIT ALERT
        // ONLY IF MONEY ACTUALLY MOVED (STATUS = SUCCESS)
        // =================================================

        if ("SUCCESS".equalsIgnoreCase(finalResponse.getStatus())) {

            emailNotificationService.sendCreditAlertEmail(
                    finalResponse,
                    request.getRecipientEmail());
        }

        return finalResponse;
    }

    // =====================================================
    // PROCESS PAYMENT
    // =====================================================

    @Override
    @Transactional
    public PaymentResponse processPayment(Long id) {

        Payment payment = findPayment(id);

        if (!"PENDING".equalsIgnoreCase(
                payment.getStatus())) {

            throw new RuntimeException(
                    "Only pending payments can be processed");
        }

        Long sourceAccountId =
                payment.getAccountId();

        Long recipientAccountId =
                payment.getRecipientAccountId();

        String paymentType =
                payment.getPaymentType() == null
                        ? ""
                        : payment.getPaymentType().toUpperCase();

        if (sourceAccountId == null) {

            payment.setStatus("FAILED");

            paymentRepository.save(payment);

            throw new RuntimeException(
                    "Source account ID is required");
        }

        // Only genuine two-party payments (moving money between two
        // different accounts) need a recipient. DEPOSIT, WITHDRAWAL,
        // EMI, and BILL only ever touch the ONE source account.
        boolean requiresRecipient =
                "TRANSFER".equals(paymentType)
                        || "ONLINE_PAYMENT".equals(paymentType)
                        || "SHOPKEEPER_PAYMENT".equals(paymentType);

        if (requiresRecipient) {

            if (recipientAccountId == null) {

                payment.setStatus("FAILED");

                paymentRepository.save(payment);

                throw new RuntimeException(
                        "Recipient account ID is required for " + paymentType);
            }

            if (sourceAccountId.equals(recipientAccountId)) {

                payment.setStatus("FAILED");

                paymentRepository.save(payment);

                throw new RuntimeException(
                        "Source and recipient accounts cannot be the same");
            }
        }

        try {

            if (requiresRecipient) {

                // =================================================
                // TWO-PARTY PAYMENT: WITHDRAW FROM SOURCE,
                // DEPOSIT INTO RECIPIENT
                // =================================================

                String withdrawUrl =
                        accountServiceUrl
                                + "/api/accounts/"
                                + sourceAccountId
                                + "/withdraw?amount="
                                + payment.getAmount();

                restTemplate.put(
                        withdrawUrl,
                        null);

                try {

                    String depositUrl =
                            accountServiceUrl
                                    + "/api/accounts/"
                                    + recipientAccountId
                                    + "/deposit?amount="
                                    + payment.getAmount();

                    restTemplate.put(
                            depositUrl,
                            null);

                } catch (Exception recipientError) {

                    // Recipient deposit failed - try to refund the source
                    try {

                        String refundUrl =
                                accountServiceUrl
                                        + "/api/accounts/"
                                        + sourceAccountId
                                        + "/deposit?amount="
                                        + payment.getAmount();

                        restTemplate.put(
                                refundUrl,
                                null);

                    } catch (Exception refundError) {

                        System.err.println(
                                "CRITICAL: Payment refund failed. "
                                        + "Source account: "
                                        + sourceAccountId
                                        + ", Amount: "
                                        + payment.getAmount());
                    }

                    payment.setStatus("FAILED");

                    paymentRepository.save(payment);

                    throw new RuntimeException(
                            "Payment failed. Recipient account could not be credited.");
                }

            } else if ("DEPOSIT".equals(paymentType)) {

                // =================================================
                // SINGLE-ACCOUNT: DEPOSIT ONLY
                // =================================================

                String depositUrl =
                        accountServiceUrl
                                + "/api/accounts/"
                                + sourceAccountId
                                + "/deposit?amount="
                                + payment.getAmount();

                restTemplate.put(
                        depositUrl,
                        null);

            } else {

                // =================================================
                // SINGLE-ACCOUNT: WITHDRAWAL / EMI / BILL
                // (anything else defaults to a source-account debit)
                // =================================================

                String withdrawUrl =
                        accountServiceUrl
                                + "/api/accounts/"
                                + sourceAccountId
                                + "/withdraw?amount="
                                + payment.getAmount();

                restTemplate.put(
                        withdrawUrl,
                        null);
            }

        } catch (Exception e) {

            // =================================================
            // PAYMENT FAILED
            // =================================================

            if ("FAILED".equalsIgnoreCase(
                    payment.getStatus())) {

                throw new RuntimeException(
                        e.getMessage());
            }

            payment.setStatus("FAILED");

            paymentRepository.save(payment);

            String message =
                    e.getMessage();

            if (message == null ||
                    message.trim().isEmpty()) {

                message =
                        "Insufficient balance or unable to process payment.";
            }

            throw new RuntimeException(
                    "Payment failed: "
                            + message);
        }

        // =================================================
        // SUCCESSFUL
        // =================================================

        payment.setStatus("SUCCESS");

        return mapToResponse(
                paymentRepository.save(payment));
    }

    // =====================================================
    // GET PAYMENT
    // =====================================================

    @Override
    public PaymentResponse getPayment(Long id) {

        return mapToResponse(
                findPayment(id));
    }

    // =====================================================
    // GET BY REFERENCE
    // =====================================================

    @Override
    public PaymentResponse getByReference(
            String reference) {

        Payment payment =
                paymentRepository
                        .findByPaymentReference(reference)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found: "
                                                + reference));

        return mapToResponse(payment);
    }

    // =====================================================
    // GET ALL PAYMENTS
    // =====================================================

    @Override
    public List<PaymentResponse> getAllPayments() {

        return paymentRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =====================================================
    // CUSTOMER PAYMENTS
    // =====================================================

    @Override
    public List<PaymentResponse> getCustomerPayments(
            Long customerId) {

        String accountUrl =
                accountServiceUrl
                        + "/api/accounts/customer/"
                        + customerId;

        try {

            AccountInfo[] accounts =
                    restTemplate.getForObject(
                            accountUrl,
                            AccountInfo[].class
                    );

            if (accounts == null ||
                    accounts.length == 0) {

                return paymentRepository
                        .findByCustomerId(customerId)
                        .stream()
                        .map(this::mapToResponse)
                        .toList();
            }

            List<Long> accountIds =
                    java.util.Arrays.stream(accounts)
                            .map(AccountInfo::getId)
                            .filter(java.util.Objects::nonNull)
                            .toList();

            List<Payment> payments =
                    paymentRepository
                            .findByAccountIdInOrRecipientAccountIdIn(
                                    accountIds,
                                    accountIds
                            );

            List<Payment> customerPayments =
                    paymentRepository
                            .findByCustomerId(customerId);

            java.util.Map<Long, Payment> uniquePayments =
                    new java.util.LinkedHashMap<>();

            for (Payment payment : customerPayments) {

                uniquePayments.put(
                        payment.getId(),
                        payment
                );
            }

            for (Payment payment : payments) {

                uniquePayments.put(
                        payment.getId(),
                        payment
                );
            }

            return uniquePayments
                    .values()
                    .stream()
                    .map(this::mapToResponse)
                    .toList();

        } catch (Exception e) {

            System.err.println(
                    "Unable to load customer accounts: "
                            + e.getMessage()
            );

            return paymentRepository
                    .findByCustomerId(customerId)
                    .stream()
                    .map(this::mapToResponse)
                    .toList();
        }
    }

    // =====================================================
    // ACCOUNT PAYMENTS
    // =====================================================

    @Override
    public List<PaymentResponse> getAccountPayments(
            Long accountId) {

        return paymentRepository
                .findByAccountIdOrRecipientAccountId(
                        accountId,
                        accountId
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    // =====================================================
    // LOAN PAYMENTS
    // =====================================================

    @Override
    public List<PaymentResponse> getLoanPayments(
            Long loanId) {

        return paymentRepository
                .findByLoanId(loanId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =====================================================
    // STATUS
    // =====================================================

    @Override
    public List<PaymentResponse> getPaymentsByStatus(
            String status) {

        return paymentRepository
                .findByStatus(status.toUpperCase())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =====================================================
    // FAIL PAYMENT
    // =====================================================

    @Override
    @Transactional
    public PaymentResponse failPayment(Long id) {

        Payment payment =
                findPayment(id);

        if (!"PENDING".equalsIgnoreCase(
                payment.getStatus())) {

            throw new RuntimeException(
                    "Only pending payments can fail");
        }

        payment.setStatus("FAILED");

        return mapToResponse(
                paymentRepository.save(payment));
    }

    // =====================================================
    // CANCEL PAYMENT
    // =====================================================

    @Override
    @Transactional
    public PaymentResponse cancelPayment(Long id) {

        Payment payment =
                findPayment(id);

        if (!"PENDING".equalsIgnoreCase(
                payment.getStatus())) {

            throw new RuntimeException(
                    "Only pending payments can be cancelled");
        }

        payment.setStatus("CANCELLED");

        return mapToResponse(
                paymentRepository.save(payment));
    }

    // =====================================================
    // DELETE PAYMENT
    // =====================================================

    @Override
    public void deletePayment(Long id) {

        Payment payment =
                findPayment(id);

        paymentRepository.delete(payment);
    }

    // =====================================================
    // FIND PAYMENT
    // =====================================================

    private Payment findPayment(Long id) {

        return paymentRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payment not found with id: "
                                        + id));
    }

    // =====================================================
    // GENERATE PAYMENT REFERENCE
    // =====================================================

    private String generatePaymentReference() {

        return "PAY-"
                + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 12)
                .toUpperCase();
    }

    // =====================================================
    // MAP PAYMENT TO RESPONSE
    // =====================================================

    private PaymentResponse mapToResponse(
            Payment payment) {

        PaymentResponse response =
                new PaymentResponse();

        response.setId(
                payment.getId());

        response.setPaymentReference(
                payment.getPaymentReference());

        response.setCustomerId(
                payment.getCustomerId());

        response.setAccountId(
                payment.getAccountId());

        response.setRecipientAccountId(
                payment.getRecipientAccountId());

        response.setLoanId(
                payment.getLoanId());

        response.setAmount(
                payment.getAmount());

        response.setPaymentType(
                payment.getPaymentType());

        response.setPaymentMethod(
                payment.getPaymentMethod());

        response.setStatus(
                payment.getStatus());

        response.setRiskScore(
                payment.getRiskScore());

        response.setFraudStatus(
                payment.getFraudStatus());

        response.setDescription(
                payment.getDescription());

        response.setCreatedAt(
                payment.getCreatedAt());

        response.setUpdatedAt(
                payment.getUpdatedAt());

        return response;
    }
    private static class AccountInfo {

        private Long id;

        public AccountInfo() {
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }
    }
}