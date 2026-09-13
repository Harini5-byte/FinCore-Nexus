package com.infosys.kycverification.controller;

import com.infosys.kycverification.dto.LivenessResponse;
import com.infosys.kycverification.service.LivenessService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/verification")
public class LivenessController {

    private final LivenessService livenessService;

    public LivenessController(LivenessService livenessService) {
        this.livenessService = livenessService;
    }

    /**
     * Accepts an ordered sequence of frames as multipart "frames" parts
     * (e.g. captured client-side over ~1-2 seconds while the user is
     * prompted to blink). See README "Liveness Detection" for capture guidance.
     */
    @PostMapping(value = "/liveness", consumes = "multipart/form-data")
    public ResponseEntity<LivenessResponse> checkLiveness(
            @RequestParam("frames") List<MultipartFile> frames) {

        LivenessResponse response = livenessService.checkLiveness(frames);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
