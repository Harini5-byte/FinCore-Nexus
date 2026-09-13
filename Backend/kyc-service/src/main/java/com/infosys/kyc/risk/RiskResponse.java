package com.infosys.kyc.risk;

import lombok.Data;

@Data
public class RiskResponse {

    private String riskLevel;
    private int riskScore;
    private String status;
}