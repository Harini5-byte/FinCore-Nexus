package com.infosys.kyc.risk;

import org.springframework.stereotype.Service;

@Service
public class RiskService {

    public RiskResponse assessRisk(int riskScore) {

        RiskResponse response = new RiskResponse();

        if (riskScore <= 30) {
            response.setRiskLevel("LOW");
            response.setRiskScore(riskScore);
            response.setStatus("APPROVED");

        } else if (riskScore <= 70) {
            response.setRiskLevel("MEDIUM");
            response.setRiskScore(riskScore);
            response.setStatus("REVIEW");

        } else {
            response.setRiskLevel("HIGH");
            response.setRiskScore(riskScore);
            response.setStatus("REJECTED");
        }

        return response;
    }
}