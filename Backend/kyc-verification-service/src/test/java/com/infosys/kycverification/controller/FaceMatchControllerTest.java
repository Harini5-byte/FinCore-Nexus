package com.infosys.kycverification.controller;

import com.infosys.kycverification.dto.FaceMatchResponse;
import com.infosys.kycverification.exception.GlobalExceptionHandler;
import com.infosys.kycverification.exception.NoFaceDetectedException;
import com.infosys.kycverification.service.FaceMatchService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class FaceMatchControllerTest {

    private FaceMatchService faceMatchService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        faceMatchService = mock(FaceMatchService.class);
        FaceMatchController controller = new FaceMatchController(faceMatchService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void returnsMatchResultFromService() throws Exception {
        when(faceMatchService.matchFaces(any(), any()))
                .thenReturn(new FaceMatchResponse("MATCHED", true, 0.91, 0.80));

        MockMultipartFile ref = new MockMultipartFile("referenceImage", "ref.jpg", "image/jpeg", new byte[]{1, 2});
        MockMultipartFile selfie = new MockMultipartFile("selfieImage", "selfie.jpg", "image/jpeg", new byte[]{1, 2});

        mockMvc.perform(multipart("/api/verification/face-match").file(ref).file(selfie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("MATCHED"))
                .andExpect(jsonPath("$.matched").value(true));
    }

    @Test
    void propagatesNoFaceDetectedAsUnprocessable() throws Exception {
        when(faceMatchService.matchFaces(any(), any()))
                .thenThrow(new NoFaceDetectedException("No face detected in 'selfieImage'."));

        MockMultipartFile ref = new MockMultipartFile("referenceImage", "ref.jpg", "image/jpeg", new byte[]{1, 2});
        MockMultipartFile selfie = new MockMultipartFile("selfieImage", "selfie.jpg", "image/jpeg", new byte[]{1, 2});

        mockMvc.perform(multipart("/api/verification/face-match").file(ref).file(selfie))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value("NO_FACE_DETECTED"));
    }
}
