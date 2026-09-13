package com.infosys.kyc.audit;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditServiceTest {

    @Mock
    private AuditRepository auditRepository;

    @InjectMocks
    private AuditService auditService;

    // 1. Create Audit
    @Test
    void createAudit_shouldSaveAudit() {

        Audit audit = new Audit();
        audit.setKycId(5L);
        audit.setCustomerId(102L);
        audit.setStatus("APPROVED");
        audit.setAction("KYC_APPROVED");
        audit.setRemarks("KYC approved successfully");

        when(auditRepository.save(any(Audit.class)))
                .thenReturn(audit);

        Audit result = auditService.createAudit(audit);

        assertNotNull(result);
        assertEquals(5L, result.getKycId());
        assertEquals(102L, result.getCustomerId());
        assertEquals("APPROVED", result.getStatus());

        verify(auditRepository, times(1)).save(audit);
    }

    // 2. Get Audit By ID
    @Test
    void getAuditById_shouldReturnAudit() {

        Audit audit = new Audit();
        audit.setKycId(5L);
        audit.setCustomerId(102L);

        when(auditRepository.findById(1L))
                .thenReturn(Optional.of(audit));

        Audit result = auditService.getAuditById(1L);

        assertNotNull(result);
        assertEquals(5L, result.getKycId());
        assertEquals(102L, result.getCustomerId());

        verify(auditRepository, times(1)).findById(1L);
    }

    // 3. Get Audit By ID - Not Found
    @Test
    void getAuditById_shouldThrowExceptionWhenNotFound() {

        when(auditRepository.findById(999L))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> auditService.getAuditById(999L)
        );

        assertEquals("Audit not found", exception.getMessage());

        verify(auditRepository, times(1)).findById(999L);
    }

    // 4. Get Audits By KYC ID
    @Test
    void getAuditsByKycId_shouldReturnAudits() {

        Audit audit = new Audit();
        audit.setKycId(5L);

        List<Audit> audits = List.of(audit);

        when(auditRepository.findByKycId(5L))
                .thenReturn(audits);

        List<Audit> result = auditService.getAuditsByKycId(5L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(5L, result.get(0).getKycId());

        verify(auditRepository, times(1)).findByKycId(5L);
    }

    // 5. Update Audit By KYC ID - Creates New Audit
    @Test
    void updateAuditByKycId_shouldCreateNewAudit() {

        when(auditRepository.save(any(Audit.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Audit result = auditService.updateAuditByKycId(
                5L,
                102L,
                "APPROVED",
                "KYC_APPROVED",
                "KYC approved successfully"
        );

        assertNotNull(result);
        assertEquals(5L, result.getKycId());
        assertEquals(102L, result.getCustomerId());
        assertEquals("APPROVED", result.getStatus());
        assertEquals("KYC_APPROVED", result.getAction());
        assertEquals("KYC approved successfully", result.getRemarks());
        assertNotNull(result.getTimestamp());

        verify(auditRepository, times(1))
                .save(any(Audit.class));
    }

    // 6. Get Audits By Customer ID
    @Test
    void getAuditsByCustomerId_shouldReturnAudits() {

        Audit audit = new Audit();
        audit.setCustomerId(102L);

        List<Audit> audits = List.of(audit);

        when(auditRepository.findByCustomerId(102L))
                .thenReturn(audits);

        List<Audit> result = auditService.getAuditsByCustomerId(102L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(102L, result.get(0).getCustomerId());

        verify(auditRepository, times(1))
                .findByCustomerId(102L);
    }

    // 7. Delete Audit - Existing
    @Test
    void deleteAudit_shouldDeleteExistingAudit() {

        when(auditRepository.existsById(1L))
                .thenReturn(true);

        auditService.deleteAudit(1L);

        verify(auditRepository, times(1))
                .existsById(1L);

        verify(auditRepository, times(1))
                .deleteById(1L);
    }

    // 8. Delete Audit - Not Found
    @Test
    void deleteAudit_shouldThrowExceptionWhenNotFound() {

        when(auditRepository.existsById(999L))
                .thenReturn(false);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> auditService.deleteAudit(999L)
        );

        assertEquals("Audit not found", exception.getMessage());

        verify(auditRepository, times(1))
                .existsById(999L);

        verify(auditRepository, never())
                .deleteById(999L);
    }
}
