package com.infosys.kycverification.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "kyc.verification.face-match")
public class FaceMatchProperties {

    private String faceCascadePath;

    private double similarityThreshold = 0.80;

    private long maxFileSizeBytes = 10 * 1024 * 1024L;

    private List<String> allowedContentTypes;

    private int normalizedFaceSize = 200;

    private double minFaceSizeFraction = 0.10;

    public String getFaceCascadePath() {
        return faceCascadePath;
    }

    public void setFaceCascadePath(String faceCascadePath) {
        this.faceCascadePath = faceCascadePath;
    }

    public double getSimilarityThreshold() {
        return similarityThreshold;
    }

    public void setSimilarityThreshold(double similarityThreshold) {
        this.similarityThreshold = similarityThreshold;
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

    public int getNormalizedFaceSize() {
        return normalizedFaceSize;
    }

    public void setNormalizedFaceSize(int normalizedFaceSize) {
        this.normalizedFaceSize = normalizedFaceSize;
    }

    public double getMinFaceSizeFraction() {
        return minFaceSizeFraction;
    }

    public void setMinFaceSizeFraction(double minFaceSizeFraction) {
        this.minFaceSizeFraction = minFaceSizeFraction;
    }
}