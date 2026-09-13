package com.infosys.kyc.audit;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
public class Audit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long auditId;

    private Long kycId;

    private Long customerId;

    private String action;

    private String status;

    private String remarks;

    private LocalDateTime timestamp;
}
