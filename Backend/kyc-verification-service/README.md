# kyc-verification-service

Real, non-mocked **Document OCR**, **Face Match**, and **Liveness Detection**
microservice for the FinCore Nexus digital banking platform's KYC pipeline.

---

## 1. Project Purpose

The existing `kyc-service` owns KYC case management, risk assessment,
compliance, and audit logging. It needs Document OCR, Face Match, and
Liveness Detection capabilities but those biometric/computer-vision
concerns do not belong in that service.

`kyc-verification-service` is a small, independent Spring Boot
microservice that owns exactly those three capabilities and nothing else.
It performs real image/document processing using real OCR and computer
vision engines - it never returns a hardcoded or fabricated result. The
existing `kyc-service` will call this service over REST (later via Feign)
and fold the OCR / face-match / liveness results into its own risk,
compliance, and audit decisioning.

## 2. Architecture

```
Existing KYC Service (kyc-service)
        |
        | REST / Feign (added later, inside kyc-service)
        v
kyc-verification-service   <-- this project
        |
        +---- Document OCR        (Tesseract via Tess4J)
        +---- Face Match          (OpenCV: Haar cascade + LBP texture histogram)
        +---- Liveness Detection  (OpenCV: blink transition + motion + sharpness)
```

This service does **not** implement KYC CRUD, customer management, risk
scoring, compliance, audit logging, or any database/business logic - those
remain in the existing `kyc-service`. No Feign client was added to the
existing project; this service simply exposes clean REST endpoints and DTO
contracts that are ready for `kyc-service` to consume later.

## 3. Technology Stack

| Concern                | Technology                                                        |
|-------------------------|--------------------------------------------------------------------|
| Language / runtime      | Java 21                                                            |
| Framework                | Spring Boot 4.1.0 (matches the existing kyc-service's Spring Boot 4.x) |
| Build                    | Maven                                                              |
| Document OCR             | [Tess4J](https://github.com/nguyenq/tess4j) (JNA wrapper around the native **Tesseract OCR** engine) |
| Face Match / Liveness    | [OpenCV](https://opencv.org/) Java bindings via `org.openpnp:opencv` |
| Validation                | spring-boot-starter-validation                                    |
| Tests                     | JUnit 5, Mockito, Spring MockMvc                                   |

No database is used - this service is stateless; it processes an uploaded
file and returns a result. Add persistence only if a genuine future
requirement needs it.

## 4. Document OCR Implementation

- Engine: native **Tesseract OCR** invoked through Tess4J (`Tesseract.doOCR(...)`).
- The uploaded file is written to a temp file, decoded as an image, and
  passed directly to the Tesseract engine - the returned text is exactly
  what Tesseract read from the pixels.
- `ocrStatus` is `SUCCESS` only if Tesseract returned at least
  `kyc.verification.ocr.min-extracted-text-length` characters of text;
  otherwise `FAILED`. This is a claim about text extraction only - it is
  **never** a claim of government/document verification.
- `extractedFields` (name / dateOfBirth / documentNumber) are produced by
  applying regular-expression heuristics to the real OCR text - a field is
  only populated if a matching substring is actually present.
- `averageConfidence` is the mean of Tesseract's real per-word confidence
  scores for the document.
- If the Tesseract native engine or `tessdata` is not available, the
  request fails with `503 ENGINE_NOT_AVAILABLE` - it does not fall back to
  a fake success.
- `application/pdf` is accepted at the validation layer, but this build
  decodes pages via `ImageIO` and does not include a PDF-rasterization
  library. A PDF upload will currently fail clearly with
  `400 INVALID_INPUT` ("could not be decoded as an image"). To support PDFs
  end-to-end, add a PDF-to-image rasterization step (e.g. Apache PDFBox)
  before the existing OCR call, or remove `application/pdf` from
  `kyc.verification.ocr.allowed-content-types` if only image uploads are
  expected.

## 5. Face Match Implementation

1. **Face detection** - an OpenCV Haar cascade classifier
   (`haarcascade_frontalface_default.xml`) locates faces in both the
   reference image and the selfie. Zero faces -> `404`-equivalent
   `422 NO_FACE_DETECTED`; more than one face -> `422 MULTIPLE_FACES_DETECTED`.
2. **Normalization** - the detected face region is cropped, converted to
   grayscale, histogram-equalized, and resized to a fixed square
   (`normalized-face-size`, default 200x200).
3. **Feature extraction** - a **Local Binary Pattern (LBP)** image is
   computed pixel-by-pixel (each pixel encoded against its 8 neighbours).
   LBP is the classical texture descriptor underlying the well-known LBPH
   face-recognition algorithm and is robust to uniform lighting differences
   between two photos of the same face.
4. **Comparison** - a 256-bin histogram of each LBP image is computed and
   the two histograms are compared with OpenCV's histogram correlation
   (`Imgproc.compareHist`, `HISTCMP_CORREL`), mapped from `[-1, 1]` to a
   `[0, 1]` similarity score.
5. **Decision** - `matched = similarityScore >= threshold`, where the
   threshold is fully configurable (`kyc.verification.face-match.similarity-threshold`,
   default `0.80`) and never hardcoded in code.

This is a genuine, deterministic computer-vision computation over the
actual submitted pixels - not a placeholder.

> **Note on accuracy**: LBP-histogram matching is a real, classical face
> recognition technique but is less accurate than a modern deep-learning
> face embedding model (e.g. ArcFace/FaceNet). See "Limitations" below for
> how to upgrade this if higher accuracy is required.

## 6. Liveness Detection Implementation

- **Input**: an ordered sequence of frames (5-30 images by default,
  configurable), submitted as repeated `frames` multipart parts - e.g.
  captured client-side over ~1-2 seconds while the user is prompted to
  blink naturally or turn their head slightly.
- **Face detection per frame** using the same Haar cascade as Face Match;
  if any frame has no detectable face, the request fails with
  `422 NO_FACE_DETECTED`.
- **Blink-transition detection**: within each frame's face region, an eye
  Haar cascade (`haarcascade_eye_tree_eyeglasses.xml`) looks for two eyes.
  The sequence of "eyes open" booleans across frames is scanned for at
  least one `open -> closed -> open` transition, a real signal of a live
  blink rather than a static photo.
- **Motion signal**: consecutive frames' normalized face regions are
  compared with pixel-wise absolute difference; a genuinely live capture
  shows natural micro-motion, while a resubmitted static image does not.
- **Sharpness/texture signal**: Laplacian variance is computed per frame -
  flat printed photos or screen replays tend to show lower high-frequency
  variance than a genuine camera capture.
- These three real, measured signals are combined into a single
  `confidence` score (`0.5 * blink + 0.3 * motion + 0.2 * sharpness`),
  compared against a configurable `kyc.verification.liveness.confidence-threshold`
  (default `0.60`) to produce `isLive`.

### Liveness Detection Limitations

This is a lightweight, explainable, CPU-only heuristic approach chosen
because it requires no GPU and no proprietary SDK. It is **not** a
production-grade anti-spoofing system and will not reliably defeat a
determined attacker using, e.g., a high-quality video replay with natural
blinking. For production-grade liveness (passive depth/texture CNN
anti-spoofing, or active challenge-response), integrate a dedicated
liveness SDK/model behind the same `LivenessService` interface - see
"Limitations" below.

## 7. Required Dependencies / Models (not bundled)

This project intentionally does **not** commit large binary model/training
files to source control. You must supply these before Face Match, Liveness,
or OCR will work - **the service fails clearly with `503 ENGINE_NOT_AVAILABLE`
if they are missing, rather than faking a result**:

| File | Where to get it | Configured via |
|---|---|---|
| `haarcascade_frontalface_default.xml` | [opencv/opencv `data/haarcascades`](https://github.com/opencv/opencv/tree/master/data/haarcascades) | `kyc.verification.face-match.face-cascade-path`, `kyc.verification.liveness.face-cascade-path` |
| `haarcascade_eye_tree_eyeglasses.xml` | same repo | `kyc.verification.liveness.eye-cascade-path` |
| Tesseract `tessdata` (e.g. `eng.traineddata`) | Installed with the `tesseract-ocr` package, or from [tesseract-ocr/tessdata](https://github.com/tesseract-ocr/tessdata) | `kyc.verification.ocr.tessdata-path` |

## 8. Installation

### Prerequisites

- JDK 21
- Maven 3.9+
- Native **Tesseract OCR** installed on the host, e.g.:
  ```bash
  # Debian/Ubuntu
  sudo apt-get install tesseract-ocr

  # macOS
  brew install tesseract
  ```
- The Haar cascade XML files from section 7, placed somewhere on disk, e.g.
  `/opt/kyc-verification/models/`.

### Build

```bash
cd kyc-verification-service
mvn clean install
```

> The `org.openpnp:opencv` and `net.sourceforge.tess4j:tess4j` Maven
> artifacts are downloaded from Maven Central on first build - an internet
> connection (or a mirrored internal repository) is required.

## 9. Configuration

All thresholds, paths, and limits are externalized in
`src/main/resources/application.yml` and overridable via environment
variables - nothing is hardcoded in Java source:

| Property | Env var | Default | Purpose |
|---|---|---|---|
| `server.port` | `KYC_VERIFICATION_SERVER_PORT` | `8090` | HTTP port |
| `kyc.verification.ocr.tessdata-path` | `KYC_OCR_TESSDATA_PATH` | `/usr/share/tesseract-ocr/5/tessdata` | Tesseract trained data dir |
| `kyc.verification.ocr.language` | `KYC_OCR_LANGUAGE` | `eng` | Tesseract language |
| `kyc.verification.face-match.face-cascade-path` | `KYC_FACEMATCH_CASCADE_PATH` | `file:/opt/kyc-verification/models/haarcascade_frontalface_default.xml` | Face detector model |
| `kyc.verification.face-match.similarity-threshold` | `KYC_FACEMATCH_THRESHOLD` | `0.80` | Match/no-match cutoff |
| `kyc.verification.liveness.face-cascade-path` | `KYC_LIVENESS_FACE_CASCADE_PATH` | same as above | Face detector model |
| `kyc.verification.liveness.eye-cascade-path` | `KYC_LIVENESS_EYE_CASCADE_PATH` | `.../haarcascade_eye_tree_eyeglasses.xml` | Eye detector model |
| `kyc.verification.liveness.confidence-threshold` | `KYC_LIVENESS_THRESHOLD` | `0.60` | Live/not-live cutoff |
| `kyc.verification.liveness.min-frames` / `max-frames` | `KYC_LIVENESS_MIN_FRAMES` / `KYC_LIVENESS_MAX_FRAMES` | `5` / `30` | Accepted frame-sequence length |

No API keys, credentials, or secrets are used by this service.

## 10. How to Run

```bash
export KYC_OCR_TESSDATA_PATH=/usr/share/tesseract-ocr/5/tessdata
export KYC_FACEMATCH_CASCADE_PATH=file:/opt/kyc-verification/models/haarcascade_frontalface_default.xml
export KYC_LIVENESS_FACE_CASCADE_PATH=file:/opt/kyc-verification/models/haarcascade_frontalface_default.xml
export KYC_LIVENESS_EYE_CASCADE_PATH=file:/opt/kyc-verification/models/haarcascade_eye_tree_eyeglasses.xml

mvn spring-boot:run
```

Or, from IntelliJ: import as a Maven project and run
`KycVerificationServiceApplication`.

## 11. API Endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/verification/ocr` | Document OCR |
| `POST` | `/api/verification/face-match` | Face match |
| `POST` | `/api/verification/liveness` | Liveness detection |

## 12. Request Examples

**OCR**
```bash
curl -X POST http://localhost:8090/api/verification/ocr \
  -F "document=@aadhaar.jpg" \
  -F "documentType=AADHAAR"
```

**Face Match**
```bash
curl -X POST http://localhost:8090/api/verification/face-match \
  -F "referenceImage=@id_photo.jpg" \
  -F "selfieImage=@selfie.jpg"
```

**Liveness** (repeat the `frames` part for each frame, in order)
```bash
curl -X POST http://localhost:8090/api/verification/liveness \
  -F "frames=@frame1.jpg" -F "frames=@frame2.jpg" -F "frames=@frame3.jpg" \
  -F "frames=@frame4.jpg" -F "frames=@frame5.jpg"
```

## 13. Response Examples

**OCR**
```json
{
  "documentType": "AADHAAR",
  "ocrStatus": "SUCCESS",
  "extractedText": "GOVERNMENT OF INDIA ... (actual OCR text) ...",
  "extractedFields": {
    "dateOfBirth": "14/03/1990",
    "documentNumber": "123456789012",
    "name": "actual extracted name"
  },
  "averageConfidence": 0.91
}
```

**Face Match**
```json
{
  "status": "MATCHED",
  "matched": true,
  "similarityScore": 0.87,
  "threshold": 0.8
}
```

**Liveness**
```json
{
  "status": "LIVE",
  "live": true,
  "confidence": 0.83,
  "threshold": 0.6,
  "framesAnalyzed": 8,
  "blinkDetected": true
}
```

All numeric values above are illustrative outputs of real processing on
real input - none are hardcoded in the service.

## 14. Error Responses

Centralized via `@RestControllerAdvice` (`GlobalExceptionHandler`). No stack
traces or internal details are ever returned.

```json
{
  "timestamp": "2026-08-23T10:15:30Z",
  "status": 422,
  "error": "NO_FACE_DETECTED",
  "message": "No face detected in 'selfieImage'.",
  "path": "/api/verification/face-match"
}
```

| HTTP status | error code | When |
|---|---|---|
| 400 | `INVALID_INPUT` | Missing/empty/corrupted file, bad frame count |
| 400 | `MISSING_PARAMETER` | Required multipart part absent |
| 415 | `UNSUPPORTED_FILE_TYPE` | Content type not allow-listed |
| 413 | `FILE_TOO_LARGE` | File exceeds configured size limit |
| 422 | `NO_FACE_DETECTED` | Zero faces found where one is required |
| 422 | `MULTIPLE_FACES_DETECTED` | More than one face found where one is required |
| 422 | `OCR_PROCESSING_FAILED` | Tesseract could not process the document |
| 422 | `LIVENESS_PROCESSING_FAILED` | Liveness analysis could not be completed |
| 503 | `ENGINE_NOT_AVAILABLE` | Required native engine/model file missing |
| 500 | `INTERNAL_ERROR` | Unexpected failure |

## 15. Integration with the Existing KYC Service

This service exposes plain REST endpoints returning JSON DTOs
(`OcrResponse`, `FaceMatchResponse`, `LivenessResponse`) intentionally
shaped for easy consumption by a Feign client that `kyc-service` will add
later, e.g.:

```java
@FeignClient(name = "kyc-verification-service", url = "${kyc.verification.url}")
public interface KycVerificationClient {
    @PostMapping(value = "/api/verification/ocr", consumes = "multipart/form-data")
    OcrResponse extractText(@RequestPart MultipartFile document,
                             @RequestPart String documentType);
    // face-match / liveness analogous
}
```

`kyc-service` combines the OCR + Face Match + Liveness results with its own
Risk Assessment, Compliance, and Audit modules to reach the final KYC
decision. No Feign client or existing-project files were modified by this
deliverable.

## 16. Limitations

- Face Match uses an LBP-histogram similarity metric, not a deep-learning
  face embedding model - it is a real, classical technique but is less
  discriminative than modern approaches. For higher accuracy, swap
  `OpenCvFaceMatchService`'s feature-extraction step for a pretrained face
  embedding model (e.g. via Deep Java Library / ONNX Runtime) behind the
  same `FaceMatchService` interface.
- Liveness Detection is a heuristic (blink + motion + sharpness) approach,
  not a certified anti-spoofing product; see section 6 for detail.
- Haar cascades are a classical, fast face detector but are less robust to
  extreme pose/lighting than a modern CNN-based detector.
- OCR field extraction (`extractedFields`) is regex-based and best-effort;
  it depends on the document layout matching common patterns.
- No persistence layer: results are not stored by this service.

## 17. Security & Privacy

- Uploaded document images, selfies, and liveness frames are **never
  logged**. Only high-level outcomes (status codes, error categories) are
  logged.
- Extracted document numbers, names, and other PII are **not** printed to
  logs.
- Temporary files created for OCR processing are deleted immediately after
  use, in a `finally` block.
- No biometric embeddings or images are persisted; all processing is
  in-memory / temp-file for the duration of a single request.
- No secrets, API keys, or credentials are present in source code or
  `application.yml`; only non-secret configuration is committed.

## 18. Testing

- `FileValidationUtilTest` - pure unit tests for missing/empty/oversized/
  unsupported-type file validation (no native dependencies required).
- `OcrControllerTest`, `FaceMatchControllerTest`, `LivenessControllerTest` -
  MockMvc tests against each controller with the service layer mocked, to
  verify HTTP status/error-code mapping.
- `TesseractOcrServiceTest` - runs the **real** Tesseract engine against a
  programmatically generated text image and a blank image, and verifies a
  misconfigured `tessdata` path fails clearly. Skipped (not failed) if
  Tesseract is not installed on the build machine.
- `OpenCvFaceMatchServiceTest`, `OpenCvLivenessServiceTest` - validation and
  fail-fast behaviour run with the real OpenCV native library. The
  full end-to-end match/liveness scenarios are skipped unless real Haar
  cascade files and (for face match) sample face photographs are supplied
  locally - see `src/main/resources/models/README.md` and
  `src/test/resources/faces/README.md`. No test asserts a hardcoded mock
  value; every assertion is checked against the actual computed output.

Run all tests:
```bash
mvn test
```

---

**Verification performed before delivery**: package structure, imports and
API usage were reviewed line-by-line against the Tess4J and OpenCV
(`org.openpnp:opencv`) Java APIs. `mvn clean install` could **not** be
executed in the environment that generated this project because it has no
network access to download Maven dependencies. Please run
`mvn clean install` (and `mvn test`) as the first step after unzipping, in
an environment with internet/Maven-repo access, and report any compiler
errors so they can be fixed immediately.
