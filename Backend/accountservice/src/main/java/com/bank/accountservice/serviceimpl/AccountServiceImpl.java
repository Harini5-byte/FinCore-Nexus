package com.bank.accountservice.serviceimpl;

import com.bank.accountservice.dto.AccountRequest;
import com.bank.accountservice.dto.AccountResponse;
import com.bank.accountservice.entity.Account;
import com.bank.accountservice.repository.AccountRepository;
import com.bank.accountservice.service.AccountService;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final RestTemplate restTemplate;

    public AccountServiceImpl(
            AccountRepository accountRepository,
            RestTemplate restTemplate) {

        this.accountRepository = accountRepository;
        this.restTemplate = restTemplate;
    }

    // =====================================================
    // CREATE ACCOUNT
    // =====================================================

    @Override
    @Transactional
    public AccountResponse createAccount(AccountRequest request) {

        // =================================================
        // KYC CHECK - MUST BE VERIFIED BEFORE ACCOUNT CREATION
        // =================================================

        checkKycApproved(request.getCustomerId());

        Account account = new Account();

        account.setAccountNumber(generateAccountNumber());

        account.setCustomerId(
                request.getCustomerId()
        );

        account.setAccountType(
                request.getAccountType()
        );

        BigDecimal initialDeposit =
                request.getInitialDeposit();

        if (initialDeposit == null) {
            initialDeposit = BigDecimal.ZERO;
        }

        account.setBalance(initialDeposit);

        if (request.getCurrency() == null ||
                request.getCurrency().isBlank()) {

            account.setCurrency("INR");

        } else {

            account.setCurrency(
                    request.getCurrency()
            );
        }

        account.setStatus("ACTIVE");

        Account savedAccount =
                accountRepository.save(account);

        return mapToResponse(savedAccount);
    }

    // =====================================================
    // REQUEST NEW ACCOUNT
    // =====================================================

    @Override
    @Transactional
    public AccountResponse requestAccount(
            AccountRequest request) {

        // =================================================
        // KYC CHECK - MUST BE VERIFIED BEFORE ACCOUNT CREATION
        // =================================================

        checkKycApproved(request.getCustomerId());

        Account account = new Account();

        account.setAccountNumber(
                generateAccountNumber()
        );

        account.setCustomerId(
                request.getCustomerId()
        );

        account.setAccountType(
                request.getAccountType()
        );

        account.setBalance(BigDecimal.ZERO);

        if (request.getCurrency() == null ||
                request.getCurrency().isBlank()) {

            account.setCurrency("INR");

        } else {

            account.setCurrency(
                    request.getCurrency()
            );
        }

        account.setStatus("PENDING");

        Account savedAccount =
                accountRepository.save(account);

        return mapToResponse(savedAccount);
    }

    // =====================================================
    // APPROVE ACCOUNT
    // =====================================================

    @Override
    @Transactional
    public AccountResponse approveAccount(Long id) {

        Account account = findAccount(id);

        if (!"PENDING".equalsIgnoreCase(
                account.getStatus())) {

            throw new RuntimeException(
                    "Only pending accounts can be approved"
            );
        }

        account.setStatus("ACTIVE");

        return mapToResponse(
                accountRepository.save(account)
        );
    }

    // =====================================================
    // REJECT ACCOUNT
    // =====================================================

    @Override
    @Transactional
    public AccountResponse rejectAccount(Long id) {

        Account account = findAccount(id);

        if (!"PENDING".equalsIgnoreCase(
                account.getStatus())) {

            throw new RuntimeException(
                    "Only pending accounts can be rejected"
            );
        }

        account.setStatus("REJECTED");

        return mapToResponse(
                accountRepository.save(account)
        );
    }

    // =====================================================
    // GET ACCOUNT
    // =====================================================

    @Override
    public AccountResponse getAccount(Long id) {

        return mapToResponse(
                findAccount(id)
        );
    }

    // =====================================================
    // GET BY ACCOUNT NUMBER
    // =====================================================

    @Override
    public AccountResponse getByAccountNumber(
            String accountNumber) {

        Account account =
                accountRepository
                        .findByAccountNumber(accountNumber)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Account not found: "
                                                + accountNumber
                                )
                        );

        return mapToResponse(account);
    }

    // =====================================================
    // GET CUSTOMER ACCOUNTS
    // =====================================================

    @Override
    public List<AccountResponse> getCustomerAccounts(
            Long customerId) {

        return accountRepository
                .findByCustomerId(customerId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =====================================================
    // GET ALL ACCOUNTS
    // =====================================================

    @Override
    public List<AccountResponse> getAllAccounts() {

        return accountRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =====================================================
    // DEPOSIT
    // =====================================================

    @Override
    @Transactional
    public AccountResponse deposit(
            Long id,
            BigDecimal amount) {

        validateAmount(
                amount,
                "Deposit amount must be greater than zero"
        );

        Account account = findAccount(id);

        if (!"ACTIVE".equalsIgnoreCase(
                account.getStatus())) {

            throw new RuntimeException(
                    "Deposit is allowed only for active accounts"
            );
        }

        BigDecimal currentBalance =
                account.getBalance();

        if (currentBalance == null) {
            currentBalance = BigDecimal.ZERO;
        }

        BigDecimal newBalance =
                currentBalance.add(amount);

        account.setBalance(newBalance);

        Account savedAccount =
                accountRepository.save(account);

        return mapToResponse(savedAccount);
    }

    // =====================================================
    // WITHDRAW
    // =====================================================

    @Override
    @Transactional
    public AccountResponse withdraw(
            Long id,
            BigDecimal amount) {

        validateAmount(
                amount,
                "Withdrawal amount must be greater than zero"
        );

        Account account = findAccount(id);

        if (!"ACTIVE".equalsIgnoreCase(
                account.getStatus())) {

            throw new RuntimeException(
                    "Withdrawal is allowed only for active accounts"
            );
        }

        BigDecimal currentBalance =
                account.getBalance();

        if (currentBalance == null) {
            currentBalance = BigDecimal.ZERO;
        }

        if (amount.compareTo(currentBalance) > 0) {

            throw new RuntimeException(
                    "Insufficient balance. Available balance: ₹"
                            + currentBalance
                            + ", requested withdrawal: ₹"
                            + amount
            );
        }

        BigDecimal newBalance =
                currentBalance.subtract(amount);

        account.setBalance(newBalance);

        Account savedAccount =
                accountRepository.save(account);

        return mapToResponse(savedAccount);
    }

    // =====================================================
    // CREDIT LOAN
    // =====================================================

    @Override
    @Transactional
    public AccountResponse creditLoan(
            Long id,
            BigDecimal amount) {

        validateAmount(
                amount,
                "Loan credit amount must be greater than zero"
        );

        Account account = findAccount(id);

        if (!"ACTIVE".equalsIgnoreCase(
                account.getStatus())) {

            throw new RuntimeException(
                    "Loan can only be credited to an active account"
            );
        }

        BigDecimal currentBalance =
                account.getBalance();

        if (currentBalance == null) {
            currentBalance = BigDecimal.ZERO;
        }

        BigDecimal newBalance =
                currentBalance.add(amount);

        account.setBalance(newBalance);

        Account savedAccount =
                accountRepository.save(account);

        return mapToResponse(savedAccount);
    }

    // =====================================================
    // ACTIVATE
    // =====================================================

    @Override
    @Transactional
    public AccountResponse activate(Long id) {

        Account account = findAccount(id);

        account.setStatus("ACTIVE");

        return mapToResponse(
                accountRepository.save(account)
        );
    }

    // =====================================================
    // DEACTIVATE
    // =====================================================

    @Override
    @Transactional
    public AccountResponse deactivate(Long id) {

        Account account = findAccount(id);

        account.setStatus("INACTIVE");

        return mapToResponse(
                accountRepository.save(account)
        );
    }

    // =====================================================
    // DELETE
    // =====================================================

    @Override
    @Transactional
    public void deleteAccount(Long id) {

        Account account = findAccount(id);

        accountRepository.delete(account);
    }

    // =====================================================
    // FIND ACCOUNT
    // =====================================================

    private Account findAccount(Long id) {

        return accountRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Account not found with id: "
                                        + id
                        )
                );
    }

    // =====================================================
    // VALIDATE AMOUNT
    // =====================================================

    private void validateAmount(
            BigDecimal amount,
            String message) {

        if (amount == null ||
                amount.compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(message);
        }
    }

    // =====================================================
    // GENERATE ACCOUNT NUMBER
    // =====================================================

    private String generateAccountNumber() {

        String number;

        do {

            number =
                    "ACC" +
                            UUID.randomUUID()
                                    .toString()
                                    .replace("-", "")
                                    .substring(0, 12)
                                    .toUpperCase();

        } while (
                accountRepository
                        .existsByAccountNumber(number)
        );

        return number;
    }

    // =====================================================
    // CHECK KYC APPROVED
    // Calls kyc-service through the API Gateway.
    // Blocks account creation if no APPROVED KYC record
    // exists for this customer.
    // =====================================================

    private void checkKycApproved(Long customerId) {

        String url =
                "http://localhost:8080/kyc/customer/"
                        + customerId;

        KycInfo[] kycRecords;

        try {

            kycRecords =
                    restTemplate.getForObject(
                            url,
                            KycInfo[].class
                    );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unable to verify KYC status right now. "
                            + "Please try again later."
            );
        }

        if (kycRecords == null ||
                kycRecords.length == 0) {

            throw new RuntimeException(
                    "KYC verification required. "
                            + "Please complete your KYC "
                            + "before opening an account."
            );
        }

        boolean approved = false;

        for (KycInfo record : kycRecords) {

            if (record.getStatus() != null &&
                    record.getStatus()
                            .equalsIgnoreCase("APPROVED")) {

                approved = true;
                break;
            }
        }

        if (!approved) {

            throw new RuntimeException(
                    "KYC not yet approved. "
                            + "Please wait for KYC approval "
                            + "before opening an account."
            );
        }
    }

    // =====================================================
    // GET CUSTOMER NAME
    // =====================================================

    private String getCustomerName(Long customerId) {

        try {

            String url =
                    "http://localhost:8080/api/customers/"
                            + customerId;

            CustomerResponse customer =
                    restTemplate.getForObject(
                            url,
                            CustomerResponse.class
                    );

            if (customer == null) {
                return "Unknown Customer";
            }

            String firstName =
                    customer.getFirstName() == null
                            ? ""
                            : customer.getFirstName();

            String lastName =
                    customer.getLastName() == null
                            ? ""
                            : customer.getLastName();

            String fullName =
                    (firstName + " " + lastName).trim();

            return fullName.isEmpty()
                    ? "Unknown Customer"
                    : fullName;

        } catch (Exception e) {

            System.err.println(
                    "Unable to fetch customer name for customer ID "
                            + customerId
            );

            return "Unknown Customer";
        }
    }

    // =====================================================
    // MAP ENTITY -> RESPONSE
    // =====================================================

    private AccountResponse mapToResponse(
            Account account) {

        AccountResponse response =
                new AccountResponse();

        response.setId(account.getId());

        response.setAccountNumber(
                account.getAccountNumber()
        );

        response.setCustomerId(
                account.getCustomerId()
        );

        response.setCustomerName(
                getCustomerName(
                        account.getCustomerId()
                )
        );

        response.setAccountType(
                account.getAccountType()
        );

        response.setBalance(
                account.getBalance()
        );

        response.setCurrency(
                account.getCurrency()
        );

        response.setStatus(
                account.getStatus()
        );

        response.setCreatedAt(
                account.getCreatedAt()
        );

        response.setUpdatedAt(
                account.getUpdatedAt()
        );

        return response;
    }

    // =====================================================
    // CUSTOMER RESPONSE (minimal, from customerservice)
    // =====================================================

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CustomerResponse {

        private Long id;
        private String firstName;
        private String lastName;

        public Long getId() {
            return id;
        }

        public String getFirstName() {
            return firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }
    }

    // =====================================================
    // KYC INFO (minimal, from kyc-service)
    // =====================================================

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class KycInfo {

        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}