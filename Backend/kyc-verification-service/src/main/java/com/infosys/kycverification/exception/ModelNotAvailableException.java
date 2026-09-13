package com.infosys.kycverification.exception;

/**
 * Thrown when a required native engine, model file, or trained-data resource
 * (Tesseract tessdata, Haar cascade XML, OpenCV native library, etc.) is not
 * available at the configured location.
 *
 * <p>By design this always results in a clear failure response rather than a
 * silently faked successful verification result.</p>
 */
public class ModelNotAvailableException extends RuntimeException {
    public ModelNotAvailableException(String message) {
        super(message);
    }

    public ModelNotAvailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
