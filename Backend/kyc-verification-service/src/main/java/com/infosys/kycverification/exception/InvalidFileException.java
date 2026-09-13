package com.infosys.kycverification.exception;

/** Thrown when an uploaded file is missing, empty, corrupted, or otherwise unreadable. */
public class InvalidFileException extends RuntimeException {
    public InvalidFileException(String message) {
        super(message);
    }

    public InvalidFileException(String message, Throwable cause) {
        super(message, cause);
    }
}
