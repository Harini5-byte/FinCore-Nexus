package com.bank.accountservice.controller;

import com.bank.accountservice.dto.AccountRequest;
import com.bank.accountservice.dto.AccountResponse;
import com.bank.accountservice.service.AccountService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "http://localhost:5173")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    // =====================================================
    // CREATE ACCOUNT
    // =====================================================

    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
            @Valid @RequestBody AccountRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(accountService.createAccount(request));
    }

    // =====================================================
    // REQUEST NEW ACCOUNT
    // =====================================================

    @PostMapping("/request")
    public ResponseEntity<AccountResponse> requestAccount(
            @Valid @RequestBody AccountRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(accountService.requestAccount(request));
    }

    // =====================================================
    // GET ALL ACCOUNTS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<AccountResponse>> getAllAccounts() {

        return ResponseEntity.ok(
                accountService.getAllAccounts()
        );
    }

    // =====================================================
    // GET ACCOUNT BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> getAccount(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                accountService.getAccount(id)
        );
    }

    // =====================================================
    // GET ACCOUNT BY ACCOUNT NUMBER
    // =====================================================

    @GetMapping("/number/{accountNumber}")
    public ResponseEntity<AccountResponse> getByAccountNumber(
            @PathVariable String accountNumber) {

        return ResponseEntity.ok(
                accountService.getByAccountNumber(accountNumber)
        );
    }

    // =====================================================
    // GET CUSTOMER ACCOUNTS
    // =====================================================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<AccountResponse>> getCustomerAccounts(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                accountService.getCustomerAccounts(customerId)
        );
    }

    // =====================================================
    // APPROVE ACCOUNT
    // =====================================================

    @PutMapping("/{id}/approve")
    public ResponseEntity<AccountResponse> approveAccount(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                accountService.approveAccount(id)
        );
    }

    // =====================================================
    // REJECT ACCOUNT
    // =====================================================

    @PutMapping("/{id}/reject")
    public ResponseEntity<AccountResponse> rejectAccount(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                accountService.rejectAccount(id)
        );
    }

    // =====================================================
    // LOAN CREDIT
    // =====================================================

    @PutMapping("/{id}/loan-credit")
    public ResponseEntity<AccountResponse> creditLoan(
            @PathVariable Long id,
            @RequestParam BigDecimal amount) {

        return ResponseEntity.ok(
                accountService.creditLoan(id, amount)
        );
    }

    // =====================================================
    // DEPOSIT
    // =====================================================

    @PutMapping("/{id}/deposit")
    public ResponseEntity<AccountResponse> deposit(
            @PathVariable Long id,
            @RequestParam BigDecimal amount) {

        return ResponseEntity.ok(
                accountService.deposit(id, amount)
        );
    }

    // =====================================================
    // WITHDRAW
    // =====================================================

    @PutMapping("/{id}/withdraw")
    public ResponseEntity<AccountResponse> withdraw(
            @PathVariable Long id,
            @RequestParam BigDecimal amount) {

        return ResponseEntity.ok(
                accountService.withdraw(id, amount)
        );
    }

    // =====================================================
    // ACTIVATE
    // =====================================================

    @PutMapping("/{id}/activate")
    public ResponseEntity<AccountResponse> activate(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                accountService.activate(id)
        );
    }

    // =====================================================
    // DEACTIVATE
    // =====================================================

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<AccountResponse> deactivate(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                accountService.deactivate(id)
        );
    }

    // =====================================================
    // DELETE
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAccount(
            @PathVariable Long id) {

        accountService.deleteAccount(id);

        return ResponseEntity.ok(
                "Account deleted successfully"
        );
    }
}