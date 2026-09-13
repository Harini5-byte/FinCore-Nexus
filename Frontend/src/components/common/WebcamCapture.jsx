import { useEffect, useRef, useState } from "react";
import { Camera, RefreshCcw } from "lucide-react";

/**
 * Reusable webcam capture component.
 *
 * Shows a live camera preview. When the user clicks "Capture", it grabs
 * the current video frame and turns it into a real image File (same
 * shape as a file picked from disk via <input type="file">), then calls
 * onCapture(file) with it. The user can Retake if they don't like the shot.
 *
 * Props:
 *  - onCapture(file): called with a File object each time a photo is confirmed
 *  - buttonLabel: text for the capture button (default "Capture Photo")
 */
function WebcamCapture({ onCapture, buttonLabel = "Capture Photo" }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [error, setError] = useState("");
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
        // eslint-disable-next-line
    }, []);

    const startCamera = async () => {
        setError("");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error(err);
            setError(
                "Could not access your camera. Please allow camera permission in your browser and reload the page."
            );
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    };

    const capture = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
            (blob) => {
                if (!blob) return;
                const file = new File([blob], `capture-${Date.now()}.jpg`, {
                    type: "image/jpeg",
                });
                setPreviewUrl(URL.createObjectURL(blob));
                onCapture(file);
            },
            "image/jpeg",
            0.92
        );
    };

    const retake = () => {
        setPreviewUrl(null);
        onCapture(null);
        startCamera();
    };

    if (error) {
        return <div className="webcam-error">{error}</div>;
    }

    return (
        <div className="webcam-capture">
            {!previewUrl && (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="webcam-video"
                    />
                    <button
                        type="button"
                        className="webcam-action-btn"
                        onClick={capture}
                    >
                        <Camera size={18} />
                        {buttonLabel}
                    </button>
                </>
            )}

            {previewUrl && (
                <>
                    <img
                        src={previewUrl}
                        alt="Captured"
                        className="webcam-preview"
                    />
                    <button
                        type="button"
                        className="webcam-action-btn webcam-retake-btn"
                        onClick={retake}
                    >
                        <RefreshCcw size={18} />
                        Retake
                    </button>
                </>
            )}

            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    );
}

export default WebcamCapture;