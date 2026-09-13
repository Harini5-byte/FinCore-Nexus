package com.bank.loanservice.service;

import com.bank.loanservice.dto.LoanRequest;
import com.bank.loanservice.dto.LoanResponse;

import java.math.BigDecimal;
import java.util.List;

public interface LoanService {

    LoanResponse createLoan(LoanRequest request);

    LoanResponse getLoan(Long id);

    LoanResponse getByLoanNumber(String loanNumber);

    List<LoanResponse> getAllLoans();

    List<LoanResponse> getCustomerLoans(Long customerId);

    List<LoanResponse> getLoansByStatus(String status);

    LoanResponse approveLoan(Long id);

    LoanResponse rejectLoan(Long id);

    LoanResponse closeLoan(Long id);

    LoanResponse repayLoan(Long id, BigDecimal amount);

    void deleteLoan(Long id);
}