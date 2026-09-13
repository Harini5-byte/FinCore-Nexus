package com.infosys.kycverification.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Externalized configuration for the Liveness Detection module.
 * Backed by kyc.verification.liveness.* in application.yml / environment variables.
 */
@ConfigurationProperties(prefix = "kyc.verification.liveness")
public class LivenessProperties {

    private String faceCascadePath;
    private String eyeCascadePath;

    /** Minimum number of ordered frames required to attempt liveness analysis. */
    private int minFrames = 5;

    /** Maximum number of frames accepted per request. */
    private int maxFrames = 30;

    private long maxFileSizeBytes = 5 * 1024 * 1024L;

    private List<String> allowedContentTypes;

    /** Minimum combined confidence (0.0 - 1.0) required to report LIVE. */
    private double confidenceThreshold = 0.60;

    /** Minimum Laplacian-variance sharpness a frame must have to count as a genuine capture. */
    private double minSharpnessVariance = 15.0;

    public String getFaceCascadePath() {
        return faceCascadePath;
    }

    public void setFaceCascadePath(String faceCascadePath) {
        this.faceCascadePath = faceCascadePath;
    }

    public String getEyeCascadePath() {
        return eyeCascadePath;
    }

    public void setEyeCascadePath(String eyeCascadePath) {
        this.eyeCascadePath = eyeCascadePath;
    }

    public int getMinFrames() {
        return minFrames;
    }

    public void setMinFrames(int minFrames) {
        this.minFrames = minFrames;
    }

    public int getMaxFrames() {
        return maxFrames;
    }

    public void setMaxFrames(int maxFrames) {
        this.maxFrames = maxFrames;
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

    public double getConfidenceThreshold() {
        return confidenceThreshold;
    }

    public void setConfidenceThreshold(double confidenceThreshold) {
        this.confidenceThreshold = confidenceThreshold;
    }

    public double getMinSharpnessVariance() {
        return minSharpnessVariance;
    }

    public void setMinSharpnessVariance(double minSharpnessVariance) {
        this.minSharpnessVariance = minSharpnessVariance;
    }
}
