package com.infosys.account.service.Account;

import com.infosys.account.entity.Account.Account;

import java.util.List;
import java.util.UUID;

public interface AccountService {

    Account createAccount(Account account);

    List<Account> getAllAccounts();

    Account getAccountById(Long accountId);

    List<Account> getAccountsByCustomerId(UUID customerId);

    Account updateAccount(Long accountId, Account account);

    void deleteAccount(Long accountId);

    Account getAccountByAccountNumber(String accountNumber);

    Account updateBalance(String accountNumber,
                          Double amount,
                          String transactionType);

}