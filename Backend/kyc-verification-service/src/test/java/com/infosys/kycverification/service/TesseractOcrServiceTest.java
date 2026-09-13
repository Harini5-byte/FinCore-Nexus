package com.infosys.kycverification.service;

import com.infosys.kycverification.config.OcrProperties;
import com.infosys.kycverification.dto.OcrResponse;
import com.infosys.kycverification.exception.InvalidFileException;
import com.infosys.kycverification.exception.ModelNotAvailableException;
import com.infosys.kycverification.exception.UnsupportedFileTypeException;
import com.infosys.kycverification.service.impl.TesseractOcrService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

/**
 * These tests exercise the REAL Tesseract engine - no mocked OCR results.
 * They are skipped (not failed) when Tesseract's tessdata is not present on
 * the machine running the build, since Tesseract is a native dependency that
 * must be installed separately (see README "OCR Setup"). This mirrors the
 * project's "never fake a result" requirement: a missing engine is reported
 * as skipped/unavailable, not silently green.
 */
class TesseractOcrServiceTest {

    private static final String[] CANDIDATE_TESSDATA_PATHS = {
            "/usr/share/tesseract-ocr/5/tessdata",
            "/usr/share/tesseract-ocr/4.00/tessdata",
            "/usr/share/tessdata",
            "/opt/homebrew/share/tessdata"
    };

    private OcrProperties properties;
    private TesseractOcrService service;

    @BeforeEach
    void setUp() {
        String tessdataPath = findAvailableTessdataPath();
        assumeTrue(tessdataPath != null,
                "Tesseract tessdata not found on this machine - skipping real-OCR tests. "
                        + "Install Tesseract to run these. See README 'OCR Setup'.");

        properties = new OcrProperties();
        properties.setTessdataPath(tessdataPath);
        properties.setLanguage("eng");
        properties.setMaxFileSizeBytes(10 * 1024 * 1024L);
        properties.setAllowedContentTypes(List.of("image/jpeg", "image/png", "image/bmp", "image/tiff"));
        properties.setMinExtractedTextLength(3);

        service = new TesseractOcrService(properties);
    }

    @Test
    void extractsRealTextFromGeneratedImage() throws Exception {
        byte[] png = renderTextImage("SAMPLE KYC DOCUMENT");
        MockMultipartFile file = new MockMultipartFile("document", "doc.png", "image/png", png);

        OcrResponse response = service.extractText(file, "GENERIC");

        assertEquals("SUCCESS", response.getOcrStatus());
        assertTrue(response.getExtractedText().toUpperCase().contains("SAMPLE")
                || response.getExtractedText().toUpperCase().contains("KYC"));
    }

    @Test
    void reportsFailedStatusForBlankImage() throws Exception {
        BufferedImage blank = new BufferedImage(300, 100, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = blank.createGraphics();
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, 300, 100);
        g.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(blank, "png", baos);
        MockMultipartFile file = new MockMultipartFile("document", "blank.png", "image/png", baos.toByteArray());

        OcrResponse response = service.extractText(file, "GENERIC");

        assertEquals("FAILED", response.getOcrStatus());
    }

    @Test
    void rejectsEmptyFile() {
        MockMultipartFile empty = new MockMultipartFile("document", "empty.png", "image/png", new byte[0]);
        assertThrows(InvalidFileException.class, () -> service.extractText(empty, "GENERIC"));
    }

    @Test
    void rejectsUnsupportedFormat() {
        MockMultipartFile textFile = new MockMultipartFile("document", "doc.txt", "text/plain", "hello".getBytes());
        assertThrows(UnsupportedFileTypeException.class, () -> service.extractText(textFile, "GENERIC"));
    }

    @Test
    void failsClearlyWhenTessdataMisconfigured() {
        OcrProperties badProps = new OcrProperties();
        badProps.setTessdataPath("/nonexistent/tessdata/path");
        badProps.setAllowedContentTypes(List.of("image/png"));
        badProps.setMaxFileSizeBytes(10 * 1024 * 1024L);
        TesseractOcrService badService = new TesseractOcrService(badProps);

        MockMultipartFile file = new MockMultipartFile("document", "doc.png", "image/png", new byte[]{1, 2, 3});
        assertThrows(ModelNotAvailableException.class, () -> badService.extractText(file, "GENERIC"));
    }

    private byte[] renderTextImage(String text) throws Exception {
        BufferedImage image = new BufferedImage(400, 100, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, 400, 100);
        g.setColor(Color.BLACK);
        g.setFont(new Font("SansSerif", Font.BOLD, 28));
        g.drawString(text, 10, 60);
        g.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "png", baos);
        return baos.toByteArray();
    }

    private String findAvailableTessdataPath() {
        for (String path : CANDIDATE_TESSDATA_PATHS) {
            if (new File(path).isDirectory()) {
                return path;
            }
        }
        return null;
    }
}
