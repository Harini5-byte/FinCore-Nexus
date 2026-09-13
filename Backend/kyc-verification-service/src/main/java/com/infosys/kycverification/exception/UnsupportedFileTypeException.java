package com.infosys.kycverification.exception;

/** Thrown when an uploaded file's content type is not in the configured allow-list. */
public class UnsupportedFileTypeException extends RuntimeException {
    public UnsupportedFileTypeException(String message) {
        super(message);
    }
}
