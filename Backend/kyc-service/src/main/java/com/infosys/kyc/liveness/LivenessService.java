package com.infosys.kyc.liveness;

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
import java.util.List;
import java.util.Map;

@Service
public class LivenessService {

    private final RestTemplate restTemplate;

    @Value("${kyc.verification.service.url:http://localhost:8090}")
    private String verificationServiceUrl;

    public LivenessService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public LivenessResponse checkLiveness(List<MultipartFile> frames) {

        LivenessResponse response = new LivenessResponse();

        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            for (MultipartFile frame : frames) {
                body.add("frames", toResource(frame));
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            String url = verificationServiceUrl + "/api/verification/liveness";

            @SuppressWarnings("unchecked")
            Map<String, Object> result = restTemplate.postForObject(url, requestEntity, Map.class);

            if (result != null) {
                response.setStatus((String) result.get("status"));
                response.setLive(Boolean.TRUE.equals(result.get("live")));

                double confidence = result.get("confidence") != null
                        ? ((Number) result.get("confidence")).doubleValue() : 0.0;
                double threshold = result.get("threshold") != null
                        ? ((Number) result.get("threshold")).doubleValue() : 0.0;
                int framesAnalyzed = result.get("framesAnalyzed") != null
                        ? ((Number) result.get("framesAnalyzed")).intValue() : 0;

                response.setConfidence(confidence * 100);
                response.setThreshold(threshold);
                response.setFramesAnalyzed(framesAnalyzed);
                response.setBlinkDetected(Boolean.TRUE.equals(result.get("blinkDetected")));
            } else {
                response.setLive(false);
                response.setStatus("NOT_LIVE");
            }

        } catch (IOException e) {
            response.setLive(false);
            response.setStatus("ERROR");
        } catch (Exception e) {
            response.setLive(false);
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