package com.infosys.kycverification.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Externalized configuration for the Document OCR module.
 * Backed by kyc.verification.ocr.* in application.yml / environment variables.
 * No thresholds, paths or limits are hardcoded in service code.
 */
@ConfigurationProperties(prefix = "kyc.verification.ocr")
public class OcrProperties {

    /** Directory containing Tesseract trained language data (tessdata). */
    private String tessdataPath;

    /** Tesseract language code, e.g. "eng". */
    private String language = "eng";

    private long maxFileSizeBytes = 10 * 1024 * 1024L;

    private List<String> allowedContentTypes;

    /** OCR is only reported SUCCESS if at least this many characters were read. */
    private int minExtractedTextLength = 3;

    public String getTessdataPath() {
        return tessdataPath;
    }

    public void setTessdataPath(String tessdataPath) {
        this.tessdataPath = tessdataPath;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public long getMaxFileSizeBytes() {
        return maxFileSizeBytes;
    }

    public void setMaxFileSizeBytes(long maxFileSizeBytes) {
        this.maxFileSizeBytes = maxFileSizeBytes;
    }

    public List<String> getAllowedContentTypes() {
        return allowedContentTypes;
    }

    public void setAllowedContentTypes(List<String> allowedContentTypes) {
        this.allowedContentTypes = allowedContentTypes;
    }

    public int getMinExtractedTextLength() {
        return minExtractedTextLength;
    }

    public void setMinExtractedTextLength(int minExtractedTextLength) {
        this.minExtractedTextLength = minExtractedTextLength;
    }
}
