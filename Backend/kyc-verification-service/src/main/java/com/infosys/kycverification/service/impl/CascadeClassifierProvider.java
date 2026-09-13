package com.infosys.kycverification.service.impl;

import com.infosys.kycverification.exception.ModelNotAvailableException;
import org.opencv.objdetect.CascadeClassifier;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Loads and caches OpenCV Haar cascade classifiers (face / eye) from a
 * configured path. Supports classpath:, file: and plain filesystem paths.
 *
 * <p>These trained cascade XML files are NOT bundled with this artifact -
 * they must be supplied by the deploying team (see README "Face Match /
 * Liveness Setup"). If the configured path does not resolve to a loadable
 * cascade, a {@link ModelNotAvailableException} is thrown so the caller
 * fails clearly instead of fabricating a detection result.</p>
 */
@Component
public class CascadeClassifierProvider {

    private final ResourceLoader resourceLoader = new DefaultResourceLoader();
    private final Map<String, CascadeClassifier> cache = new ConcurrentHashMap<>();

    public CascadeClassifier getFaceCascade(String configuredPath) {
        return load(configuredPath);
    }

    public CascadeClassifier getEyeCascade(String configuredPath) {
        return load(configuredPath);
    }

    private CascadeClassifier load(String configuredPath) {
        if (configuredPath == null || configuredPath.isBlank()) {
            throw new ModelNotAvailableException(
                    "No Haar cascade path configured. See README 'Face Match / Liveness Setup'.");
        }
        return cache.computeIfAbsent(configuredPath, this::loadFromResource);
    }

    private CascadeClassifier loadFromResource(String configuredPath) {
        Resource resource = resourceLoader.getResource(configuredPath);
        if (!resource.exists()) {
            throw new ModelNotAvailableException(
                    "Haar cascade model file not found at '" + configuredPath + "'. "
                            + "Download it from the official OpenCV project and configure its path. "
                            + "See README 'Face Match / Liveness Setup'.");
        }

        Path localPath;
        try {
            localPath = resource.getFile().toPath();
        } catch (IOException notOnFilesystem) {
            // Resource is inside a jar (e.g. classpath resource) - OpenCV's
            // native CascadeClassifier requires a real filesystem path, so
            // extract it once to a temp file.
            localPath = extractToTempFile(resource, configuredPath);
        }

        CascadeClassifier classifier = new CascadeClassifier(localPath.toString());
        if (classifier.empty()) {
            throw new ModelNotAvailableException(
                    "Failed to load Haar cascade from '" + configuredPath + "'. "
                            + "The file may be missing, corrupted, or not a valid OpenCV cascade XML. "
                            + "See README 'Face Match / Liveness Setup'.");
        }
        return classifier;
    }

    private Path extractToTempFile(Resource resource, String configuredPath) {
        try (InputStream in = resource.getInputStream()) {
            Path tempFile = Files.createTempFile("kyc-cascade-", ".xml");
            Files.copy(in, tempFile, StandardCopyOption.REPLACE_EXISTING);
            tempFile.toFile().deleteOnExit();
            return tempFile;
        } catch (IOException e) {
            throw new ModelNotAvailableException(
                    "Failed to read Haar cascade resource '" + configuredPath + "': " + e.getMessage(), e);
        }
    }
}
