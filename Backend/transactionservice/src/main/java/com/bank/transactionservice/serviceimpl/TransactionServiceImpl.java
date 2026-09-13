package com.bank.transactionservice.serviceimpl;

import com.bank.transactionservice.dto.TransactionRequest;
import com.bank.transactionservice.dto.TransactionResponse;
import com.bank.transactionservice.entity.Transaction;
import com.bank.transactionservice.repository.TransactionRepository;
import com.bank.transactionservice.service.TransactionService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final RestTemplate restTemplate;

    public TransactionServiceImpl(
            TransactionRepository transactionRepository,
            RestTemplate restTemplate) {

        this.transactionRepository = transactionRepository;
        this.restTemplate = restTemplate;
    }

    @Override
    @Transactional
    public TransactionResponse createTransaction(
            TransactionRequest request) {

        if (request.getCustomerId() == null) {
            throw new RuntimeException("Customer ID is required");
        }

        if (request.getAccountId() == null) {
            throw new RuntimeException("Account ID is required");
        }

        if (request.getAmount() == null ||
                request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Transaction amount must be greater than zero");
        }

        if (request.getTransactionType() == null ||
                request.getTransactionType().isBlank()) {

            throw new RuntimeException(
                    "Transaction type is required");
        }

        String type = request.getTransactionType()
                .trim()
                .toUpperCase();

        if (!type.equals("DEPOSIT") &&
                !type.equals("WITHDRAWAL") &&
                !type.equals("BANK_TRANSFER")) {

            throw new RuntimeException(
                    "Invalid transaction type: " + type);
        }

        /*
         * DEPOSIT
         * Money is added to account.
         */
        if (type.equals("DEPOSIT")) {

            depositToAccount(
                    request.getAccountId(),
                    request.getAmount());
        }

        /*
         * WITHDRAWAL
         * Money is removed from account.
         */
        else if (type.equals("WITHDRAWAL")) {

            withdrawFromAccount(
                    request.getAccountId(),
                    request.getAmount());
        }

        /*
         * BANK_TRANSFER
         * For now treat it as money leaving
         * the selected account.
         */
        else {

            withdrawFromAccount(
                    request.getAccountId(),
                    request.getAmount());
        }

        Transaction transaction = new Transaction();

        transaction.setTransactionReference(
                generateReference());

        transaction.setCustomerId(
                request.getCustomerId());

        transaction.setAccountId(
                request.getAccountId());

        transaction.setAmount(
                request.getAmount());

        transaction.setTransactionType(type);

        transaction.setDescription(
                request.getDescription());

        transaction.setStatus("SUCCESS");

        Transaction saved =
                transactionRepository.save(transaction);

        return mapToResponse(saved);
    }

    private void depositToAccount(
            Long accountId,
            BigDecimal amount) {

        String url =
                "http://localhost:8082/api/accounts/"
                        + accountId
                        + "/deposit?amount="
                        + amount;

        System.out.println(
                "Calling Account Service DEPOSIT: " + url);

        try {

            restTemplate.put(
                    url,
                    null);

            System.out.println(
                    "Deposit successful for account: "
                            + accountId);

        } catch (HttpStatusCodeException e) {

            System.err.println(
                    "Account Service deposit failed. Status: "
                            + e.getStatusCode());

            System.err.println(
                    "Account Service response: "
                            + e.getResponseBodyAsString());

            throw new RuntimeException(
                    "Unable to deposit money into account "
                            + accountId
                            + ". Account Service returned "
                            + e.getStatusCode());

        } catch (RestClientException e) {

            System.err.println(
                    "Could not connect to Account Service: "
                            + e.getMessage());

            throw new RuntimeException(
                    "Account Service is unavailable");
        }
    }

    private void withdrawFromAccount(
            Long accountId,
            BigDecimal amount) {

        String url =
                "http://localhost:8082/api/accounts/"
                        + accountId
                        + "/withdraw?amount="
                        + amount;

        System.out.println(
                "Calling Account Service WITHDRAW: " + url);

        try {

            restTemplate.put(
                    url,
                    null);

            System.out.println(
                    "Withdrawal successful for account: "
                            + accountId);

        } catch (HttpStatusCodeException e) {

            System.err.println(
                    "Account Service withdrawal failed. Status: "
                            + e.getStatusCode());

            System.err.println(
                    "Account Service response: "
                            + e.getResponseBodyAsString());

            throw new RuntimeException(
                    "Unable to withdraw money from account "
                            + accountId
                            + ". Account Service returned "
                            + e.getStatusCode());

        } catch (RestClientException e) {

            System.err.println(
                    "Could not connect to Account Service: "
                            + e.getMessage());

            throw new RuntimeException(
                    "Account Service is unavailable");
        }
    }

    @Override
    public TransactionResponse getTransaction(Long id) {

        return mapToResponse(
                findTransaction(id));
    }

    @Override
    public TransactionResponse getByReference(
            String reference) {

        Transaction transaction =
                transactionRepository
                        .findByTransactionReference(reference)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Transaction not found: "
                                                + reference));

        return mapToResponse(transaction);
    }

    @Override
    public List<TransactionResponse> getAllTransactions() {

        return transactionRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<TransactionResponse>
    getCustomerTransactions(Long customerId) {

        return transactionRepository
                .findByCustomerId(customerId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<TransactionResponse>
    getAccountTransactions(Long accountId) {

        return transactionRepository
                .findByAccountId(accountId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<TransactionResponse>
    getTransactionsByStatus(String status) {

        return transactionRepository
                .findByStatus(status.toUpperCase())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private Transaction findTransaction(Long id) {

        return transactionRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Transaction not found with id: "
                                        + id));
    }

    private String generateReference() {

        return "TXN-" +
                UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 12)
                        .toUpperCase();
    }

    private TransactionResponse mapToResponse(
            Transaction transaction) {

        TransactionResponse response =
                new TransactionResponse();

        response.setId(transaction.getId());

        response.setTransactionReference(
                transaction.getTransactionReference());

        response.setCustomerId(
                transaction.getCustomerId());

        response.setAccountId(
                transaction.getAccountId());

        response.setAmount(
                transaction.getAmount());

        response.setTransactionType(
                transaction.getTransactionType());

        response.setStatus(
                transaction.getStatus());

        response.setDescription(
                transaction.getDescription());

        response.setTransactionDate(
                transaction.getTransactionDate());

        response.setCreatedAt(
                transaction.getCreatedAt());

        response.setUpdatedAt(
                transaction.getUpdatedAt());

        response.setUpdatedAt(
                transaction.getUpdatedAt());

        return response;
    }
}