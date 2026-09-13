package com.infosys.kycverification.util;

import com.infosys.kycverification.exception.InvalidFileException;
import org.opencv.core.Core;
import org.opencv.core.CvType;
import org.opencv.core.Mat;
import org.opencv.core.MatOfByte;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;

/**
 * Low-level OpenCV helpers shared by Face Match and Liveness Detection.
 * Every method here operates on the actual pixel data supplied by the
 * caller - nothing here fabricates a result.
 */
public final class ImageUtil {

    private ImageUtil() {
    }

    /** Decodes raw image bytes into an OpenCV BGR Mat. */
    public static Mat decode(byte[] bytes, String fieldName) {
        if (bytes == null || bytes.length == 0) {
            throw new InvalidFileException("'" + fieldName + "' contains no image data.");
        }
        Mat raw = new MatOfByte(bytes);
        Mat decoded = Imgcodecs.imdecode(raw, Imgcodecs.IMREAD_COLOR);
        raw.release();
        if (decoded.empty()) {
            throw new InvalidFileException(
                    "'" + fieldName + "' could not be decoded as an image. The file may be corrupted.");
        }
        return decoded;
    }

    public static Mat toGray(Mat bgr) {
        Mat gray = new Mat();
        Imgproc.cvtColor(bgr, gray, Imgproc.COLOR_BGR2GRAY);
        return gray;
    }

    /**
     * Computes the variance of the Laplacian of an image - a standard,
     * well-established measure of image sharpness/texture used as one
     * signal in print/screen spoof-attack detection (flat printed or
     * re-photographed images tend to have lower high-frequency variance
     * than a genuine live camera capture).
     */
    public static double laplacianVariance(Mat grayImage) {
        Mat laplacian = new Mat();
        Imgproc.Laplacian(grayImage, laplacian, CvType.CV_64F);
        org.opencv.core.MatOfDouble mean = new org.opencv.core.MatOfDouble();
        org.opencv.core.MatOfDouble stddev = new org.opencv.core.MatOfDouble();
        Core.meanStdDev(laplacian, mean, stddev);
        double sigma = stddev.get(0, 0)[0];
        laplacian.release();
        return sigma * sigma;
    }

    /**
     * Computes a Local Binary Pattern (LBP) image of a single-channel
     * grayscale Mat. LBP is a classical, well-documented texture/feature
     * descriptor used as the basis of the LBPH face-recognition algorithm:
     * each pixel is encoded as an 8-bit code describing whether its 8
     * neighbours are brighter or darker than itself, which is robust to
     * uniform lighting changes between two different photos of the same face.
     */
    public static Mat computeLbp(Mat grayImage) {
        int rows = grayImage.rows();
        int cols = grayImage.cols();
        Mat lbp = Mat.zeros(rows, cols, CvType.CV_8UC1);

        byte[] rowAbove = new byte[cols];
        byte[] rowCurrent = new byte[cols];
        byte[] rowBelow = new byte[cols];

        for (int i = 1; i < rows - 1; i++) {
            grayImage.get(i - 1, 0, rowAbove);
            grayImage.get(i, 0, rowCurrent);
            grayImage.get(i + 1, 0, rowBelow);

            for (int j = 1; j < cols - 1; j++) {
                int center = rowCurrent[j] & 0xFF;
                int code = 0;
                code |= ((rowAbove[j - 1] & 0xFF) >= center ? 1 : 0) << 7;
                code |= ((rowAbove[j] & 0xFF) >= center ? 1 : 0) << 6;
                code |= ((rowAbove[j + 1] & 0xFF) >= center ? 1 : 0) << 5;
                code |= ((rowCurrent[j + 1] & 0xFF) >= center ? 1 : 0) << 4;
                code |= ((rowBelow[j + 1] & 0xFF) >= center ? 1 : 0) << 3;
                code |= ((rowBelow[j] & 0xFF) >= center ? 1 : 0) << 2;
                code |= ((rowBelow[j - 1] & 0xFF) >= center ? 1 : 0) << 1;
                code |= ((rowCurrent[j - 1] & 0xFF) >= center ? 1 : 0);
                lbp.put(i, j, code);
            }
        }
        return lbp;
    }
}
