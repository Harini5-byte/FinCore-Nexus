package com.infosys.kyc.liveness;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/liveness")
public class LivenessController {

    private final LivenessService livenessService;

    public LivenessController(LivenessService livenessService) {
        this.livenessService = livenessService;
    }

    @PostMapping(value = "/check", consumes = "multipart/form-data")
    public LivenessResponse checkLiveness(
            @RequestParam("frames") List<MultipartFile> frames) {

        return livenessService.checkLiveness(frames);
    }
}