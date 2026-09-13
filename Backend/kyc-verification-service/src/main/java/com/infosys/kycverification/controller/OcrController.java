package com.infosys.kycverification.controller;

import com.infosys.kycverification.dto.OcrResponse;
import com.infosys.kycverification.service.OcrService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/verification")
public class OcrController {

    private final OcrService ocrService;

    public OcrController(OcrService ocrService) {
        this.ocrService = ocrService;
    }

    @PostMapping(value = "/ocr", consumes = "multipart/form-data")
    public ResponseEntity<OcrResponse> extractText(
            @RequestParam("document") MultipartFile document,
            @RequestParam(value = "documentType", required = false) String documentType) {

        OcrResponse response = ocrService.extractText(document, documentType);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
