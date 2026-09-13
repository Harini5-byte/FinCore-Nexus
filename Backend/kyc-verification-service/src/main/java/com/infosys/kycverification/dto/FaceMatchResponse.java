package com.infosys.kycverification.dto;

/**
 * Result of a Face Match request. similarityScore and threshold are always
 * populated from the actual comparison performed against the two supplied
 * images - never hardcoded.
 */
public class FaceMatchResponse {

    private String status;       // MATCHED | NO_MATCH
    private boolean matched;
    private double similarityScore;
    private double threshold;

    public FaceMatchResponse() {
    }

    public FaceMatchResponse(String status, boolean matched, double similarityScore, double threshold) {
        this.status = status;
        this.matched = matched;
        this.similarityScore = similarityScore;
        this.threshold = threshold;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isMatched() {
        return matched;
    }

    public void setMatched(boolean matched) {
        this.matched = matched;
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
