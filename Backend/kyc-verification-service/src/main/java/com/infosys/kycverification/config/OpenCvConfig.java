package com.infosys.kycverification.config;

import nu.pattern.OpenCV;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.boot.context.event.ApplicationReadyEvent;

/**
 * Loads the native OpenCV shared library bundled inside the org.openpnp:opencv
 * artifact exactly once at application startup.
 *
 * <p>If the native library cannot be loaded for the current OS/architecture,
 * we let this fail loudly at startup rather than allowing the Face Match or
 * Liveness services to silently fall back to a fake result later.</p>
 */
@Configuration
public class OpenCvConfig {

    private static final Logger log = LoggerFactory.getLogger(OpenCvConfig.class);

    @EventListener(ApplicationReadyEvent.class)
    public void loadOpenCvNativeLibrary() {
        try {
            OpenCV.loadLocally();
            log.info("OpenCV native library loaded successfully.");
        } catch (Throwable t) {
            // Intentionally not swallowed: Face Match / Liveness endpoints will
            // fail clearly on first use via ModelNotAvailableException instead
            // of returning a fabricated result.
            log.error("Failed to load OpenCV native library. Face Match and " +
                    "Liveness Detection endpoints will fail until this is resolved. " +
                    "See README 'Face Match / Liveness Setup'.", t);
        }
    }
}
