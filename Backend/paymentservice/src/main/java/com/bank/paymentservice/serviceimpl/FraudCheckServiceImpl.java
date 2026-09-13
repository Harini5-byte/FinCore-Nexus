package com.bank.paymentservice.serviceimpl;

import com.bank.paymentservice.dto.FraudCheckResult;
import com.bank.paymentservice.dto.PaymentRequest;
import com.bank.paymentservice.service.FraudCheckService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalTime;

@Service
public class FraudCheckServiceImpl implements FraudCheckService {

    // Real UPI apps cap a single transaction around this amount
    private static final BigDecimal UPI_LIMIT = new BigDecimal("100000");

    // Above this amount, any transfer is treated as high-value
    private static final BigDecimal HIGH_VALUE_LIMIT = new BigDecimal("500000");

    private static final BigDecimal MEDIUM_VALUE_LIMIT = new BigDecimal("100000");

    @Override
    public FraudCheckResult evaluate(PaymentRequest request) {

        double riskScore = 0.0;

        BigDecimal amount = request.getAmount();
        String method = request.getPaymentMethod();

        // Rule 1: Large amount = higher risk
        if (amount.compareTo(HIGH_VALUE_LIMIT) >= 0) {
            riskScore += 0.4;
        } else if (amount.compareTo(MEDIUM_VALUE_LIMIT) >= 0) {
            riskScore += 0.2;
        }

        // Rule 2: UPI is meant for small daily payments.
        // A huge amount over UPI is suspicious.
        if (method != null
                && method.equalsIgnoreCase("UPI")
                && amount.compareTo(UPI_LIMIT) > 0) {
            riskScore += 0.3;
        }

        // Rule 3: Payments made very late at night (12 AM - 5 AM)
        // are statistically more likely to be fraud.
        int currentHour = LocalTime.now().getHour();
        if (currentHour >= 0 && currentHour < 5) {
            riskScore += 0.2;
        }

        // Cap the score at 1.0 (100%)
        if (riskScore > 1.0) {
            riskScore = 1.0;
        }

        String status;
        if (riskScore >= 0.7) {
            status = "BLOCKED";
        } else if (riskScore >= 0.4) {
            status = "FLAGGED";
        } else {
            status = "PASSED";
        }

        return new FraudCheckResult(riskScore, status);
    }
}