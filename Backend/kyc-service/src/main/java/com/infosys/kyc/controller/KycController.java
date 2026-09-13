package com.infosys.kyc.controller;

import com.infosys.kyc.entity.Kyc;
import com.infosys.kyc.service.KycService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/kyc")
public class KycController {

    private final KycService kycService;

    // The Admin panel must send this exact key in a header
    // called "X-Admin-Key" to approve, reject, or delete a
    // KYC record. Without it, the request is refused.
    @Value("${admin.api.key}")
    private String adminApiKey;

    public KycController(KycService kycService) {
        this.kycService = kycService;
    }

    // =====================================================
    // CREATE KYC
    // Anyone can submit their own KYC (through the wizard),
    // so this endpoint stays open.
    // =====================================================

    @PostMapping
    public ResponseEntity<Kyc> createKyc(
            @Valid @RequestBody Kyc kyc) {

        return ResponseEntity.ok(
                kycService.saveKyc(kyc)
        );
    }

    // =====================================================
    // GET ALL / GET BY ID / GET BY CUSTOMER
    // Read-only, kept open for simplicity in this project.
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Kyc>> getAllKyc() {

        return ResponseEntity.ok(
                kycService.getAllKyc()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Kyc> getKycById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                kycService.getKycById(id)
        );
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Kyc>> getKycByCustomerId(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                kycService.getKycByCustomerId(customerId)
        );
    }

    // =====================================================
    // UPDATE KYC (this is how status becomes APPROVED /
    // REJECTED — the sensitive action, now protected)
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateKyc(
            @PathVariable Long id,
            @Valid @RequestBody Kyc kyc,
            @RequestHeader(
                    value = "X-Admin-Key",
                    required = false
            ) String providedKey) {

        // If someone is trying to APPROVE or REJECT,
        // require the correct admin key.
        boolean isSensitiveChange =
                "APPROVED".equalsIgnoreCase(kyc.getStatus())
                        || "REJECTED".equalsIgnoreCase(kyc.getStatus());

        if (isSensitiveChange &&
                !adminApiKey.equals(providedKey)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Not authorized to approve or reject KYC records.");
        }

        return ResponseEntity.ok(
                kycService.updateKyc(id, kyc)
        );
    }

    // =====================================================
    // DELETE KYC (also sensitive — always requires the key)
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteKyc(
            @PathVariable Long id,
            @RequestHeader(
                    value = "X-Admin-Key",
                    required = false
            ) String providedKey) {

        if (!adminApiKey.equals(providedKey)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Not authorized to delete KYC records.");
        }

        kycService.deleteKyc(id);

        return ResponseEntity.ok(
                "KYC deleted successfully"
        );
    }
}