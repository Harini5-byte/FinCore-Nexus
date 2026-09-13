package com.bank.accountservice.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class AccountRequest {

    @NotNull
    private Long customerId;

    @NotBlank
    private String accountType;

    @DecimalMin(value = "0.00")
    private BigDecimal initialDeposit;

    private String currency;

    public AccountRequest() {
    }

    public Long getCustomerId() {
        return customerId;
    }

    public String getAccountType() {
        return accountType;
    }

    public BigDecimal getInitialDeposit() {
        return initialDeposit;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public void setInitialDeposit(BigDecimal initialDeposit) {
        this.initialDeposit = initialDeposit;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}