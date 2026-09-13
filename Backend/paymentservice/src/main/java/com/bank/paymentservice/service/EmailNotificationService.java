package com.bank.paymentservice.service;

import com.bank.paymentservice.dto.PaymentResponse;

public interface EmailNotificationService {

    void sendPaymentEmail(
            PaymentResponse payment,
            String toEmail
    );

    void sendCreditAlertEmail(
            PaymentResponse payment,
            String toEmail
    );
}