package com.infosys.kyc.compliance;

import lombok.Data;

@Data
public class ComplianceResponse {

    private boolean compliant;
    private String status;
    private String remarks;
}
