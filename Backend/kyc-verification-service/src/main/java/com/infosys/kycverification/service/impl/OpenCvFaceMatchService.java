package com.infosys.kycverification.service.impl;

import com.infosys.kycverification.config.FaceMatchProperties;
import com.infosys.kycverification.dto.FaceMatchResponse;
import com.infosys.kycverification.exception.MultipleFacesDetectedException;
import com.infosys.kycverification.exception.NoFaceDetectedException;
import com.infosys.kycverification.service.FaceMatchService;
import com.infosys.kycverification.util.FileValidationUtil;
import com.infosys.kycverification.util.ImageUtil;
import org.opencv.core.*;
import org.opencv.imgproc.Imgproc;
import org.opencv.objdetect.CascadeClassifier;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class OpenCvFaceMatchService implements FaceMatchService {

    private static final int GRID_SIZE = 8;

    private final FaceMatchProperties properties;
    private final CascadeClassifierProvider cascadeProvider;

    public OpenCvFaceMatchService(FaceMatchProperties properties, CascadeClassifierProvider cascadeProvider) {
        this.properties = properties;
        this.cascadeProvider = cascadeProvider;
    }

    @Override
    public FaceMatchResponse matchFaces(MultipartFile referenceImage, MultipartFile selfieImage) {
        FileValidationUtil.validate(referenceImage, "referenceImage",
                properties.getAllowedContentTypes(), properties.getMaxFileSizeBytes());
        FileValidationUtil.validate(selfieImage, "selfieImage",
                properties.getAllowedContentTypes(), properties.getMaxFileSizeBytes());

        CascadeClassifier faceCascade = cascadeProvider.getFaceCascade(properties.getFaceCascadePath());

        Mat referenceMat = ImageUtil.decode(readBytes(referenceImage), "referenceImage");
        Mat selfieMat = ImageUtil.decode(readBytes(selfieImage), "selfieImage");

        try {
            Mat referenceFace = extractSingleFace(referenceMat, faceCascade, "referenceImage");
            Mat selfieFace = extractSingleFace(selfieMat, faceCascade, "selfieImage");

            double similarity = compareGridLbp(referenceFace, selfieFace);
            similarity = Math.round(similarity * 10000.0) / 10000.0;

            boolean matched = similarity >= properties.getSimilarityThreshold();

            referenceFace.release();
            selfieFace.release();

            return new FaceMatchResponse(
                    matched ? "MATCHED" : "NO_MATCH",
                    matched,
                    similarity,
                    properties.getSimilarityThreshold());
        } finally {
            referenceMat.release();
            selfieMat.release();
        }
    }

    private double compareGridLbp(Mat normalizedFaceA, Mat normalizedFaceB) {
        Mat lbpA = ImageUtil.computeLbp(normalizedFaceA);
        Mat lbpB = ImageUtil.computeLbp(normalizedFaceB);

        int size = normalizedFaceA.rows();
        int cellSize = size / GRID_SIZE;

        List<Double> cellCorrelations = new ArrayList<>();

        for (int row = 0; row < GRID_SIZE; row++) {
            for (int col = 0; col < GRID_SIZE; col++) {

                Rect cellRect = new Rect(col * cellSize, row * cellSize, cellSize, cellSize);

                Mat cellA = new Mat(lbpA, cellRect);
                Mat cellB = new Mat(lbpB, cellRect);

                Mat histA = buildNormalizedHistogram(cellA);
                Mat histB = buildNormalizedHistogram(cellB);

                double correlation = Imgproc.compareHist(histA, histB, Imgproc.HISTCMP_CORREL);
                cellCorrelations.add(correlation);

                cellA.release();
                cellB.release();
                histA.release();
                histB.release();
            }
        }

        lbpA.release();
        lbpB.release();

        double averageCorrelation = cellCorrelations.stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);

        return clamp((averageCorrelation + 1.0) / 2.0, 0.0, 1.0);
    }

    private Mat buildNormalizedHistogram(Mat singleChannelRegion) {
        Mat hist = new Mat();
        MatOfInt histSize = new MatOfInt(256);
        MatOfFloat ranges = new MatOfFloat(0f, 256f);
        MatOfInt channels = new MatOfInt(0);

        Imgproc.calcHist(
                List.of(singleChannelRegion),
                channels,
                new Mat(),
                hist,
                histSize,
                ranges);

        Core.normalize(hist, hist, 0, 1, Core.NORM_MINMAX);

        histSize.release();
        ranges.release();
        channels.release();

        return hist;
    }

    private Mat extractSingleFace(Mat bgrImage, CascadeClassifier faceCascade, String fieldName) {
        Mat gray = ImageUtil.toGray(bgrImage);
        Imgproc.equalizeHist(gray, gray);

        MatOfRect detections = new MatOfRect();
        int minDimension = (int) (Math.min(bgrImage.rows(), bgrImage.cols()) * properties.getMinFaceSizeFraction());
        faceCascade.detectMultiScale(
                gray,
                detections,
                1.1,
                5,
                0,
                new Size(minDimension, minDimension),
                new Size());

        Rect[] faces = detections.toArray();
        detections.release();

        if (faces.length == 0) {
            gray.release();
            throw new NoFaceDetectedException("No face detected in '" + fieldName + "'.");
        }
        if (faces.length > 1) {
            gray.release();
            throw new MultipleFacesDetectedException(
                    "Multiple faces (" + faces.length + ") detected in '" + fieldName
                            + "'. Exactly one face is expected.", faces.length);
        }

        Rect faceRect = faces[0];
        Mat faceRegion = new Mat(gray, faceRect);
        Mat normalized = new Mat();

        int rawSize = properties.getNormalizedFaceSize();
        int gridAlignedSize = (rawSize / GRID_SIZE) * GRID_SIZE;

        Imgproc.resize(faceRegion, normalized, new Size(gridAlignedSize, gridAlignedSize));

        gray.release();
        faceRegion.release();
        return normalized;
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