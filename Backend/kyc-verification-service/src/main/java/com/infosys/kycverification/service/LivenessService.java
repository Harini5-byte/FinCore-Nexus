package com.infosys.kycverification.service;

import com.infosys.kycverification.dto.LivenessResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface LivenessService {

    /**
     * Analyzes an ordered sequence of frames captured from the user for
     * signs of genuine liveness (blink transitions, frame-to-frame motion,
     * capture sharpness/texture) versus a static photo or screen replay.
     */
    LivenessResponse checkLiveness(List<MultipartFile> frames);
}
