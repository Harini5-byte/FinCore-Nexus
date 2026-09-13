package com.bank.paymentservice.repository;

import com.bank.paymentservice.entity.Payment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    Optional<Payment> findByPaymentReference(
            String paymentReference
    );

    List<Payment> findByCustomerId(
            Long customerId
    );

    List<Payment> findByAccountId(
            Long accountId
    );

    List<Payment> findByRecipientAccountId(
            Long recipientAccountId
    );

    List<Payment> findByLoanId(
            Long loanId
    );

    List<Payment> findByStatus(
            String status
    );

    List<Payment> findByAccountIdOrRecipientAccountId(
            Long accountId,
            Long recipientAccountId
    );

    List<Payment> findByAccountIdInOrRecipientAccountIdIn(
            List<Long> accountIds,
            List<Long> recipientAccountIds
    );
}