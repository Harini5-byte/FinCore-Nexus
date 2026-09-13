package com.infosys.kycverification.exception;

/** Thrown when the OCR engine fails to process a document (never used to fabricate a result). */
public class OcrProcessingException extends RuntimeException {
    public OcrProcessingException(String message) {
        super(message);
    }

    public OcrProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}
