package com.infosys.kycverification.exception;

/** Thrown when more than one face is detected in an image where exactly one face is expected. */
public class MultipleFacesDetectedException extends RuntimeException {
    private final int faceCount;

    public MultipleFacesDetectedException(String message, int faceCount) {
        super(message);
        this.faceCount = faceCount;
    }

    public int getFaceCount() {
        return faceCount;
    }
}
