package com.infosys.kyc.facematch;

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
public class FaceMatchService {

    private final RestTemplate restTemplate;

    @Value("${kyc.verification.service.url:http://localhost:8090}")
    private String verificationServiceUrl;

    public FaceMatchService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * customerImage = the live selfie captured during KYC
     * documentImage = the photo on the submitted ID document
     * These get forwarded to her service as selfieImage / referenceImage.
     */
    public FaceMatchResponse matchFaces(MultipartFile customerImage, MultipartFile documentImage) {

        FaceMatchResponse response = new FaceMatchResponse();

        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("referenceImage", toResource(documentImage));
            body.add("selfieImage", toResource(customerImage));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            String url = verificationServiceUrl + "/api/verification/face-match";

            @SuppressWarnings("unchecked")
            Map<String, Object> result = restTemplate.postForObject(url, requestEntity, Map.class);

            if (result != null) {
                response.setStatus((String) result.get("status"));
                response.setMatched(Boolean.TRUE.equals(result.get("matched")));

                double similarity = result.get("similarityScore") != null
                        ? ((Number) result.get("similarityScore")).doubleValue() : 0.0;
                double threshold = result.get("threshold") != null
                        ? ((Number) result.get("threshold")).doubleValue() : 0.0;

                response.setSimilarityScore(similarity);
                response.setThreshold(threshold);
                response.setConfidence(similarity * 100); // keep old 0-100 scale field populated
            } else {
                response.setMatched(false);
                response.setStatus("NO_MATCH");
            }

        } catch (IOException e) {
            response.setMatched(false);
            response.setStatus("ERROR");
        } catch (Exception e) {
            // covers connection refused, no face detected, multiple faces, etc.
            response.setMatched(false);
            response.setStatus("ERROR: " + e.getMessage());
        }

        return response;
    }

    private ByteArrayResource toResource(MultipartFile file) throws IOException {
        return new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };
    }
}