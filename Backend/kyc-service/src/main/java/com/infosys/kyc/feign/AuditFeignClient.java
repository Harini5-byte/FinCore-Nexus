package com.infosys.kyc.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "audit-service")
public interface AuditFeignClient {

    @PostMapping("/audit/kyc")
    void createAudit(
            @RequestParam Long kycId,
            @RequestParam Long customerId,
            @RequestParam String status,
            @RequestParam String action,
            @RequestParam String remarks
    );
}