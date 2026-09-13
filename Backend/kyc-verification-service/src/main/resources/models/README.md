# Model files (not bundled)

This directory is a placeholder. This project deliberately does **not**
bundle trained biometric/OCR model binaries in source control:

- `haarcascade_frontalface_default.xml` (OpenCV frontal-face Haar cascade)
- `haarcascade_eye_tree_eyeglasses.xml` (OpenCV eye Haar cascade)
- Tesseract `tessdata` language files (e.g. `eng.traineddata`)

Download these from their official upstream projects and point the service
at them via configuration - see the root `README.md` sections
**"OCR Setup"** and **"Face Match / Liveness Setup"**.

If these files are not present at the configured paths, the corresponding
API calls fail with HTTP 503 `ENGINE_NOT_AVAILABLE` rather than returning a
fabricated result.
