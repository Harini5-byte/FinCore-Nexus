package com.bank.accountservice.service;

import com.bank.accountservice.dto.AccountRequest;
import com.bank.accountservice.dto.AccountResponse;

import java.math.BigDecimal;
import java.util.List;

public interface AccountService {

    AccountResponse createAccount(AccountRequest request);

    AccountResponse requestAccount(AccountRequest request);

    AccountResponse approveAccount(Long id);

    AccountResponse rejectAccount(Long id);

    AccountResponse getAccount(Long id);

    AccountResponse getByAccountNumber(String accountNumber);

    List<AccountResponse> getCustomerAccounts(Long customerId);

    List<AccountResponse> getAllAccounts();

    AccountResponse deposit(Long id, BigDecimal amount);

    AccountResponse withdraw(Long id, BigDecimal amount);

    AccountResponse creditLoan(Long id, BigDecimal amount);

    AccountResponse activate(Long id);

    AccountResponse deactivate(Long id);

    void deleteAccount(Long id);
}