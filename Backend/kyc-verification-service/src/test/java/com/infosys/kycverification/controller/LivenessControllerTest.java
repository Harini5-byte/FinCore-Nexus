package com.infosys.kycverification.controller;

import com.infosys.kycverification.dto.LivenessResponse;
import com.infosys.kycverification.exception.GlobalExceptionHandler;
import com.infosys.kycverification.exception.InvalidFileException;
import com.infosys.kycverification.service.LivenessService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class LivenessControllerTest {

    private LivenessService livenessService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        livenessService = mock(LivenessService.class);
        LivenessController controller = new LivenessController(livenessService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void returnsLivenessResultFromService() throws Exception {
        when(livenessService.checkLiveness(anyList()))
                .thenReturn(new LivenessResponse("LIVE", true, 0.93, 0.60, 8, true));

        MockMultipartFile f1 = new MockMultipartFile("frames", "f1.jpg", "image/jpeg", new byte[]{1});
        MockMultipartFile f2 = new MockMultipartFile("frames", "f2.jpg", "image/jpeg", new byte[]{2});

        mockMvc.perform(multipart("/api/verification/liveness").file(f1).file(f2))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("LIVE"))
                .andExpect(jsonPath("$.live").value(true));
    }

    @Test
    void propagatesInvalidInputAsBadRequest() throws Exception {
        when(livenessService.checkLiveness(anyList()))
                .thenThrow(new InvalidFileException("At least 5 frames are required."));

        MockMultipartFile f1 = new MockMultipartFile("frames", "f1.jpg", "image/jpeg", new byte[]{1});

        mockMvc.perform(multipart("/api/verification/liveness").file(f1))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("INVALID_INPUT"));
    }
}
