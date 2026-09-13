package com.infosys.kycverification.service;

import com.infosys.kycverification.config.FaceMatchProperties;
import com.infosys.kycverification.dto.FaceMatchResponse;
import com.infosys.kycverification.exception.InvalidFileException;
import com.infosys.kycverification.exception.ModelNotAvailableException;
import com.infosys.kycverification.exception.UnsupportedFileTypeException;
import com.infosys.kycverification.service.impl.CascadeClassifierProvider;
import com.infosys.kycverification.service.impl.OpenCvFaceMatchService;
import nu.pattern.OpenCV;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.File;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

/**
 * OpenCvFaceMatchService is exercised with the REAL OpenCV native library -
 * no mocked similarity scores. Tests that additionally require a real Haar
 * cascade model file and real face photographs are skipped when those are
 * not present, since this project deliberately does not bundle trained
 * biometric model files or sample face photographs (see README "Face Match
 * Setup" and "Testing"). Structural validation tests below do not require
 * either and always run.
 */
class OpenCvFaceMatchServiceTest {

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

    private FaceMatchProperties properties() {
        FaceMatchProperties props = new FaceMatchProperties();
        props.setFaceCascadePath("file:/opt/kyc-verification/models/haarcascade_frontalface_default.xml");
        props.setSimilarityThreshold(0.80);
        props.setMaxFileSizeBytes(10 * 1024 * 1024L);
        props.setAllowedContentTypes(List.of("image/jpeg", "image/png"));
        props.setNormalizedFaceSize(200);
        props.setMinFaceSizeFraction(0.10);
        return props;
    }

    @Test
    void rejectsMissingReferenceImage() {
        assumeTrue(openCvAvailable, "OpenCV native library not available on this machine.");
        OpenCvFaceMatchService service = new OpenCvFaceMatchService(properties(), new CascadeClassifierProvider());
        MockMultipartFile selfie = new MockMultipartFile("selfieImage", "selfie.jpg", "image/jpeg", new byte[]{1, 2, 3});

        assertThrows(InvalidFileException.class, () -> service.matchFaces(null, selfie));
    }

    @Test
    void rejectsUnsupportedContentType() {
        assumeTrue(openCvAvailable, "OpenCV native library not available on this machine.");
        OpenCvFaceMatchService service = new OpenCvFaceMatchService(properties(), new CascadeClassifierProvider());
        MockMultipartFile reference = new MockMultipartFile("referenceImage", "ref.gif", "image/gif", new byte[]{1, 2, 3});
        MockMultipartFile selfie = new MockMultipartFile("selfieImage", "selfie.jpg", "image/jpeg", new byte[]{1, 2, 3});

        assertThrows(UnsupportedFileTypeException.class, () -> service.matchFaces(reference, selfie));
    }

    @Test
    void failsClearlyWhenCascadeModelMissing() {
        assumeTrue(openCvAvailable, "OpenCV native library not available on this machine.");
        FaceMatchProperties props = properties();
        props.setFaceCascadePath("file:/definitely/not/a/real/path/cascade.xml");
        OpenCvFaceMatchService service = new OpenCvFaceMatchService(props, new CascadeClassifierProvider());

        MockMultipartFile reference = new MockMultipartFile("referenceImage", "ref.jpg", "image/jpeg", tinyValidJpegBytes());
        MockMultipartFile selfie = new MockMultipartFile("selfieImage", "selfie.jpg", "image/jpeg", tinyValidJpegBytes());

        assertThrows(ModelNotAvailableException.class, () -> service.matchFaces(reference, selfie));
    }

    @Test
    void realFaceMatchAgainstSampleImages() {
        assumeTrue(openCvAvailable, "OpenCV native library not available on this machine.");
        File cascade = new File("/opt/kyc-verification/models/haarcascade_frontalface_default.xml");
        assumeTrue(cascade.isFile(),
                "Haar cascade model not installed - skipping end-to-end face match test. "
                        + "See README 'Face Match Setup'.");
        File matchingA = new File("src/test/resources/faces/person-a-1.jpg");
        File matchingB = new File("src/test/resources/faces/person-a-2.jpg");
        assumeTrue(matchingA.isFile() && matchingB.isFile(),
                "Sample face photographs not provided in src/test/resources/faces - "
                        + "this project does not bundle biometric sample images. "
                        + "Supply your own pair to exercise this end-to-end scenario.");

        FaceMatchProperties props = properties();
        props.setFaceCascadePath("file:" + cascade.getAbsolutePath());
        OpenCvFaceMatchService service = new OpenCvFaceMatchService(props, new CascadeClassifierProvider());

        try {
            MockMultipartFile ref = new MockMultipartFile("referenceImage", matchingA.getName(), "image/jpeg",
                    java.nio.file.Files.readAllBytes(matchingA.toPath()));
            MockMultipartFile selfie = new MockMultipartFile("selfieImage", matchingB.getName(), "image/jpeg",
                    java.nio.file.Files.readAllBytes(matchingB.toPath()));

            FaceMatchResponse response = service.matchFaces(ref, selfie);

            assertTrue(response.getSimilarityScore() >= 0.0 && response.getSimilarityScore() <= 1.0);
            assertEquals(props.getSimilarityThreshold(), response.getThreshold());
        } catch (Exception e) {
            fail("Real face match against sample images failed: " + e.getMessage());
        }
    }

    /** Minimal 1x1 valid JPEG so decode() succeeds before the cascade-loading check is reached where relevant. */
    private byte[] tinyValidJpegBytes() {
        try {
            java.awt.image.BufferedImage img = new java.awt.image.BufferedImage(10, 10, java.awt.image.BufferedImage.TYPE_INT_RGB);
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            javax.imageio.ImageIO.write(img, "jpg", baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
