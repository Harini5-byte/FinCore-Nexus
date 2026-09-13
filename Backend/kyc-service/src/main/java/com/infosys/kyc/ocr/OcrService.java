package com.infosys.kyc.ocr;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class OcrService {

    private final RestTemplate restTemplate;

    // Base URL of her standalone kyc-verification-service.
    // Falls back to localhost:8090 if not set in application.properties.
    @Value("${kyc.verification.service.url:http://localhost:8090}")
    private String verificationServiceUrl;

    public OcrService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Forwards the uploaded document image to kyc-verification-service's
     * real OCR endpoint and maps the result back into our OcrResponse shape.
     */
    public OcrResponse verifyDocument(MultipartFile document, String documentType) {

        OcrResponse response = new OcrResponse();
        response.setDocumentType(documentType);

        try {
            // Wrap the uploaded file as a resource Spring can send as multipart/form-data
            ByteArrayResource fileResource = new ByteArrayResource(document.getBytes()) {
                @Override
                public String getFilename() {
                    return document.getOriginalFilename();
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("document", fileResource);
            if (documentType != null && !documentType.isBlank()) {
                body.add("documentType", documentType);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            String url = verificationServiceUrl + "/api/verification/ocr";

            @SuppressWarnings("unchecked")
            Map<String, Object> result = restTemplate.postForObject(url, requestEntity, Map.class);

            if (result != null) {
                response.setOcrStatus((String) result.get("ocrStatus"));
                response.setExtractedText((String) result.get("extractedText"));
                response.setAverageConfidence(
                        result.get("averageConfidence") != null
                                ? ((Number) result.get("averageConfidence")).doubleValue()
                                : 0.0
                );

                @SuppressWarnings("unchecked")
                Map<String, String> fields = (Map<String, String>) result.get("extractedFields");
                response.setExtractedFields(fields);

                if (fields != null) {
                    response.setDocumentNumber(fields.get("documentNumber"));
                    response.setExtractedName(fields.get("name"));
                }

                boolean success = "SUCCESS".equalsIgnoreCase(response.getOcrStatus());
                response.setStatus(success ? "Verified" : "Rejected");
            } else {
                response.setStatus("Rejected");
                response.setOcrStatus("FAILED");
            }

        } catch (IOException e) {
            response.setStatus("Rejected");
            response.setOcrStatus("FAILED");
            response.setExtractedText("Could not read uploaded file: " + e.getMessage());
        } catch (Exception e) {
            // covers connection refused (verification service not running),
            // 4xx/5xx from that service, etc.
            response.setStatus("Rejected");
            response.setOcrStatus("FAILED");
            response.setExtractedText("OCR verification service error: " + e.getMessage());
        }

        return response;
    }
}