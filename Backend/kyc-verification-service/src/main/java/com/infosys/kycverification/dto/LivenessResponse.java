package com.infosys.kycverification.dto;

/**
 * Result of a Liveness Detection request. confidence is computed from actual
 * blink-transition and sharpness/texture measurements across the submitted
 * frame sequence - never hardcoded.
 */
public class LivenessResponse {

    private String status;   // LIVE | NOT_LIVE
    private boolean live;
    private double confidence;
    private double threshold;
    private int framesAnalyzed;
    private boolean blinkDetected;

    public LivenessResponse() {
    }

    public LivenessResponse(String status, boolean live, double confidence, double threshold,
                             int framesAnalyzed, boolean blinkDetected) {
        this.status = status;
        this.live = live;
        this.confidence = confidence;
        this.threshold = threshold;
        this.framesAnalyzed = framesAnalyzed;
        this.blinkDetected = blinkDetected;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isLive() {
        return live;
    }

    public void setLive(boolean live) {
        this.live = live;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public double getThreshold() {
        return threshold;
    }

    public void setThreshold(double threshold) {
        this.threshold = threshold;
    }

    public int getFramesAnalyzed() {
        return framesAnalyzed;
    }

    public void setFramesAnalyzed(int framesAnalyzed) {
        this.framesAnalyzed = framesAnalyzed;
    }

    public boolean isBlinkDetected() {
        return blinkDetected;
    }

    public void setBlinkDetected(boolean blinkDetected) {
        this.blinkDetected = blinkDetected;
    }
}
