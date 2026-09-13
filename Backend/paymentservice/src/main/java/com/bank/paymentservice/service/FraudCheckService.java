
package com.bank.paymentservice.service;

import com.bank.paymentservice.dto.FraudCheckResult;
import com.bank.paymentservice.dto.PaymentRequest;

public interface FraudCheckService {

    FraudCheckResult evaluate(
            PaymentRequest request
    );
}