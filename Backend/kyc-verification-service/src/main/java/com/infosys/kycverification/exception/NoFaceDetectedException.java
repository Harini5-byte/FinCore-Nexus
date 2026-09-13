package com.infosys.kycverification.exception;

/** Thrown when zero faces are detected in an image where exactly one face is expected. */
public class NoFaceDetectedException extends RuntimeException {
    public NoFaceDetectedException(String message) {
        super(message);
    }
}
