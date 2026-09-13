package com.bank.loanservice.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class LoanRequest {

    @NotNull
    private Long customerId;

    @NotNull
    @DecimalMin("1.00")
    private BigDecimal loanAmount;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal interestRate;

    @NotNull
    @Min(1)
    private Integer tenureMonths;

    @NotBlank
    private String loanType;

    public LoanRequest() {
    }

    public Long getCustomerId() {
        return customerId;
    }

    public BigDecimal getLoanAmount() {
        return loanAmount;
    }

    public BigDecimal getInterestRate() {
        return interestRate;
    }

    public Integer getTenureMonths() {
        return tenureMonths;
    }

    public String getLoanType() {
        return loanType;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public void setLoanAmount(BigDecimal loanAmount) {
        this.loanAmount = loanAmount;
    }

    public void setInterestRate(BigDecimal interestRate) {
        this.interestRate = interestRate;
    }

    public void setTenureMonths(Integer tenureMonths) {
        this.tenureMonths = tenureMonths;
    }

    public void setLoanType(String loanType) {
        this.loanType = loanType;
    }
}