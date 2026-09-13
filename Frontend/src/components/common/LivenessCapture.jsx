import { useEffect, useRef, useState } from "react";
import { Activity, RefreshCcw, CheckCircle2 } from "lucide-react";

/**
 * Runs an automated, timed liveness capture sequence over the live webcam
 * feed: a few "eyes open" frames, a deliberate "close your eyes and hold"
 * frame, then a few more "eyes open" frames. This mirrors the exact
 * pattern that reliably passed real blink detection during manual testing.
 *
 * Props:
 *  - onComplete(files): called with an array of captured File objects
 *    once the full sequence finishes (or an empty array on retake).
 */
function LivenessCapture({ onComplete }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [cameraError, setCameraError] = useState("");
    const [phase, setPhase] = useState("idle");
    const [prompt, setPrompt] = useState("");
    const [framesCaptured, setFramesCaptured] = useState(0);
    const [totalFrames, setTotalFrames] = useState(0);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
        // eslint-disable-next-line
    }, []);

    const startCamera = async () => {
        setCameraError("");
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
            setCameraError(
                "Could not access your camera. Please allow camera permission and reload the page."
            );
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    };

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const captureFrame = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        return new Promise((resolve) => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(
                (blob) => {
                    const file = new File(
                        [blob],
                        `liveness-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,
                        { type: "image/jpeg" }
                    );
                    resolve(file);
                },
                "image/jpeg",
                0.92
            );
        });
    };

    const runSequence = async () => {
        const frames = [];
        setPhase("capturing");
        setFramesCaptured(0);
        setTotalFrames(6);

        setPrompt("Get ready — look directly at the camera");
        await wait(1000);

        frames.push(await captureFrame());
        setFramesCaptured(1);
        setPrompt("Stay still...");
        await wait(800);

        frames.push(await captureFrame());
        setFramesCaptured(2);
        setPrompt("Now close your eyes and hold...");
        await wait(1500);

        frames.push(await captureFrame()); // captured with eyes held closed
        setFramesCaptured(3);
        setPrompt("Now open your eyes again");
        await wait(800);

        frames.push(await captureFrame());
        setFramesCaptured(4);
        setPrompt("Hold still, almost done...");
        await wait(800);

        frames.push(await captureFrame());
        setFramesCaptured(5);
        await wait(600);

        frames.push(await captureFrame());
        setFramesCaptured(6);
        setPrompt("Done!");

        setPhase("done");
        onComplete(frames);
    };

    const retake = () => {
        setPhase("idle");
        setPrompt("");
        setFramesCaptured(0);
        onComplete([]);
    };

    if (cameraError) {
        return <div className="webcam-error">{cameraError}</div>;
    }

    return (
        <div className="webcam-capture">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="webcam-video"
            />

            {phase === "capturing" && (
                <div className="liveness-prompt">
                    <Activity size={18} />
                    {prompt}
                    <span className="liveness-progress">
                        {framesCaptured}/{totalFrames}
                    </span>
                </div>
            )}

            {phase === "idle" && (
                <button type="button" className="webcam-action-btn" onClick={runSequence}>
                    <Activity size={18} />
                    Start Liveness Check
                </button>
            )}

            {phase === "capturing" && (
                <button type="button" className="webcam-action-btn" disabled>
                    Capturing...
                </button>
            )}

            {phase === "done" && (
                <>
                    <div className="liveness-done">
                        <CheckCircle2 size={18} />
                        Capture complete — {framesCaptured} frames recorded
                    </div>
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

export default LivenessCapture;