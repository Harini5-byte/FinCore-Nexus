package com.infosys.kycverification.service.impl;

import com.infosys.kycverification.config.OcrProperties;
import com.infosys.kycverification.dto.OcrResponse;
import com.infosys.kycverification.exception.InvalidFileException;
import com.infosys.kycverification.exception.ModelNotAvailableException;
import com.infosys.kycverification.exception.OcrProcessingException;
import com.infosys.kycverification.service.OcrService;
import com.infosys.kycverification.util.FileValidationUtil;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import net.sourceforge.tess4j.Word;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Real Document OCR backed by the native Tesseract engine via Tess4J.
 *
 * <p>Tesseract must be installed on the host and a valid tessdata directory
 * must be reachable at kyc.verification.ocr.tessdata-path (see README "OCR
 * Setup"). If it is not available, requests fail with a clear 5xx error
 * rather than returning a fabricated OCR result.</p>
 */
@Service
public class TesseractOcrService implements OcrService {

    private static final Logger log = LoggerFactory.getLogger(TesseractOcrService.class);

    // Best-effort field patterns. These only shape *which substring* of the
    // real OCR text is surfaced as a field - they never invent values.
    private static final Pattern DOB_PATTERN = Pattern.compile(
            "\\b(\\d{2}[\\/\\-.]\\d{2}[\\/\\-.]\\d{4})\\b");
    private static final Pattern AADHAAR_PATTERN = Pattern.compile("\\b(\\d{4}\\s?\\d{4}\\s?\\d{4})\\b");
    private static final Pattern PAN_PATTERN = Pattern.compile("\\b([A-Z]{5}\\d{4}[A-Z])\\b");
    private static final Pattern NAME_LINE_PATTERN = Pattern.compile(
            "(?i)name\\s*[:\\-]?\\s*(.+)");

    private final OcrProperties properties;

    public TesseractOcrService(OcrProperties properties) {
        this.properties = properties;
    }

    @Override
    public OcrResponse extractText(MultipartFile document, String documentType) {
        FileValidationUtil.validate(document, "document",
                properties.getAllowedContentTypes(), properties.getMaxFileSizeBytes());

        Tesseract tesseract = buildTesseractEngine();

        File tempFile = writeToTempFile(document);
        try {
            BufferedImage image = readImage(tempFile);

            String extractedText;
            List<Word> words;
            try {
                extractedText = tesseract.doOCR(image);
                words = tesseract.getWords(image, net.sourceforge.tess4j.ITessAPI.TessPageIteratorLevel.RIL_WORD);
            } catch (TesseractException e) {
                throw new OcrProcessingException(
                        "Tesseract failed to process the uploaded document: " + e.getMessage(), e);
            } catch (UnsatisfiedLinkError | NoClassDefFoundError e) {
                // The native Tesseract/leptonica library itself could not be loaded.
                throw new ModelNotAvailableException(
                        "Native Tesseract engine could not be loaded on this host. Ensure Tesseract OCR "
                                + "is installed and its native library is on the library path. "
                                + "See README 'OCR Setup'.", e);
            }

            if (extractedText == null) {
                extractedText = "";
            }
            String trimmed = extractedText.trim();

            if (trimmed.length() < properties.getMinExtractedTextLength()) {
                return new OcrResponse(
                        documentType,
                        "FAILED",
                        trimmed,
                        Map.of(),
                        0.0);
            }

            double averageConfidence = averageWordConfidence(words);
            Map<String, String> fields = extractFields(trimmed, documentType);

            return new OcrResponse(documentType, "SUCCESS", trimmed, fields, averageConfidence);

        } finally {
            deleteQuietly(tempFile);
        }
    }

    private Tesseract buildTesseractEngine() {
        String tessdataPath = properties.getTessdataPath();
        if (tessdataPath == null || tessdataPath.isBlank() || !new File(tessdataPath).isDirectory()) {
            throw new ModelNotAvailableException(
                    "Tesseract tessdata directory not found at '" + tessdataPath + "'. "
                            + "Set kyc.verification.ocr.tessdata-path (or KYC_OCR_TESSDATA_PATH) "
                            + "to a valid Tesseract tessdata directory. See README 'OCR Setup'.");
        }
        Tesseract tesseract = new Tesseract();
        tesseract.setDatapath(tessdataPath);
        tesseract.setLanguage(properties.getLanguage());
        tesseract.setOcrEngineMode(1); // LSTM engine only
        return tesseract;
    }

    private File writeToTempFile(MultipartFile document) {
        try {
            String suffix = resolveSuffix(document.getOriginalFilename());
            Path tempPath = Files.createTempFile("kyc-ocr-", suffix);
            document.transferTo(tempPath);
            return tempPath.toFile();
        } catch (IOException e) {
            throw new InvalidFileException("Unable to read the uploaded document: " + e.getMessage(), e);
        }
    }

    private BufferedImage readImage(File file) {
        try {
            BufferedImage image = ImageIO.read(file);
            if (image == null) {
                throw new InvalidFileException(
                        "The uploaded document could not be decoded as an image. "
                                + "If this is a multi-page PDF, submit one page at a time.");
            }
            return image;
        } catch (IOException e) {
            throw new InvalidFileException("Unable to read the uploaded document: " + e.getMessage(), e);
        }
    }

    private String resolveSuffix(String originalFilename) {
        if (originalFilename == null) {
            return ".tmp";
        }
        int idx = originalFilename.lastIndexOf('.');
        return idx >= 0 ? originalFilename.substring(idx) : ".tmp";
    }

    private double averageWordConfidence(List<Word> words) {
        if (words == null || words.isEmpty()) {
            return 0.0;
        }
        double sum = 0.0;
        int count = 0;
        for (Word w : words) {
            if (w.getConfidence() >= 0) {
                sum += w.getConfidence();
                count++;
            }
        }
        return count == 0 ? 0.0 : Math.round((sum / count) / 100.0 * 100.0) / 100.0;
    }

    /**
     * Best-effort extraction of common KYC document fields from the raw OCR
     * text using regular expressions. Every field is only populated when a
     * matching substring is actually present in the extracted text.
     */
    private Map<String, String> extractFields(String text, String documentType) {
        Map<String, String> fields = new HashMap<>();

        Matcher dobMatcher = DOB_PATTERN.matcher(text);
        if (dobMatcher.find()) {
            fields.put("dateOfBirth", dobMatcher.group(1));
        }

        if (documentType != null && documentType.equalsIgnoreCase("PAN")) {
            Matcher panMatcher = PAN_PATTERN.matcher(text.replace(" ", ""));
            if (panMatcher.find()) {
                fields.put("documentNumber", panMatcher.group(1));
            }
        } else {
            Matcher aadhaarMatcher = AADHAAR_PATTERN.matcher(text);
            if (aadhaarMatcher.find()) {
                fields.put("documentNumber", aadhaarMatcher.group(1).replaceAll("\\s", ""));
            }
        }

        Matcher nameMatcher = NAME_LINE_PATTERN.matcher(text);
        if (nameMatcher.find()) {
            String candidate = nameMatcher.group(1).trim();
            if (!candidate.isEmpty()) {
                fields.put("name", candidate.split("\\r?\\n")[0].trim());
            }
        }

        return fields;
    }

    private void deleteQuietly(File file) {
        try {
            Files.deleteIfExists(file.toPath());
        } catch (IOException e) {
            log.warn("Failed to delete temporary OCR file.");
        }
    }
}
