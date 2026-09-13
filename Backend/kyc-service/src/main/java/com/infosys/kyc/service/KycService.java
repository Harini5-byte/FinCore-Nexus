package com.infosys.kyc.service;

import com.infosys.kyc.audit.Audit;
import com.infosys.kyc.audit.AuditService;
import com.infosys.kyc.entity.Kyc;
import com.infosys.kyc.exception.TooManyAttemptsException;
import com.infosys.kyc.repository.KycRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class KycService {

    private final KycRepository kycRepository;
    private final AuditService auditService;

    // How many submission attempts a single customer gets within the window below.
    private static final int MAX_ATTEMPTS = 3;

    // The rolling time window the limit applies to.
    private static final int WINDOW_HOURS = 24;

    public KycService(
            KycRepository kycRepository,
            AuditService auditService) {

        this.kycRepository = kycRepository;
        this.auditService = auditService;
    }

    public Kyc saveKyc(Kyc kyc) {

        // Gate: block this submission if the customer has already
        // submitted too many times recently.
        if (hasTooManyRecentAttempts(kyc.getCustomerId())) {

            Audit blockedAudit = new Audit();
            blockedAudit.setCustomerId(kyc.getCustomerId());
            blockedAudit.setAction("KYC_SUBMISSION_BLOCKED");
            blockedAudit.setStatus("BLOCKED");
            blockedAudit.setRemarks(
                    "Blocked: more than " + MAX_ATTEMPTS + " KYC submissions within "
                            + WINDOW_HOURS + " hours");
            auditService.createAudit(blockedAudit);

            throw new TooManyAttemptsException(
                    "You have submitted KYC too many times recently. "
                            + "Please wait before trying again, or contact support.");
        }

        Kyc savedKyc = kycRepository.save(kyc);

        Audit audit = new Audit();
        audit.setKycId(savedKyc.getKycId());
        audit.setCustomerId(savedKyc.getCustomerId());
        audit.setAction("KYC_SUBMITTED");
        audit.setStatus("PENDING");
        audit.setRemarks("KYC submitted for verification");

        auditService.createAudit(audit);

        return savedKyc;
    }

    /**
     * True if this customer already has MAX_ATTEMPTS or more "KYC_SUBMITTED"
     * audit entries within the last WINDOW_HOURS.
     */
    private boolean hasTooManyRecentAttempts(Long customerId) {

        if (customerId == null) {
            return false;
        }

        List<Audit> priorSubmissions =
                auditService.getAuditsByCustomerIdAndAction(customerId, "KYC_SUBMITTED");

        LocalDateTime windowStart = LocalDateTime.now().minusHours(WINDOW_HOURS);

        long recentCount = priorSubmissions.stream()
                .filter(a -> a.getTimestamp() != null && a.getTimestamp().isAfter(windowStart))
                .count();

        return recentCount >= MAX_ATTEMPTS;
    }

    public Kyc getKycById(Long id) {
        return kycRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("KYC not found"));
    }

    public List<Kyc> getAllKyc() {
        return kycRepository.findAll();
    }

    public List<Kyc> getKycByCustomerId(Long customerId) {
        return kycRepository.findByCustomerId(customerId);
    }

    public Kyc updateKyc(Long id, Kyc updatedKyc) {

        Kyc existingKyc = kycRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("KYC not found"));

        existingKyc.setCustomerId(updatedKyc.getCustomerId());
        existingKyc.setFullName(updatedKyc.getFullName());
        existingKyc.setAadhaarNumber(updatedKyc.getAadhaarNumber());
        existingKyc.setPanNumber(updatedKyc.getPanNumber());
        existingKyc.setDateOfBirth(updatedKyc.getDateOfBirth());
        existingKyc.setAddress(updatedKyc.getAddress());
        existingKyc.setStatus(updatedKyc.getStatus());
        existingKyc.setRemarks(updatedKyc.getRemarks());

        Kyc savedKyc = kycRepository.save(existingKyc);

        // Automatically update audit when KYC is approved
        if ("APPROVED".equalsIgnoreCase(savedKyc.getStatus())) {

            auditService.updateAuditByKycId(
                    savedKyc.getKycId(),
                    savedKyc.getCustomerId(),
                    "APPROVED",
                    "KYC_APPROVED",
                    "KYC approved successfully"
            );
        }

        return savedKyc;
    }

    public void deleteKyc(Long id) {
        if (!kycRepository.existsById(id)) {
            throw new RuntimeException("KYC not found");
        }

        kycRepository.deleteById(id);
    }
}