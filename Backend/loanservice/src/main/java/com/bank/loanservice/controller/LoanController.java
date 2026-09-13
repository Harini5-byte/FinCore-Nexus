package com.bank.loanservice.controller;

import com.bank.loanservice.dto.LoanRequest;
import com.bank.loanservice.dto.LoanResponse;
import com.bank.loanservice.service.LoanService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/loans")
@CrossOrigin(origins = "http://localhost:5173")
public class LoanController {

    private final LoanService loanService;

    public LoanController(
            LoanService loanService) {

        this.loanService = loanService;
    }

    // =====================================================
    // CREATE / REQUEST LOAN
    // =====================================================

    @PostMapping
    public ResponseEntity<LoanResponse> createLoan(
            @Valid
            @RequestBody
            LoanRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        loanService.createLoan(request)
                );
    }

    // =====================================================
    // GET ALL
    // =====================================================

    @GetMapping
    public ResponseEntity<List<LoanResponse>>
    getAllLoans() {

        return ResponseEntity.ok(
                loanService.getAllLoans()
        );
    }

    // =====================================================
    // GET BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<LoanResponse> getLoan(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                loanService.getLoan(id)
        );
    }

    // =====================================================
    // GET BY LOAN NUMBER
    // =====================================================

    @GetMapping("/number/{loanNumber}")
    public ResponseEntity<LoanResponse>
    getByLoanNumber(
            @PathVariable String loanNumber) {

        return ResponseEntity.ok(
                loanService.getByLoanNumber(
                        loanNumber
                )
        );
    }

    // =====================================================
    // GET CUSTOMER LOANS
    // =====================================================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<LoanResponse>>
    getCustomerLoans(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                loanService.getCustomerLoans(
                        customerId
                )
        );
    }

    // =====================================================
    // GET BY STATUS
    // =====================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<LoanResponse>>
    getLoansByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                loanService.getLoansByStatus(
                        status
                )
        );
    }

    // =====================================================
    // APPROVE
    // =====================================================

    @PutMapping("/{id}/approve")
    public ResponseEntity<LoanResponse>
    approveLoan(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                loanService.approveLoan(id)
        );
    }

    // =====================================================
    // REJECT
    // =====================================================

    @PutMapping("/{id}/reject")
    public ResponseEntity<LoanResponse>
    rejectLoan(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                loanService.rejectLoan(id)
        );
    }

    // =====================================================
    // CLOSE
    // =====================================================

    @PutMapping("/{id}/close")
    public ResponseEntity<LoanResponse>
    closeLoan(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                loanService.closeLoan(id)
        );
    }

    // =====================================================
    // REPAY
    // =====================================================

    @PutMapping("/{id}/repay")
    public ResponseEntity<LoanResponse>
    repayLoan(
            @PathVariable Long id,
            @RequestParam BigDecimal amount) {

        return ResponseEntity.ok(
                loanService.repayLoan(
                        id,
                        amount
                )
        );
    }

    // =====================================================
    // DELETE
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String>
    deleteLoan(
            @PathVariable Long id) {

        loanService.deleteLoan(id);

        return ResponseEntity.ok(
                "Loan deleted successfully"
        );
    }
}