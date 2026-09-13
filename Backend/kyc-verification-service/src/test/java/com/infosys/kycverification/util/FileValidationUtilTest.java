package com.infosys.kycverification.util;

import com.infosys.kycverification.exception.FileTooLargeException;
import com.infosys.kycverification.exception.InvalidFileException;
import com.infosys.kycverification.exception.UnsupportedFileTypeException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FileValidationUtilTest {

    private static final List<String> ALLOWED = List.of("image/jpeg", "image/png");

    @Test
    void rejectsNullFile() {
        assertThrows(InvalidFileException.class,
                () -> FileValidationUtil.validate(null, "document", ALLOWED, 1024));
    }

    @Test
    void rejectsEmptyFile() {
        MockMultipartFile empty = new MockMultipartFile("document", "doc.jpg", "image/jpeg", new byte[0]);
        assertThrows(InvalidFileException.class,
                () -> FileValidationUtil.validate(empty, "document", ALLOWED, 1024));
    }

    @Test
    void rejectsFileExceedingMaxSize() {
        MockMultipartFile tooBig = new MockMultipartFile("document", "doc.jpg", "image/jpeg", new byte[2048]);
        assertThrows(FileTooLargeException.class,
                () -> FileValidationUtil.validate(tooBig, "document", ALLOWED, 1024));
    }

    @Test
    void rejectsUnsupportedContentType() {
        MockMultipartFile pdf = new MockMultipartFile("document", "doc.pdf", "application/pdf", new byte[]{1, 2, 3});
        assertThrows(UnsupportedFileTypeException.class,
                () -> FileValidationUtil.validate(pdf, "document", ALLOWED, 1024));
    }

    @Test
    void acceptsValidFile() {
        MockMultipartFile valid = new MockMultipartFile("document", "doc.jpg", "image/jpeg", new byte[]{1, 2, 3});
        assertDoesNotThrow(() -> FileValidationUtil.validate(valid, "document", ALLOWED, 1024));
    }
}
