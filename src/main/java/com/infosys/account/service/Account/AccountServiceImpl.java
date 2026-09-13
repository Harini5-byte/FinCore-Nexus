package com.infosys.account.service.Account;

import com.infosys.account.client.CustomerClient;
import com.infosys.account.dto.Account.CustomerDTO;
import com.infosys.account.Repository.Account.AccountRepository;
import com.infosys.account.entity.Account.Account;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final CustomerClient customerClient;

    public AccountServiceImpl(AccountRepository accountRepository,
                              CustomerClient customerClient) {
        this.accountRepository = accountRepository;
        this.customerClient = customerClient;
    }

    @Override
    public Account createAccount(Account account) {

        // Fetch customer details from Customer Microservice using Feign Client
        CustomerDTO customer = customerClient.getCustomerById(account.getCustomerId());

        // Set Account Holder Name from Customer Service
        account.setAccountHolderName(customer.getName());

        // Generate Account Number
        if (account.getAccountNumber() == null || account.getAccountNumber().isEmpty()) {
            account.setAccountNumber("ACC" + System.currentTimeMillis());
        }

        // Set Default Status
        if (account.getStatus() == null || account.getStatus().isEmpty()) {
            account.setStatus("ACTIVE");
        }

        return accountRepository.save(account);
    }

    @Override
    public List<Account> getAllAccounts() {

        List<Account> accounts = new ArrayList<>();
        accountRepository.findAll().forEach(accounts::add);

        return accounts;
    }

    @Override
    public Account getAccountById(Long accountId) {

        return accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account Not Found"));
    }

    @Override
    public Account updateAccount(Long accountId, Account account) {

        Account existingAccount = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account Not Found"));

        existingAccount.setAccountHolderName(account.getAccountHolderName());
        existingAccount.setAccountNumber(account.getAccountNumber());
        existingAccount.setAccountType(account.getAccountType());
        existingAccount.setBalance(account.getBalance());
        existingAccount.setStatus(account.getStatus());

        return accountRepository.save(existingAccount);
    }

    @Override
    public void deleteAccount(Long accountId) {

        Account existingAccount = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account Not Found"));

        accountRepository.delete(existingAccount);
    }

    // ==============================================
    // APIs used by Transaction Service (Feign Client)
    // ==============================================

    @Override
    public Account getAccountByAccountNumber(String accountNumber) {

        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account Not Found"));
    }

    @Override
    public Account updateBalance(String accountNumber,
                                 Double amount,
                                 String transactionType) {

        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account Not Found"));

        switch (transactionType.toUpperCase()) {

            case "DEPOSIT":
                account.setBalance(account.getBalance() + amount);
                break;

            case "WITHDRAW":
            case "TRANSFER":

                if (account.getBalance() < amount) {
                    throw new RuntimeException("Insufficient Balance");
                }

                account.setBalance(account.getBalance() - amount);
                break;

            default:
                throw new RuntimeException("Invalid Transaction Type");
        }

        return accountRepository.save(account);
    }
    @Override
    public List<Account> getAccountsByCustomerId(UUID customerId) {
        return accountRepository.findByCustomerId(customerId);
    }

}