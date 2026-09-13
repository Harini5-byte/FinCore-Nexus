package com.bank.loanservice.repository;

import com.bank.loanservice.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LoanRepository extends JpaRepository<Loan, Long> {

    Optional<Loan> findByLoanNumber(String loanNumber);

    List<Loan> findByCustomerId(Long customerId);

    List<Loan> findByStatus(String status);
}