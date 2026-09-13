package com.infosys.account.controller.Account;

import com.infosys.account.dto.Account.BalanceUpdateRequest;
import com.infosys.account.entity.Account.Account;
import com.infosys.account.service.Account.AccountService;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

import java.util.List;


@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    // Welcome API
    @GetMapping("/account")
    public String home() {
        return "Welcome to Account Service";
    }


    // Create Account
    @PostMapping("/add")
    public Account createAccount(@RequestBody Account account) {
        return accountService.createAccount(account);
    }


    // Get All Accounts
    @GetMapping("/accounts")
    public List<Account> getAllAccounts() {
        return accountService.getAllAccounts();
    }


    // Get Account By ID
    @GetMapping("/accounts/{id}")
    public Account getAccountById(@PathVariable Long id) {
        return accountService.getAccountById(id);
    }


    // Get Accounts By Customer ID
    @GetMapping("/accounts/customers/{customerId}")
    public List<Account> getAccountsByCustomerId(
            @PathVariable UUID customerId) {

        return accountService.getAccountsByCustomerId(customerId);
    }


    // Update Account
    @PutMapping("/accounts/{id}")
    public Account updateAccount(
            @PathVariable Long id,
            @RequestBody Account account) {

        return accountService.updateAccount(id, account);
    }


    // Delete Account
    @DeleteMapping("/accounts/{id}")
    public String deleteAccount(@PathVariable Long id) {

        accountService.deleteAccount(id);

        return "Account Deleted Successfully";
    }


    // Get Account By Account Number
    @GetMapping("/accounts/accountNumber/{accountNumber}")
    public Account getAccountByAccountNumber(
            @PathVariable String accountNumber) {

        return accountService.getAccountByAccountNumber(accountNumber);
    }


    // Update Account Balance
    @PutMapping("/accounts/updateBalance/{accountNumber}")
    public Account updateBalance(
            @PathVariable String accountNumber,
            @RequestBody BalanceUpdateRequest request) {

        return accountService.updateBalance(
                accountNumber,
                request.getAmount(),
                request.getTransactionType()
        );
    }
}