package com.bank.paymentservice.controller;

import com.bank.paymentservice.dto.PaymentRequest;
import com.bank.paymentservice.dto.PaymentResponse;
import com.bank.paymentservice.service.PaymentService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(
            PaymentService paymentService) {

        this.paymentService = paymentService;
    }

    // =====================================================
    // CREATE PAYMENT
    // =====================================================

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(
            @Valid @RequestBody PaymentRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        paymentService.createPayment(
                                request
                        )
                );
    }

    // =====================================================
    // GET ALL PAYMENTS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<PaymentResponse>>
    getAllPayments() {

        return ResponseEntity.ok(
                paymentService.getAllPayments()
        );
    }

    // =====================================================
    // GET PAYMENT
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse>
    getPayment(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                paymentService.getPayment(id)
        );
    }

    // =====================================================
    // GET BY REFERENCE
    // =====================================================

    @GetMapping("/reference/{reference}")
    public ResponseEntity<PaymentResponse>
    getByReference(
            @PathVariable String reference) {

        return ResponseEntity.ok(
                paymentService.getByReference(reference)
        );
    }

    // =====================================================
    // CUSTOMER PAYMENTS
    // =====================================================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<PaymentResponse>>
    getCustomerPayments(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                paymentService.getCustomerPayments(
                        customerId
                )
        );
    }

    // =====================================================
    // ACCOUNT PAYMENTS
    // =====================================================

    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<PaymentResponse>>
    getAccountPayments(
            @PathVariable Long accountId) {

        return ResponseEntity.ok(
                paymentService.getAccountPayments(
                        accountId
                )
        );
    }

    // =====================================================
    // LOAN PAYMENTS
    // =====================================================

    @GetMapping("/loan/{loanId}")
    public ResponseEntity<List<PaymentResponse>>
    getLoanPayments(
            @PathVariable Long loanId) {

        return ResponseEntity.ok(
                paymentService.getLoanPayments(
                        loanId
                )
        );
    }

    // =====================================================
    // STATUS
    // =====================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PaymentResponse>>
    getByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                paymentService.getPaymentsByStatus(
                        status
                )
        );
    }

    // =====================================================
    // PROCESS PAYMENT
    // =====================================================

    @PutMapping("/{id}/process")
    public ResponseEntity<PaymentResponse>
    processPayment(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                paymentService.processPayment(id)
        );
    }

    // =====================================================
    // FAIL PAYMENT
    // =====================================================

    @PutMapping("/{id}/fail")
    public ResponseEntity<PaymentResponse>
    failPayment(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                paymentService.failPayment(id)
        );
    }

    // =====================================================
    // CANCEL PAYMENT
    // =====================================================

    @PutMapping("/{id}/cancel")
    public ResponseEntity<PaymentResponse>
    cancelPayment(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                paymentService.cancelPayment(id)
        );
    }

    // =====================================================
    // DELETE PAYMENT
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String>
    deletePayment(
            @PathVariable Long id) {

        paymentService.deletePayment(id);

        return ResponseEntity.ok(
                "Payment deleted successfully"
        );
    }
}