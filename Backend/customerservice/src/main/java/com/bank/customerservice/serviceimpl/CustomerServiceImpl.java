package com.bank.customerservice.serviceimpl;

import com.bank.customerservice.dto.CustomerRequest;
import com.bank.customerservice.dto.CustomerResponse;
import com.bank.customerservice.entity.Customer;
import com.bank.customerservice.exception.DuplicateResourceException;
import com.bank.customerservice.repository.CustomerRepository;
import com.bank.customerservice.service.CustomerService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CustomerServiceImpl
        implements CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerServiceImpl(
            CustomerRepository customerRepository) {

        this.customerRepository =
                customerRepository;
    }

    // =====================================================
    // CREATE CUSTOMER
    // =====================================================

    @Override
    @Transactional
    public CustomerResponse createCustomer(
            CustomerRequest request) {

        if (customerRepository.existsByEmail(
                request.getEmail())) {

            throw new DuplicateResourceException(
                    "Customer with this email already exists"
            );
        }

        if (customerRepository.existsByPhone(
                request.getPhone())) {

            throw new DuplicateResourceException(
                    "Customer with this phone number already exists"
            );
        }

        Customer customer = new Customer();

        customer.setCustomerNumber(
                generateCustomerNumber()
        );

        customer.setFirstName(
                request.getFirstName()
        );

        customer.setLastName(
                request.getLastName()
        );

        customer.setEmail(
                request.getEmail()
        );

        customer.setPhone(
                request.getPhone()
        );

        customer.setAddress(
                request.getAddress()
        );

        customer.setCity(
                request.getCity()
        );

        customer.setState(
                request.getState()
        );

        customer.setPostalCode(
                request.getPostalCode()
        );

        customer.setStatus("ACTIVE");

        Customer savedCustomer =
                customerRepository.save(customer);

        return mapToResponse(savedCustomer);
    }

    // =====================================================
    // GET CUSTOMER BY ID
    // =====================================================

    @Override
    public CustomerResponse getCustomerById(Long id) {

        Customer customer =
                findCustomer(id);

        return mapToResponse(customer);
    }

    // =====================================================
    // GET CUSTOMER BY NUMBER
    // =====================================================

    @Override
    public CustomerResponse getCustomerByNumber(
            String customerNumber) {

        Customer customer =
                customerRepository
                        .findByCustomerNumber(customerNumber)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found with number: "
                                                + customerNumber
                                )
                        );

        return mapToResponse(customer);
    }

    // =====================================================
    // GET ALL CUSTOMERS
    // =====================================================

    @Override
    public List<CustomerResponse> getAllCustomers() {

        return customerRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =====================================================
    // UPDATE CUSTOMER
    // =====================================================

    @Override
    @Transactional
    public CustomerResponse updateCustomer(
            Long id,
            CustomerRequest request) {

        Customer customer =
                findCustomer(id);

        if (!customer.getEmail()
                .equalsIgnoreCase(request.getEmail())
                &&
                customerRepository.existsByEmail(
                        request.getEmail())) {

            throw new DuplicateResourceException(
                    "Email already belongs to another customer"
            );
        }

        if (!customer.getPhone()
                .equals(request.getPhone())
                &&
                customerRepository.existsByPhone(
                        request.getPhone())) {

            throw new DuplicateResourceException(
                    "Phone number already belongs to another customer"
            );
        }

        customer.setFirstName(
                request.getFirstName()
        );

        customer.setLastName(
                request.getLastName()
        );

        customer.setEmail(
                request.getEmail()
        );

        customer.setPhone(
                request.getPhone()
        );

        customer.setAddress(
                request.getAddress()
        );

        customer.setCity(
                request.getCity()
        );

        customer.setState(
                request.getState()
        );

        customer.setPostalCode(
                request.getPostalCode()
        );

        Customer updatedCustomer =
                customerRepository.save(customer);

        return mapToResponse(updatedCustomer);
    }

    // =====================================================
    // DELETE CUSTOMER
    // =====================================================

    @Override
    @Transactional
    public void deleteCustomer(Long id) {

        Customer customer =
                findCustomer(id);

        customerRepository.delete(customer);
    }

    // =====================================================
    // ACTIVATE
    // =====================================================

    @Override
    @Transactional
    public CustomerResponse activateCustomer(
            Long id) {

        Customer customer =
                findCustomer(id);

        customer.setStatus("ACTIVE");

        return mapToResponse(
                customerRepository.save(customer)
        );
    }

    // =====================================================
    // DEACTIVATE
    // =====================================================

    @Override
    @Transactional
    public CustomerResponse deactivateCustomer(
            Long id) {

        Customer customer =
                findCustomer(id);

        customer.setStatus("INACTIVE");

        return mapToResponse(
                customerRepository.save(customer)
        );
    }

    // =====================================================
    // FIND CUSTOMER
    // =====================================================

    private Customer findCustomer(Long id) {

        return customerRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with id: "
                                        + id
                        )
                );
    }

    // =====================================================
    // GENERATE CUSTOMER NUMBER
    // =====================================================

    private String generateCustomerNumber() {

        String number;

        do {

            number =
                    "CUS-" +
                            UUID.randomUUID()
                                    .toString()
                                    .substring(0, 8)
                                    .toUpperCase();

        } while (
                customerRepository
                        .existsByCustomerNumber(number)
        );

        return number;
    }

    // =====================================================
    // MAP ENTITY -> RESPONSE
    // =====================================================

    private CustomerResponse mapToResponse(
            Customer customer) {

        CustomerResponse response =
                new CustomerResponse();

        response.setId(customer.getId());

        response.setCustomerNumber(
                customer.getCustomerNumber()
        );

        response.setFirstName(
                customer.getFirstName()
        );

        response.setLastName(
                customer.getLastName()
        );

        response.setEmail(
                customer.getEmail()
        );

        response.setPhone(
                customer.getPhone()
        );

        response.setAddress(
                customer.getAddress()
        );

        response.setCity(
                customer.getCity()
        );

        response.setState(
                customer.getState()
        );

        response.setPostalCode(
                customer.getPostalCode()
        );

        response.setStatus(
                customer.getStatus()
        );

        response.setCreatedAt(
                customer.getCreatedAt()
        );

        response.setUpdatedAt(
                customer.getUpdatedAt()
        );

        return response;
    }
}