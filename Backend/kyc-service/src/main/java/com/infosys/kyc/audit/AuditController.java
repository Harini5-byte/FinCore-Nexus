package com.infosys.kyc.audit;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/audit")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @PostMapping
    public ResponseEntity<Audit> createAudit(@RequestBody Audit audit) {
        return ResponseEntity.ok(auditService.createAudit(audit));
    }
    @PostMapping("/kyc")
    public ResponseEntity<Audit> createAuditForKyc(
            @RequestParam Long kycId,
            @RequestParam Long customerId,
            @RequestParam String status,
            @RequestParam String action,
            @RequestParam String remarks) {

        return ResponseEntity.ok(
                auditService.updateAuditByKycId(
                        kycId,
                        customerId,
                        status,
                        action,
                        remarks
                )
        );
    }

    @GetMapping
    public ResponseEntity<List<Audit>> getAllAudits() {
        return ResponseEntity.ok(auditService.getAllAudits());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Audit> getAuditById(@PathVariable Long id) {
        return ResponseEntity.ok(auditService.getAuditById(id));
    }

    @GetMapping("/kyc/{kycId}")
    public ResponseEntity<List<Audit>> getAuditsByKycId(
            @PathVariable Long kycId) {
        return ResponseEntity.ok(auditService.getAuditsByKycId(kycId));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Audit>> getAuditsByCustomerId(
            @PathVariable Long customerId) {
        return ResponseEntity.ok(
                auditService.getAuditsByCustomerId(customerId)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Audit> updateAudit(
            @PathVariable Long id,
            @RequestBody Audit audit) {
        return ResponseEntity.ok(
                auditService.updateAudit(id, audit)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAudit(@PathVariable Long id) {
        auditService.deleteAudit(id);
        return ResponseEntity.ok("Audit deleted successfully");
    }
}