package com.bank.customerservice.service;

import com.bank.customerservice.dto.CustomerRequest;
import com.bank.customerservice.dto.CustomerResponse;

import java.util.List;

public interface CustomerService {

    CustomerResponse createCustomer(CustomerRequest request);

    CustomerResponse getCustomerById(Long id);

    CustomerResponse getCustomerByNumber(String customerNumber);

    List<CustomerResponse> getAllCustomers();

    CustomerResponse updateCustomer(
            Long id,
            CustomerRequest request
    );

    void deleteCustomer(Long id);

    CustomerResponse activateCustomer(Long id);

    CustomerResponse deactivateCustomer(Long id);
}