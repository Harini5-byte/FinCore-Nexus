package com.infosys.kyc.audit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditRepository extends JpaRepository<Audit, Long> {

    List<Audit> findByKycId(Long kycId);

    List<Audit> findByCustomerId(Long customerId);

    // New: used for attempt-limiting - finds a customer's audit entries
    // of a specific action type (e.g. all their "KYC_SUBMITTED" entries)
    List<Audit> findByCustomerIdAndAction(Long customerId, String action);
}