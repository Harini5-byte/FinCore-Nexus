package com.infosys.kycverification.util;

import com.infosys.kycverification.exception.FileTooLargeException;
import com.infosys.kycverification.exception.InvalidFileException;
import com.infosys.kycverification.exception.UnsupportedFileTypeException;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Shared multipart-file validation used by all three verification modules.
 * Purely structural checks (presence, size, declared content type) - never
 * makes a pass/fail decision about the *content* of the file.
 */
public final class FileValidationUtil {

    private FileValidationUtil() {
    }

    public static void validate(MultipartFile file, String fieldName,
                                 List<String> allowedContentTypes, long maxFileSizeBytes) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("'" + fieldName + "' is missing or empty.");
        }

        if (file.getSize() > maxFileSizeBytes) {
            throw new FileTooLargeException(
                    "'" + fieldName + "' exceeds the maximum allowed size of "
                            + maxFileSizeBytes + " bytes.");
        }

        String contentType = file.getContentType();
        if (contentType == null || allowedContentTypes == null
                || !allowedContentTypes.contains(contentType.toLowerCase())) {
            throw new UnsupportedFileTypeException(
                    "'" + fieldName + "' has unsupported content type: " + contentType
                            + ". Allowed types: " + allowedContentTypes);
        }
    }
}
