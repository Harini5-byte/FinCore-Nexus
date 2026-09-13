package com.bank.paymentservice.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String paymentReference;

    @Column(nullable = false)
    private Long customerId;

    // Sender account
    @Column(nullable = false)
    private Long accountId;

    // Recipient account
    private Long recipientAccountId;

    private Long loanId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String paymentType;

    // IMPS / NEFT / RTGS / UPI
    @Column(nullable = false)
    private String paymentMethod;

    @Column(nullable = false)
    private String status;

    // ==========================================
    // NEW: FRAUD CHECK FIELDS
    // ==========================================

    // 0.0 = totally safe, 1.0 = very risky
    private Double riskScore;

    // PASSED / FLAGGED / BLOCKED
    private String fraudStatus;

    private String description;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Payment() {
    }

    @PrePersist
    public void onCreate() {

        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (status == null) {
            status = "PENDING";
        }

        if (fraudStatus == null) {
            fraudStatus = "PENDING";
        }
    }

    @PreUpdate
    public void onUpdate() {

        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public Long getAccountId() {
        return accountId;
    }

    public Long getRecipientAccountId() {
        return recipientAccountId;
    }

    public Long getLoanId() {
        return loanId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getPaymentType() {
        return paymentType;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public String getStatus() {
        return status;
    }

    public Double getRiskScore() {
        return riskScore;
    }

    public String getFraudStatus() {
        return fraudStatus;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public void setRecipientAccountId(Long recipientAccountId) {
        this.recipientAccountId = recipientAccountId;
    }

    public void setLoanId(Long loanId) {
        this.loanId = loanId;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setPaymentType(String paymentType) {
        this.paymentType = paymentType;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setRiskScore(Double riskScore) {
        this.riskScore = riskScore;
    }

    public void setFraudStatus(String fraudStatus) {
        this.fraudStatus = fraudStatus;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}