package com.infosys.kycverification.exception;

/** Thrown when liveness analysis cannot be completed on the supplied frames. */
public class LivenessProcessingException extends RuntimeException {
    public LivenessProcessingException(String message) {
        super(message);
    }

    public LivenessProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}
