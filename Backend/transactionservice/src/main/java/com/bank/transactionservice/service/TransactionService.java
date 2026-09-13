package com.bank.transactionservice.service;

import com.bank.transactionservice.dto.TransactionRequest;
import com.bank.transactionservice.dto.TransactionResponse;

import java.util.List;

public interface TransactionService {

    TransactionResponse createTransaction(
            TransactionRequest request);

    TransactionResponse getTransaction(
            Long id);

    TransactionResponse getByReference(
            String reference);

    List<TransactionResponse> getAllTransactions();

    List<TransactionResponse> getCustomerTransactions(
            Long customerId);

    List<TransactionResponse> getAccountTransactions(
            Long accountId);

    List<TransactionResponse> getTransactionsByStatus(
            String status);
}