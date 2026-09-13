package com.infosys.kyc.compliance;

import org.springframework.stereotype.Service;

@Service
public class FinalVerificationService {

    public FinalVerificationResponse verify(
            boolean faceMatched,
            boolean livenessPassed,
            String riskLevel,
            boolean compliant) {

        FinalVerificationResponse response =
                new FinalVerificationResponse();

        if (faceMatched
                && livenessPassed
                && "LOW".equalsIgnoreCase(riskLevel)
                && compliant) {

            response.setVerificationStatus("VERIFIED");
            response.setRemarks("KYC verification completed successfully");

        } else {

            response.setVerificationStatus("REJECTED");
            response.setRemarks("KYC verification failed");
        }

        return response;
    }
}

