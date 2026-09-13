package com.infosys.kycverification;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * Entry point for the kyc-verification-service.
 *
 * <p>This microservice is intentionally independent of the existing
 * kyc-service. It owns exactly three capabilities: Document OCR, Face Match
 * and Liveness Detection. It does not implement KYC CRUD, risk assessment,
 * compliance or audit logging - those remain the responsibility of the
 * existing kyc-service, which will call this service over REST/Feign and
 * fold the results into its own decisioning pipeline.</p>
 */
@SpringBootApplication
@ConfigurationPropertiesScan
public class KycVerificationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(KycVerificationServiceApplication.class, args);
        System.out.println("welcome to the verification");

    }
}
