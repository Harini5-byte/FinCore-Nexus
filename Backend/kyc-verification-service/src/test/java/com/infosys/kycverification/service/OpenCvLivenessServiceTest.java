package com.infosys.kycverification.service;

import com.infosys.kycverification.config.LivenessProperties;
import com.infosys.kycverification.exception.InvalidFileException;
import com.infosys.kycverification.exception.ModelNotAvailableException;
import com.infosys.kycverification.service.impl.CascadeClassifierProvider;
import com.infosys.kycverification.service.impl.OpenCvLivenessService;
import nu.pattern.OpenCV;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

/**
 * OpenCvLivenessService is exercised with the REAL OpenCV native library -
 * no hardcoded isLive/confidence values. A full end-to-end scenario needs
 * real webcam-style frame sequences of an actual face, which this project
 * does not bundle (see README "Testing" and "Liveness Detection Limitations");
 * validation and fail-fast behaviour below do not require real face frames
 * and always run.
 */
class OpenCvLivenessServiceTest {

    private static boolean openCvAvailable;

    @BeforeAll
    static void loadOpenCv() {
        try {
            OpenCV.loadLocally();
            openCvAvailable = true;
        } catch (Throwable t) {
            openCvAvailable = false;
        }
    }

    private LivenessProperties properties() {
        LivenessProperties props = new LivenessProperties();
        props.setFaceCascadePath("file:/opt/kyc-verification/models/haarcascade_frontalface_default.xml");
        props.setEyeCascadePath("file:/opt/kyc-verification/models/haarcascade_eye_tree_eyeglasses.xml");
        props.setMinFrames(5);
        props.setMaxFrames(30);
        props.setMaxFileSizeBytes(5 * 1024 * 1024L);
        props.setAllowedContentTypes(List.of("image/jpeg", "image/png"));
        props.setConfidenceThreshold(0.60);
        props.setMinSharpnessVariance(15.0);
        return props;
    }

    @Test
    void rejectsTooFewFrames() {
        assumeTrue(openCvAvailable, "OpenCV native library not available on this machine.");
        OpenCvLivenessService service = new OpenCvLivenessService(properties(), new CascadeClassifierProvider());

        List<MockMultipartFile> frames = new ArrayList<>();
        for (int i = 0; i < 2; i++) {
            frames.add(new MockMultipartFile("frames", "f" + i + ".jpg", "image/jpeg", tinyJpeg()));
        }

        assertThrows(InvalidFileException.class, () -> service.checkLiveness(new ArrayList<>(frames)));
    }

    @Test
    void rejectsEmptyFrameList() {
        assumeTrue(openCvAvailable, "OpenCV native library not available on this machine.");
        OpenCvLivenessService service = new OpenCvLivenessService(properties(), new CascadeClassifierProvider());

        assertThrows(InvalidFileException.class, () -> service.checkLiveness(List.of()));
    }

    @Test
    void failsClearlyWhenCascadeModelMissing() {
        assumeTrue(openCvAvailable, "OpenCV native library not available on this machine.");
        LivenessProperties props = properties();
        props.setFaceCascadePath("file:/definitely/not/a/real/path/cascade.xml");
        OpenCvLivenessService service = new OpenCvLivenessService(props, new CascadeClassifierProvider());

        List<MockMultipartFile> frames = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            frames.add(new MockMultipartFile("frames", "f" + i + ".jpg", "image/jpeg", tinyJpeg()));
        }

        assertThrows(ModelNotAvailableException.class, () -> service.checkLiveness(new ArrayList<>(frames)));
    }

    private byte[] tinyJpeg() {
        try {
            BufferedImage img = new BufferedImage(50, 50, BufferedImage.TYPE_INT_RGB);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            javax.imageio.ImageIO.write(img, "jpg", baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
