package com.infosys.kyc.liveness;

public class LivenessResponse {

    // kept from the old mock so nothing else in the app breaks
    private boolean live;
    private double confidence;  // 0-100 scale, kept for backward compatibility
    private String status;

    // new fields from the real verification service
    private double threshold;
    private int framesAnalyzed;
    private boolean blinkDetected;

    public LivenessResponse() {
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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