package com.infosys.kyc.compliance;

import org.springframework.stereotype.Service;

@Service
public class ComplianceService {

    public ComplianceResponse checkCompliance(
            boolean faceMatched,
            boolean livenessPassed,
            String riskLevel) {

        ComplianceResponse response = new ComplianceResponse();

        if (faceMatched
                && livenessPassed
                && "LOW".equalsIgnoreCase(riskLevel)) {

            response.setCompliant(true);
            response.setStatus("COMPLIANT");
            response.setRemarks("KYC passed all compliance checks");

        } else {

            response.setCompliant(false);
            response.setStatus("NON_COMPLIANT");
            response.setRemarks("KYC failed compliance checks");
        }

        return response;
    }
}
