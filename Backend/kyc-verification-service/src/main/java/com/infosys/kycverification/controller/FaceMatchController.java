package com.infosys.kycverification.controller;

import com.infosys.kycverification.dto.FaceMatchResponse;
import com.infosys.kycverification.service.FaceMatchService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/verification")
public class FaceMatchController {

    private final FaceMatchService faceMatchService;

    public FaceMatchController(FaceMatchService faceMatchService) {
        this.faceMatchService = faceMatchService;
    }

    @PostMapping(value = "/face-match", consumes = "multipart/form-data")
    public ResponseEntity<FaceMatchResponse> matchFaces(
            @RequestParam("referenceImage") MultipartFile referenceImage,
            @RequestParam("selfieImage") MultipartFile selfieImage) {

        FaceMatchResponse response = faceMatchService.matchFaces(referenceImage, selfieImage);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
