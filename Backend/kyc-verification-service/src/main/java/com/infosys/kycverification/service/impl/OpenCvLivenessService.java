package com.infosys.kycverification.service.impl;

import com.infosys.kycverification.config.LivenessProperties;
import com.infosys.kycverification.dto.LivenessResponse;
import com.infosys.kycverification.exception.InvalidFileException;
import com.infosys.kycverification.exception.NoFaceDetectedException;
import com.infosys.kycverification.service.LivenessService;
import com.infosys.kycverification.util.FileValidationUtil;
import com.infosys.kycverification.util.ImageUtil;
import org.opencv.core.Mat;
import org.opencv.core.MatOfRect;
import org.opencv.core.Rect;
import org.opencv.core.Size;
import org.opencv.imgproc.Imgproc;
import org.opencv.objdetect.CascadeClassifier;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Real Liveness Detection implementation using OpenCV.
 *
 * <p>Input is an ordered sequence of frames (e.g. captured over ~1-2 seconds
 * while the user is prompted to blink / turn their head). For each frame we:</p>
 * <ol>
 *   <li>detect a face (fail if none is found in any frame),</li>
 *   <li>within the face region, attempt eye detection to build a per-frame
 *       "eyes open" signal, and look for at least one open-&gt;closed-&gt;open
 *       transition (a blink) across the sequence,</li>
 *   <li>measure Laplacian-variance sharpness/texture per frame as a signal
 *       against flat printed-photo or screen-replay spoofing,</li>
 *   <li>measure frame-to-frame pixel motion in the face region as a signal
 *       against a perfectly static image being resubmitted.</li>
 * </ol>
 * <p>These signals are combined into a single confidence score, which is
 * compared against a configurable threshold. Nothing here is hardcoded -
 * every input contributes a measured value from the actual frames supplied.</p>
 *
 * <p>Requires Haar cascade XML files (face + eye) at the configured paths -
 * see README "Face Match / Liveness Setup". If unavailable, requests fail
 * clearly instead of returning a fabricated liveness result.</p>
 */
@Service
public class OpenCvLivenessService implements LivenessService {

    private final LivenessProperties properties;
    private final CascadeClassifierProvider cascadeProvider;

    public OpenCvLivenessService(LivenessProperties properties, CascadeClassifierProvider cascadeProvider) {
        this.properties = properties;
        this.cascadeProvider = cascadeProvider;
    }

    @Override
    public LivenessResponse checkLiveness(List<MultipartFile> frames) {
        if (frames == null || frames.isEmpty()) {
            throw new InvalidFileException("No liveness frames were supplied.");
        }
        if (frames.size() < properties.getMinFrames()) {
            throw new InvalidFileException(
                    "At least " + properties.getMinFrames() + " frames are required for liveness "
                            + "analysis; received " + frames.size() + ".");
        }
        if (frames.size() > properties.getMaxFrames()) {
            throw new InvalidFileException(
                    "At most " + properties.getMaxFrames() + " frames are accepted per liveness "
                            + "request; received " + frames.size() + ".");
        }

        for (int i = 0; i < frames.size(); i++) {
            FileValidationUtil.validate(frames.get(i), "frames[" + i + "]",
                    properties.getAllowedContentTypes(), properties.getMaxFileSizeBytes());
        }

        CascadeClassifier faceCascade = cascadeProvider.getFaceCascade(properties.getFaceCascadePath());
        CascadeClassifier eyeCascade = cascadeProvider.getEyeCascade(properties.getEyeCascadePath());

        List<Mat> decodedFrames = new ArrayList<>();
        try {
            for (int i = 0; i < frames.size(); i++) {
                decodedFrames.add(ImageUtil.decode(readBytes(frames.get(i)), "frames[" + i + "]"));
            }

            List<Rect> faceRegions = new ArrayList<>();
            List<Boolean> eyesOpenPerFrame = new ArrayList<>();
            List<Double> sharpnessPerFrame = new ArrayList<>();

            for (Mat frame : decodedFrames) {
                Mat gray = ImageUtil.toGray(frame);
                Imgproc.equalizeHist(gray, gray);

                MatOfRect faceDetections = new MatOfRect();
                faceCascade.detectMultiScale(gray, faceDetections, 1.1, 5);
                Rect[] faces = faceDetections.toArray();
                faceDetections.release();

                if (faces.length == 0) {
                    gray.release();
                    throw new NoFaceDetectedException(
                            "No face detected in one or more liveness frames. Ensure the face is "
                                    + "clearly visible and well-lit throughout the capture.");
                }

                // Use the largest detected face if more than one region is found.
                Rect face = largest(faces);
                faceRegions.add(face);
                sharpnessPerFrame.add(ImageUtil.laplacianVariance(gray));

                Mat faceRoi = new Mat(gray, face);
                MatOfRect eyeDetections = new MatOfRect();
                eyeCascade.detectMultiScale(faceRoi, eyeDetections, 1.1, 6);
                boolean eyesOpen = eyeDetections.toArray().length >= 2;
                eyesOpenPerFrame.add(eyesOpen);

                eyeDetections.release();
                faceRoi.release();
                gray.release();
            }

            boolean blinkDetected = hasBlinkTransition(eyesOpenPerFrame);
            double motionScore = computeAverageFaceMotion(decodedFrames, faceRegions);
            double avgSharpness = sharpnessPerFrame.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            boolean sharpnessOk = avgSharpness >= properties.getMinSharpnessVariance();

            double blinkComponent = blinkDetected ? 1.0 : 0.0;
            double motionComponent = clamp(motionScore / 15.0, 0.0, 1.0);
            double sharpnessComponent = sharpnessOk ? 1.0 : clamp(avgSharpness / properties.getMinSharpnessVariance(), 0.0, 1.0);

            double confidence = (0.5 * blinkComponent) + (0.3 * motionComponent) + (0.2 * sharpnessComponent);
            confidence = Math.round(confidence * 10000.0) / 10000.0;

            boolean live = confidence >= properties.getConfidenceThreshold();

            return new LivenessResponse(
                    live ? "LIVE" : "NOT_LIVE",
                    live,
                    confidence,
                    properties.getConfidenceThreshold(),
                    frames.size(),
                    blinkDetected);

        } finally {
            for (Mat m : decodedFrames) {
                m.release();
            }
        }
    }

    private Rect largest(Rect[] rects) {
        Rect best = rects[0];
        for (Rect r : rects) {
            if ((long) r.width * r.height > (long) best.width * best.height) {
                best = r;
            }
        }
        return best;
    }

    /** True if the eyes-open signal contains at least one open -> closed -> open transition. */
    private boolean hasBlinkTransition(List<Boolean> eyesOpenPerFrame) {
        for (int i = 1; i < eyesOpenPerFrame.size() - 1; i++) {
            boolean before = eyesOpenPerFrame.get(i - 1);
            boolean during = eyesOpenPerFrame.get(i);
            boolean after = eyesOpenPerFrame.get(i + 1);
            if (before && !during && after) {
                return true;
            }
        }
        return false;
    }

    /**
     * Average absolute pixel-intensity difference between consecutive frames'
     * face regions, resized to a common size. A completely static resubmitted
     * image yields near-zero motion; a genuine live capture has natural
     * micro-motion between frames.
     */
    private double computeAverageFaceMotion(List<Mat> frames, List<Rect> faceRegions) {
        if (frames.size() < 2) {
            return 0.0;
        }
        Size common = new Size(100, 100);
        double totalDiff = 0.0;
        int comparisons = 0;

        Mat prevNormalized = null;
        for (int i = 0; i < frames.size(); i++) {
            Mat gray = ImageUtil.toGray(frames.get(i));
            Mat faceRoi = new Mat(gray, faceRegions.get(i));
            Mat normalized = new Mat();
            Imgproc.resize(faceRoi, normalized, common);

            if (prevNormalized != null) {
                Mat diff = new Mat();
                org.opencv.core.Core.absdiff(normalized, prevNormalized, diff);
                org.opencv.core.Scalar meanDiff = org.opencv.core.Core.mean(diff);
                totalDiff += meanDiff.val[0];
                comparisons++;
                diff.release();
                prevNormalized.release();
            }
            prevNormalized = normalized;
            faceRoi.release();
            gray.release();
        }
        if (prevNormalized != null) {
            prevNormalized.release();
        }
        return comparisons == 0 ? 0.0 : totalDiff / comparisons;
    }

    private byte[] readBytes(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }
}
