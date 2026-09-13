package com.infosys.kycverification.exception;

import com.infosys.kycverification.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.Instant;

/**
 * Centralized exception handling for all three verification endpoints.
 * Returns a consistent error shape and never exposes stack traces or
 * internal implementation details to the caller.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(InvalidFileException.class)
    public ResponseEntity<ErrorResponse> handleInvalidFile(InvalidFileException ex, WebRequest request) {
        return build(HttpStatus.BAD_REQUEST, "INVALID_INPUT", ex.getMessage(), request);
    }

    @ExceptionHandler(UnsupportedFileTypeException.class)
    public ResponseEntity<ErrorResponse> handleUnsupportedFileType(UnsupportedFileTypeException ex, WebRequest request) {
        return build(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "UNSUPPORTED_FILE_TYPE", ex.getMessage(), request);
    }

    @ExceptionHandler({FileTooLargeException.class, MaxUploadSizeExceededException.class})
    public ResponseEntity<ErrorResponse> handleFileTooLarge(Exception ex, WebRequest request) {
        return build(HttpStatus.PAYLOAD_TOO_LARGE, "FILE_TOO_LARGE",
                "The uploaded file exceeds the maximum allowed size.", request);
    }

    @ExceptionHandler(NoFaceDetectedException.class)
    public ResponseEntity<ErrorResponse> handleNoFace(NoFaceDetectedException ex, WebRequest request) {
        return build(HttpStatus.UNPROCESSABLE_ENTITY, "NO_FACE_DETECTED", ex.getMessage(), request);
    }

    @ExceptionHandler(MultipleFacesDetectedException.class)
    public ResponseEntity<ErrorResponse> handleMultipleFaces(MultipleFacesDetectedException ex, WebRequest request) {
        return build(HttpStatus.UNPROCESSABLE_ENTITY, "MULTIPLE_FACES_DETECTED", ex.getMessage(), request);
    }

    @ExceptionHandler(OcrProcessingException.class)
    public ResponseEntity<ErrorResponse> handleOcrProcessing(OcrProcessingException ex, WebRequest request) {
        log.warn("OCR processing failure: {}", ex.getMessage());
        return build(HttpStatus.UNPROCESSABLE_ENTITY, "OCR_PROCESSING_FAILED", ex.getMessage(), request);
    }

    @ExceptionHandler(LivenessProcessingException.class)
    public ResponseEntity<ErrorResponse> handleLivenessProcessing(LivenessProcessingException ex, WebRequest request) {
        log.warn("Liveness processing failure: {}", ex.getMessage());
        return build(HttpStatus.UNPROCESSABLE_ENTITY, "LIVENESS_PROCESSING_FAILED", ex.getMessage(), request);
    }

    @ExceptionHandler(ModelNotAvailableException.class)
    public ResponseEntity<ErrorResponse> handleModelNotAvailable(ModelNotAvailableException ex, WebRequest request) {
        log.error("Required model/engine not available: {}", ex.getMessage());
        return build(HttpStatus.SERVICE_UNAVAILABLE, "ENGINE_NOT_AVAILABLE", ex.getMessage(), request);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParam(MissingServletRequestParameterException ex, WebRequest request) {
        return build(HttpStatus.BAD_REQUEST, "MISSING_PARAMETER", ex.getMessage(), request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, WebRequest request) {
        log.error("Unhandled exception while processing verification request", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
                "An unexpected error occurred while processing the request.", request);
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String error, String message, WebRequest request) {
        String path = request.getDescription(false).replace("uri=", "");
        ErrorResponse body = new ErrorResponse(Instant.now(), status.value(), error, message, path);
        return ResponseEntity.status(status).body(body);
    }
}
