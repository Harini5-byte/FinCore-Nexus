package com.infosys.kyc.risk;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/risk")
public class RiskController {

    private final RiskService riskService;

    public RiskController(RiskService riskService) {
        this.riskService = riskService;
    }

    @PostMapping("/assess")
    public RiskResponse assessRisk(@RequestParam int riskScore) {
        return riskService.assessRisk(riskScore);
    }
}