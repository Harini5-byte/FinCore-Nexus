package com.infosys.account.controller.Account;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.infosys.account.entity.Account.Account;
import com.infosys.account.service.Account.AccountService;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
public class AccountController {
    @Autowired
    private AccountService accountService;

    @GetMapping("/account")
    public String account() {
        return "Welcome to Account Microservice";
    }
    @PostMapping("/add")
    public Account addAccount(@RequestBody Account account) {

        return accountService.createAccount(account);

    }
    @GetMapping("/accounts")
    public List<Account> getAllAccounts(){

        return accountService.getAllAccounts();

    }
    @GetMapping("/accounts/{id}")
    public Account getAccountById(@PathVariable Long id){

        return accountService.getAccountById(id);

    }
    @PutMapping("/accounts/{id}")
    public Account updateAccount(@PathVariable Long id, @RequestBody Account account){

        return accountService.updateAccount(id, account);

    }
    @DeleteMapping("/accounts/{id}")
    public String deleteAccount(@PathVariable Long id){

        accountService.deleteAccount(id);

        return "Account deleted successfully";

    }
}
