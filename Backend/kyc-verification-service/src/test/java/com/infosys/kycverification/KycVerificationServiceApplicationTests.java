package com.infosys.kycverification;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

/**
 * Verifies the Spring application context loads successfully with all
 * controllers, services and configuration properties wired.
 */
@SpringBootTest
@TestPropertySource(properties = {
        "kyc.verification.ocr.tessdata-path=/usr/share/tesseract-ocr/5/tessdata",
        "kyc.verification.face-match.face-cascade-path=file:/opt/kyc-verification/models/haarcascade_frontalface_default.xml",
        "kyc.verification.liveness.face-cascade-path=file:/opt/kyc-verification/models/haarcascade_frontalface_default.xml",
        "kyc.verification.liveness.eye-cascade-path=file:/opt/kyc-verification/models/haarcascade_eye_tree_eyeglasses.xml"
})
class KycVerificationServiceApplicationTests {

    @Test
    void contextLoads() {
        // Intentionally empty: a failure to start the Spring context fails this test.
    }
}
