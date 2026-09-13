
        package com.bank.transactionservice.controller;

import com.bank.transactionservice.dto.TransactionRequest;
import com.bank.transactionservice.dto.TransactionResponse;
import com.bank.transactionservice.service.TransactionService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(
            TransactionService transactionService) {

        this.transactionService =
                transactionService;
    }

    // =========================================================
    // CREATE TRANSACTION
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createTransaction(
            @Valid @RequestBody TransactionRequest request) {

        try {

            TransactionResponse response =
                    transactionService.createTransaction(
                            request
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            Map.of(
                                    "error",
                                    e.getMessage()
                            )
                    );
        }
    }

    // =========================================================
    // GET ALL TRANSACTIONS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<TransactionResponse>>
    getAllTransactions() {

        return ResponseEntity.ok(
                transactionService
                        .getAllTransactions()
        );
    }

    // =========================================================
    // GET TRANSACTION BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse>
    getTransaction(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                transactionService
                        .getTransaction(id)
        );
    }

    // =========================================================
    // GET TRANSACTION BY REFERENCE
    // =========================================================

    @GetMapping("/reference/{reference}")
    public ResponseEntity<TransactionResponse>
    getByReference(
            @PathVariable String reference) {

        return ResponseEntity.ok(
                transactionService
                        .getByReference(reference)
        );
    }

    // =========================================================
    // GET CUSTOMER TRANSACTIONS
    // =========================================================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<TransactionResponse>>
    getCustomerTransactions(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                transactionService
                        .getCustomerTransactions(
                                customerId
                        )
        );
    }

    // =========================================================
    // GET ACCOUNT TRANSACTIONS
    // =========================================================

    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<TransactionResponse>>
    getAccountTransactions(
            @PathVariable Long accountId) {

        return ResponseEntity.ok(
                transactionService
                        .getAccountTransactions(
                                accountId
                        )
        );
    }

    // =========================================================
    // GET TRANSACTIONS BY STATUS
    // =========================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<TransactionResponse>>
    getByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                transactionService
                        .getTransactionsByStatus(
                                status
                        )
        );
    }
}
