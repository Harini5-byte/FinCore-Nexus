package com.infosys.kycverification.service;

import com.infosys.kycverification.dto.FaceMatchResponse;
import org.springframework.web.multipart.MultipartFile;

public interface FaceMatchService {

    /**
     * Detects a single face in each of the two supplied images, extracts a
     * texture-based feature descriptor from each, and compares them to
     * produce an actual similarity score against the configured threshold.
     */
    FaceMatchResponse matchFaces(MultipartFile referenceImage, MultipartFile selfieImage);
}
