package com.bank.loanservice.serviceimpl;

import com.bank.loanservice.dto.LoanRequest;
import com.bank.loanservice.dto.LoanResponse;
import com.bank.loanservice.entity.Loan;
import com.bank.loanservice.repository.LoanRepository;
import com.bank.loanservice.service.LoanService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class LoanServiceImpl implements LoanService {

    private final LoanRepository loanRepository;
    private final RestTemplate restTemplate;

    @Value("${account.service.url:http://localhost:8082}")
    private String accountServiceUrl;

    public LoanServiceImpl(
            LoanRepository loanRepository,
            RestTemplate restTemplate) {

        this.loanRepository = loanRepository;
        this.restTemplate = restTemplate;
    }

    // =====================================================
    // CREATE / REQUEST LOAN
    // IMPORTANT:
    // DO NOT CREDIT ACCOUNT HERE
    // =====================================================

    @Override
    @Transactional
    public LoanResponse createLoan(LoanRequest request) {

        if (request.getLoanAmount() == null ||
                request.getLoanAmount()
                        .compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Loan amount must be greater than zero"
            );
        }

        Loan loan = new Loan();

        loan.setLoanNumber(
                generateLoanNumber()
        );

        loan.setCustomerId(
                request.getCustomerId()
        );

        loan.setLoanAmount(
                request.getLoanAmount()
        );

        loan.setInterestRate(
                request.getInterestRate()
        );

        loan.setTenureMonths(
                request.getTenureMonths()
        );

        loan.setLoanType(
                request.getLoanType()
                        .toUpperCase()
        );

        // IMPORTANT
        // Loan request starts as PENDING
        // NO money is added to account here.
        loan.setStatus("PENDING");

        loan.setOutstandingAmount(
                request.getLoanAmount()
        );

        return mapToResponse(
                loanRepository.save(loan)
        );
    }

    // =====================================================
    // GET LOAN
    // =====================================================

    @Override
    public LoanResponse getLoan(Long id) {

        return mapToResponse(
                findLoan(id)
        );
    }

    // =====================================================
    // GET BY LOAN NUMBER
    // =====================================================

    @Override
    public LoanResponse getByLoanNumber(
            String loanNumber) {

        Loan loan =
                loanRepository
                        .findByLoanNumber(loanNumber)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Loan not found: "
                                                + loanNumber
                                )
                        );

        return mapToResponse(loan);
    }

    // =====================================================
    // GET ALL LOANS
    // =====================================================

    @Override
    public List<LoanResponse> getAllLoans() {

        return loanRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =====================================================
    // GET CUSTOMER LOANS
    // =====================================================

    @Override
    public List<LoanResponse> getCustomerLoans(
            Long customerId) {

        return loanRepository
                .findByCustomerId(customerId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =====================================================
    // GET LOANS BY STATUS
    // =====================================================

    @Override
    public List<LoanResponse> getLoansByStatus(
            String status) {

        return loanRepository
                .findByStatus(
                        status.toUpperCase()
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =====================================================
    // APPROVE LOAN
    // =====================================================

    @Override
    @Transactional
    public LoanResponse approveLoan(Long id) {

        Loan loan = findLoan(id);

        // -------------------------------------------------
        // ONLY PENDING LOAN CAN BE APPROVED
        // -------------------------------------------------

        if (!"PENDING".equalsIgnoreCase(
                loan.getStatus())) {

            throw new RuntimeException(
                    "Only pending loans can be approved"
            );
        }

        // -------------------------------------------------
        // FIND CUSTOMER ACCOUNT
        // -------------------------------------------------

        String accountsUrl =
                accountServiceUrl
                        + "/api/accounts/customer/"
                        + loan.getCustomerId();

        try {

            AccountResponse[] accounts =
                    restTemplate.getForObject(
                            accountsUrl,
                            AccountResponse[].class
                    );

            if (accounts == null ||
                    accounts.length == 0) {

                throw new RuntimeException(
                        "No bank account found for customer ID: "
                                + loan.getCustomerId()
                );
            }

            // -------------------------------------------------
            // FIND ACTIVE ACCOUNT
            // -------------------------------------------------

            AccountResponse activeAccount = null;

            for (AccountResponse account : accounts) {

                if ("ACTIVE".equalsIgnoreCase(
                        account.getStatus())) {

                    activeAccount = account;
                    break;
                }
            }

            if (activeAccount == null) {

                throw new RuntimeException(
                        "Customer does not have an active bank account"
                );
            }

            // -------------------------------------------------
            // CREDIT LOAN AMOUNT
            //
            // THIS IS THE ONLY PLACE WHERE THE LOAN
            // MONEY IS ADDED TO THE ACCOUNT.
            // -------------------------------------------------

            String depositUrl =
                    accountServiceUrl
                            + "/api/accounts/"
                            + activeAccount.getId()
                            + "/deposit?amount="
                            + loan.getLoanAmount();

            restTemplate.put(
                    depositUrl,
                    null
            );

            System.out.println(
                    "Loan approved successfully."
            );

            System.out.println(
                    "Loan amount ₹"
                            + loan.getLoanAmount()
                            + " credited to account ID "
                            + activeAccount.getId()
            );

            // -------------------------------------------------
            // ONLY AFTER SUCCESSFUL ACCOUNT CREDIT
            // MARK LOAN AS APPROVED
            // -------------------------------------------------

            loan.setStatus("APPROVED");

            Loan savedLoan =
                    loanRepository.save(loan);

            return mapToResponse(savedLoan);

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unable to approve loan and credit account: "
                            + e.getMessage(),
                    e
            );
        }
    }

    // =====================================================
    // REJECT LOAN
    // =====================================================

    @Override
    @Transactional
    public LoanResponse rejectLoan(Long id) {

        Loan loan = findLoan(id);

        if (!"PENDING".equalsIgnoreCase(
                loan.getStatus())) {

            throw new RuntimeException(
                    "Only pending loans can be rejected"
            );
        }

        // IMPORTANT:
        // Rejected loan NEVER credits account.

        loan.setStatus("REJECTED");

        return mapToResponse(
                loanRepository.save(loan)
        );
    }

    // =====================================================
    // CLOSE LOAN
    // =====================================================

    @Override
    @Transactional
    public LoanResponse closeLoan(Long id) {

        Loan loan = findLoan(id);

        loan.setStatus("CLOSED");

        loan.setOutstandingAmount(
                BigDecimal.ZERO
        );

        return mapToResponse(
                loanRepository.save(loan)
        );
    }

    // =====================================================
    // REPAY LOAN
    // =====================================================

    @Override
    @Transactional
    public LoanResponse repayLoan(
            Long id,
            BigDecimal amount) {

        if (amount == null ||
                amount.compareTo(
                        BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Repayment amount must be greater than zero"
            );
        }

        Loan loan = findLoan(id);

        if (!"APPROVED".equalsIgnoreCase(
                loan.getStatus())) {

            throw new RuntimeException(
                    "Only approved loans can receive repayments"
            );
        }

        if (loan.getOutstandingAmount()
                .compareTo(amount) < 0) {

            throw new RuntimeException(
                    "Repayment exceeds outstanding amount"
            );
        }

        BigDecimal remaining =
                loan.getOutstandingAmount()
                        .subtract(amount);

        loan.setOutstandingAmount(
                remaining
        );

        if (remaining.compareTo(
                BigDecimal.ZERO) == 0) {

            loan.setStatus("CLOSED");
        }

        return mapToResponse(
                loanRepository.save(loan)
        );
    }

    // =====================================================
    // DELETE
    // =====================================================

    @Override
    public void deleteLoan(Long id) {

        Loan loan = findLoan(id);

        loanRepository.delete(loan);
    }

    // =====================================================
    // FIND LOAN
    // =====================================================

    private Loan findLoan(Long id) {

        return loanRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Loan not found with id: "
                                        + id
                        )
                );
    }

    // =====================================================
    // GENERATE LOAN NUMBER
    // =====================================================

    private String generateLoanNumber() {

        return "LOAN-" +
                UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 12)
                        .toUpperCase();
    }

    // =====================================================
    // MAP RESPONSE
    // =====================================================

    private LoanResponse mapToResponse(
            Loan loan) {

        LoanResponse response =
                new LoanResponse();

        response.setId(
                loan.getId()
        );

        response.setLoanNumber(
                loan.getLoanNumber()
        );

        response.setCustomerId(
                loan.getCustomerId()
        );

        response.setLoanAmount(
                loan.getLoanAmount()
        );

        response.setInterestRate(
                loan.getInterestRate()
        );

        response.setTenureMonths(
                loan.getTenureMonths()
        );

        response.setLoanType(
                loan.getLoanType()
        );

        response.setStatus(
                loan.getStatus()
        );

        response.setOutstandingAmount(
                loan.getOutstandingAmount()
        );

        response.setCreatedAt(
                loan.getCreatedAt()
        );

        response.setUpdatedAt(
                loan.getUpdatedAt()
        );

        return response;
    }

    // =====================================================
    // ACCOUNT RESPONSE
    // =====================================================

    public static class AccountResponse {

        private Long id;
        private Long customerId;
        private String accountNumber;
        private String accountType;
        private BigDecimal balance;
        private String currency;
        private String status;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Long getCustomerId() {
            return customerId;
        }

        public void setCustomerId(Long customerId) {
            this.customerId = customerId;
        }

        public String getAccountNumber() {
            return accountNumber;
        }

        public void setAccountNumber(
                String accountNumber) {

            this.accountNumber =
                    accountNumber;
        }

        public String getAccountType() {
            return accountType;
        }

        public void setAccountType(
                String accountType) {

            this.accountType =
                    accountType;
        }

        public BigDecimal getBalance() {
            return balance;
        }

        public void setBalance(
                BigDecimal balance) {

            this.balance = balance;
        }

        public String getCurrency() {
            return currency;
        }

        public void setCurrency(
                String currency) {

            this.currency = currency;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(
                String status) {

            this.status = status;
        }
    }
}