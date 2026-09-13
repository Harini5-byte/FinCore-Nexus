package com.bank.customerservice.repository;

import com.bank.customerservice.entity.Customer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository
        extends JpaRepository<Customer, Long> {

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsByCustomerNumber(String customerNumber);

    Optional<Customer> findByCustomerNumber(
            String customerNumber
    );
}