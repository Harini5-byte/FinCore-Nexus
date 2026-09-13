package com.infosys.kyc.ocr;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/ocr")
public class OcrController {

    private final OcrService ocrService;

    public OcrController(OcrService ocrService) {
        this.ocrService = ocrService;
    }

    // Changed from JSON body to real file upload (multipart/form-data),
    // since we now forward the actual image to kyc-verification-service.
    @PostMapping(value = "/verify", consumes = "multipart/form-data")
    public OcrResponse verifyDocument(
            @RequestParam("document") MultipartFile document,
            @RequestParam(value = "documentType", required = false) String documentType) {

        return ocrService.verifyDocument(document, documentType);
    }
}