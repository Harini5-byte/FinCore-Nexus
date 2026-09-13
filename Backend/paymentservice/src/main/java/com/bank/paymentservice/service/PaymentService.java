package com.bank.paymentservice.service;

import com.bank.paymentservice.dto.PaymentRequest;
import com.bank.paymentservice.dto.PaymentResponse;

import java.util.List;

public interface PaymentService {

    PaymentResponse createPayment(
            PaymentRequest request
    );

    PaymentResponse getPayment(
            Long id
    );

    PaymentResponse getByReference(
            String reference
    );

    List<PaymentResponse> getAllPayments();

    List<PaymentResponse> getCustomerPayments(
            Long customerId
    );

    List<PaymentResponse> getAccountPayments(
            Long accountId
    );

    List<PaymentResponse> getLoanPayments(
            Long loanId
    );

    List<PaymentResponse> getPaymentsByStatus(
            String status
    );

    PaymentResponse processPayment(
            Long id
    );

    PaymentResponse failPayment(
            Long id
    );

    PaymentResponse cancelPayment(
            Long id
    );

    void deletePayment(
            Long id
    );
}