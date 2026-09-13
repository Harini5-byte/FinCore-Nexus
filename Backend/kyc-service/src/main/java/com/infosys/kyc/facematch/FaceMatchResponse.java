package com.infosys.kyc.facematch;

public class FaceMatchResponse {

    // kept from the old mock so nothing else in the app breaks
    private boolean matched;
    private double confidence;   // 0-100 scale, kept for backward compatibility
    private String status;

    // new fields straight from the real verification service
    private double similarityScore;  // 0-1 scale, as OpenCV computes it
    private double threshold;

    public FaceMatchResponse() {
    }

    public boolean isMatched() {
        return matched;
    }

    public void setMatched(boolean matched) {
        this.matched = matched;
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

    public double getSimilarityScore() {
        return similarityScore;
    }

    public void setSimilarityScore(double similarityScore) {
        this.similarityScore = similarityScore;
    }

    public double getThreshold() {
        return threshold;
    }

    public void setThreshold(double threshold) {
        this.threshold = threshold;
    }
}