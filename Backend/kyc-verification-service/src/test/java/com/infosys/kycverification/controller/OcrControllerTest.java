package com.infosys.kycverification.controller;

import com.infosys.kycverification.dto.OcrResponse;
import com.infosys.kycverification.exception.GlobalExceptionHandler;
import com.infosys.kycverification.exception.InvalidFileException;
import com.infosys.kycverification.service.OcrService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class OcrControllerTest {

    private OcrService ocrService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        ocrService = mock(OcrService.class);
        OcrController controller = new OcrController(ocrService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void returnsOcrResultFromService() throws Exception {
        when(ocrService.extractText(any(), anyString())).thenReturn(
                new OcrResponse("AADHAAR", "SUCCESS", "some real extracted text",
                        Map.of("name", "extracted name"), 0.87));

        MockMultipartFile document = new MockMultipartFile("document", "doc.jpg", "image/jpeg", new byte[]{1, 2, 3});

        mockMvc.perform(multipart("/api/verification/ocr")
                        .file(document)
                        .param("documentType", "AADHAAR"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ocrStatus").value("SUCCESS"))
                .andExpect(jsonPath("$.documentType").value("AADHAAR"));
    }

    @Test
    void propagatesInvalidFileAsBadRequest() throws Exception {
        when(ocrService.extractText(any(), anyString()))
                .thenThrow(new InvalidFileException("'document' is missing or empty."));

        MockMultipartFile document = new MockMultipartFile("document", "doc.jpg", "image/jpeg", new byte[]{1});

        mockMvc.perform(multipart("/api/verification/ocr")
                        .file(document)
                        .param("documentType", "AADHAAR"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("INVALID_INPUT"));
    }
}
