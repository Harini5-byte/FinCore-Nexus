package com.infosys.kyc.facematch;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/facematch")
public class FaceMatchController {

    private final FaceMatchService faceMatchService;

    public FaceMatchController(FaceMatchService faceMatchService) {
        this.faceMatchService = faceMatchService;
    }

    // Changed from two String params to real file uploads
    @PostMapping(value = "/verify", consumes = "multipart/form-data")
    public FaceMatchResponse verify(
            @RequestParam("customerImage") MultipartFile customerImage,
            @RequestParam("documentImage") MultipartFile documentImage) {

        return faceMatchService.matchFaces(customerImage, documentImage);
    }
}