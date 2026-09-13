package com.infosys.kyc.dto;

import lombok.Data;

@Data
public class KycResponse {

    private Long kycId;
    private Long customerId;
    private String documentType;
    private String documentNumber;
    private String verificationStatus;
    private String remarks;
}
