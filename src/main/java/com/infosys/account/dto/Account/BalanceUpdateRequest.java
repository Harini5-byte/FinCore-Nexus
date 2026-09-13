package com.infosys.account.dto.Account;

public class BalanceUpdateRequest {

    private Double amount;
    private String transactionType;

    public BalanceUpdateRequest() {
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }
}