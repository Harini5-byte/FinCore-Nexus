package com.infosys.kyc.compliance;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/compliance")
public class ComplianceController {

    private final ComplianceService complianceService;
    private final FinalVerificationService finalVerificationService;

    public ComplianceController(
            ComplianceService complianceService,
            FinalVerificationService finalVerificationService) {

        this.complianceService = complianceService;
        this.finalVerificationService = finalVerificationService;
    }

    @PostMapping("/check")
    public ComplianceResponse checkCompliance(
            @RequestParam boolean faceMatched,
            @RequestParam boolean livenessPassed,
            @RequestParam String riskLevel) {

        return complianceService.checkCompliance(
                faceMatched,
                livenessPassed,
                riskLevel
        );
    }

    @PostMapping("/final")
    public FinalVerificationResponse finalVerification(
            @RequestParam boolean faceMatched,
            @RequestParam boolean livenessPassed,
            @RequestParam String riskLevel,
            @RequestParam boolean compliant) {

        return finalVerificationService.verify(
                faceMatched,
                livenessPassed,
                riskLevel,
                compliant
        );
    }
}