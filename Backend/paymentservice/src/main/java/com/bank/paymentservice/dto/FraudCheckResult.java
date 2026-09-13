package com.bank.paymentservice.dto;

public class FraudCheckResult {

    private Double riskScore;

    private String fraudStatus;

    public FraudCheckResult() {
    }

    public FraudCheckResult(Double riskScore, String fraudStatus) {
        this.riskScore = riskScore;
        this.fraudStatus = fraudStatus;
    }

    public Double getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Double riskScore) {
        this.riskScore = riskScore;
    }

    public String getFraudStatus() {
        return fraudStatus;
    }

    public void setFraudStatus(String fraudStatus) {
        this.fraudStatus = fraudStatus;
    }
}