package com.infosys.kyc.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Provides a RestTemplate bean used by kyc-service to forward file uploads
 * (OCR documents, face-match images, liveness frames) to the standalone
 * kyc-verification-service running on port 8090.
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}