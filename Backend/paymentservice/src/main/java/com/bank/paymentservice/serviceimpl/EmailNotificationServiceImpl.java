package com.bank.paymentservice.serviceimpl;

import com.bank.paymentservice.dto.PaymentResponse;
import com.bank.paymentservice.service.EmailNotificationService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationServiceImpl implements EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailNotificationServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // =====================================================
    // SENDER NOTIFICATION (debit alert / payment outcome)
    // =====================================================

    @Override
    public void sendPaymentEmail(
            PaymentResponse payment,
            String toEmail) {

        if (toEmail == null || toEmail.trim().isEmpty()) {
            return;
        }

        try {

            String subject = buildSenderSubject(payment);
            String body = buildSenderBody(payment);

            sendEmail(toEmail, subject, body);

            System.out.println(
                    "Sender email sent successfully to: " + toEmail);

        } catch (Exception e) {

            System.err.println(
                    "Failed to send sender email notification: "
                            + e.getMessage());
        }
    }

    // =====================================================
    // RECIPIENT NOTIFICATION (credit alert)
    // =====================================================

    @Override
    public void sendCreditAlertEmail(
            PaymentResponse payment,
            String toEmail) {

        if (toEmail == null || toEmail.trim().isEmpty()) {
            return;
        }

        try {

            String subject = "Money Received - FinCore Nexus";
            String body = buildRecipientBody(payment);

            sendEmail(toEmail, subject, body);

            System.out.println(
                    "Credit alert email sent successfully to: " + toEmail);

        } catch (Exception e) {

            System.err.println(
                    "Failed to send credit alert email: "
                            + e.getMessage());
        }
    }

    // =====================================================
    // SHARED SEND LOGIC
    // =====================================================

    private void sendEmail(
            String toEmail,
            String subject,
            String body) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);
    }

    // =====================================================
    // SENDER EMAIL CONTENT
    // =====================================================

    private String buildSenderSubject(PaymentResponse payment) {

        String status = payment.getStatus();
        String fraudStatus = payment.getFraudStatus();

        if ("BLOCKED".equals(fraudStatus)) {
            return "Payment Blocked - FinCore Nexus";
        }

        if ("FAILED".equalsIgnoreCase(status)) {
            return "Payment Failed - FinCore Nexus";
        }

        if ("FLAGGED".equals(fraudStatus)) {
            return "Payment Successful (Under Review) - FinCore Nexus";
        }

        return "Payment Successful - FinCore Nexus";
    }

    private String buildSenderBody(PaymentResponse payment) {

        StringBuilder body = new StringBuilder();

        body.append("Dear Customer,\n\n");

        if ("BLOCKED".equals(payment.getFraudStatus())) {

            body.append("Your payment attempt was blocked by our ")
                    .append("fraud detection system.\n\n");

        } else if ("FAILED".equalsIgnoreCase(payment.getStatus())) {

            body.append("Unfortunately, your payment could not ")
                    .append("be processed.\n\n");

        } else if ("FLAGGED".equals(payment.getFraudStatus())) {

            body.append("Your payment was successful, but has ")
                    .append("been flagged for manual review as a ")
                    .append("precaution.\n\n");

        } else {

            body.append("Your payment was completed successfully.\n\n");
        }

        body.append("Payment Reference: ")
                .append(payment.getPaymentReference())
                .append("\n");

        body.append("Amount: Rs. ")
                .append(payment.getAmount())
                .append("\n");

        body.append("Payment Method: ")
                .append(payment.getPaymentMethod())
                .append("\n");

        body.append("Status: ")
                .append(payment.getStatus())
                .append("\n");

        if (payment.getRiskScore() != null) {

            body.append("Risk Score: ")
                    .append(payment.getRiskScore())
                    .append("\n");
        }

        body.append("\nThis is an automated message from FinCore Nexus. ")
                .append("Please do not reply to this email.");

        return body.toString();
    }

    // =====================================================
    // RECIPIENT EMAIL CONTENT
    // =====================================================

    private String buildRecipientBody(PaymentResponse payment) {

        StringBuilder body = new StringBuilder();

        body.append("Dear Customer,\n\n");

        body.append("You have received a payment in your account.\n\n");

        body.append("Payment Reference: ")
                .append(payment.getPaymentReference())
                .append("\n");

        body.append("Amount Credited: Rs. ")
                .append(payment.getAmount())
                .append("\n");

        body.append("Payment Method: ")
                .append(payment.getPaymentMethod())
                .append("\n");

        body.append("Status: ")
                .append(payment.getStatus())
                .append("\n");

        body.append("\nThis is an automated message from FinCore Nexus. ")
                .append("Please do not reply to this email.");

        return body.toString();
    }
}