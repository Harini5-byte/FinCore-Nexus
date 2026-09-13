package com.infosys.kycverification.dto;

import java.util.Map;

/**
 * Result of a Document OCR request.
 *
 * <p>ocrStatus reflects only whether text extraction succeeded - it is never
 * a claim of government/document verification. extractedFields are best-effort
 * heuristic field detections over the raw OCR text and may be empty if a
 * field could not be confidently located.</p>
 */
public class OcrResponse {

    private String documentType;
    private String ocrStatus;
    private String extractedText;
    private Map<String, String> extractedFields;
    private double averageConfidence;

    public OcrResponse() {
    }

    public OcrResponse(String documentType, String ocrStatus, String extractedText,
                        Map<String, String> extractedFields, double averageConfidence) {
        this.documentType = documentType;
        this.ocrStatus = ocrStatus;
        this.extractedText = extractedText;
        this.extractedFields = extractedFields;
        this.averageConfidence = averageConfidence;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getOcrStatus() {
        return ocrStatus;
    }

    public void setOcrStatus(String ocrStatus) {
        this.ocrStatus = ocrStatus;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }

    public Map<String, String> getExtractedFields() {
        return extractedFields;
    }

    public void setExtractedFields(Map<String, String> extractedFields) {
        this.extractedFields = extractedFields;
    }

    public double getAverageConfidence() {
        return averageConfidence;
    }

    public void setAverageConfidence(double averageConfidence) {
        this.averageConfidence = averageConfidence;
    }
}
