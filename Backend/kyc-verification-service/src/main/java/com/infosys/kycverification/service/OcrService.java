package com.infosys.kycverification.service;

import com.infosys.kycverification.dto.OcrResponse;
import org.springframework.web.multipart.MultipartFile;

public interface OcrService {

    /**
     * Runs real OCR text extraction against the supplied document image and
     * attempts best-effort structured field extraction.
     *
     * @param document     the uploaded document image/PDF
     * @param documentType caller-declared document type (e.g. AADHAAR, PAN) - used only
     *                     to select field-extraction heuristics, never to influence ocrStatus
     */
    OcrResponse extractText(MultipartFile document, String documentType);
}
