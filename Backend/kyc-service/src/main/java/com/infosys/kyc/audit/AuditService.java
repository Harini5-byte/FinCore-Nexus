package com.infosys.kyc.audit;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditService {

    private final AuditRepository auditRepository;

    public AuditService(AuditRepository auditRepository) {
        this.auditRepository = auditRepository;
    }

    // Create new audit
    public Audit createAudit(Audit audit) {

        if (audit.getTimestamp() == null) {
            audit.setTimestamp(LocalDateTime.now());
        }

        return auditRepository.save(audit);
    }

    // Get all audits
    public List<Audit> getAllAudits() {
        return auditRepository.findAll();
    }

    // Get audit by ID
    public Audit getAuditById(Long id) {
        return auditRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Audit not found"));
    }

    // Get audits by KYC ID
    public List<Audit> getAuditsByKycId(Long kycId) {
        return auditRepository.findByKycId(kycId);
    }

    // Automatically create a new audit when KYC is updated
    public Audit updateAuditByKycId(
            Long kycId,
            Long customerId,
            String status,
            String action,
            String remarks) {

        Audit audit = new Audit();

        audit.setKycId(kycId);
        audit.setCustomerId(customerId);
        audit.setStatus(status);
        audit.setAction(action);
        audit.setRemarks(remarks);
        audit.setTimestamp(LocalDateTime.now());

        return auditRepository.save(audit);
    }

    // Get audits by Customer ID
    public List<Audit> getAuditsByCustomerId(Long customerId) {
        return auditRepository.findByCustomerId(customerId);
    }

    // New: used for attempt-limiting
    public List<Audit> getAuditsByCustomerIdAndAction(Long customerId, String action) {
        return auditRepository.findByCustomerIdAndAction(customerId, action);
    }

    // Update existing audit manually
    public Audit updateAudit(Long id, Audit updatedAudit) {

        Audit existingAudit = auditRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Audit not found"));

        existingAudit.setKycId(updatedAudit.getKycId());
        existingAudit.setCustomerId(updatedAudit.getCustomerId());
        existingAudit.setAction(updatedAudit.getAction());
        existingAudit.setStatus(updatedAudit.getStatus());
        existingAudit.setRemarks(updatedAudit.getRemarks());

        return auditRepository.save(existingAudit);
    }

    // Delete audit
    public void deleteAudit(Long id) {

        if (!auditRepository.existsById(id)) {
            throw new RuntimeException("Audit not found");
        }

        auditRepository.deleteById(id);
    }
}