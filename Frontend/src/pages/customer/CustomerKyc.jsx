import { useEffect, useState } from "react";
import axios from "axios";

import {
    ShieldCheck,
    FileText,
    ScanFace,
    Activity,
    Gauge,
    ClipboardCheck,
    CheckCircle2,
    XCircle,
    Loader2,
} from "lucide-react";
import CustomerLayout from "../../components/layout/CustomerLayout";
import WebcamCapture from "../../components/common/WebcamCapture";
import LivenessCapture from "../../components/common/LivenessCapture";
import "./CustomerKyc.css";

const KYC_API = "http://localhost:8080/kyc";
const OCR_API = "http://localhost:8080/ocr";
const FACEMATCH_API = "http://localhost:8080/facematch";
const LIVENESS_API = "http://localhost:8080/liveness";
const RISK_API = "http://localhost:8080/risk";
const COMPLIANCE_API = "http://localhost:8080/compliance";

function getLoggedInUser() {
    try {
        return JSON.parse(localStorage.getItem("user") || "{}");
    } catch (err) {
        return {};
    }
}

function getCustomerId() {
    const user = getLoggedInUser();
    return user.customerId || user.id || null;
}

const STEPS = [
    "details",
    "ocr",
    "facematch",
    "liveness",
    "risk",
    "compliance",
    "final",
];

function CustomerKyc() {

    const customerId = getCustomerId();

    const [loading, setLoading] = useState(true);
    const [existingKyc, setExistingKyc] = useState(null);

    const [step, setStep] = useState("details");
    const [error, setError] = useState("");
    const [working, setWorking] = useState(false);

    const [kycId, setKycId] = useState(null);

    const [detailsForm, setDetailsForm] = useState({
        fullName: "",
        aadhaarNumber: "",
        panNumber: "",
        dateOfBirth: "",
        address: "",
    });
    const [ocrForm, setOcrForm] = useState({
        documentType: "Aadhaar",
    });
    const [ocrResult, setOcrResult] = useState(null);

    // The actual uploaded ID document image file. Kept here (not inside
    // ocrForm) because Step 3 (Face Match) reuses this same file as the
    // "reference photo" to compare against the live selfie.
    const [documentFile, setDocumentFile] = useState(null);
        // The live selfie captured via webcam. The document photo already
    // uploaded in Step 2 (documentFile) is reused automatically as the
    // reference image - no need to upload it again here.
    const [selfieFile, setSelfieFile] = useState(null);
    const [faceResult, setFaceResult] = useState(null);

    
    const [livenessFrames, setLivenessFrames] = useState([]);
    const [livenessResult, setLivenessResult] = useState(null);
    const [riskScoreInput, setRiskScoreInput] = useState(20);
    const [documentFormatValid, setDocumentFormatValid] = useState(true);
    const [riskResult, setRiskResult] = useState(null);

    const [complianceResult, setComplianceResult] = useState(null);
    const [finalResult, setFinalResult] = useState(null);

    // =====================================================
    // CHECK EXISTING KYC ON LOAD
    // =====================================================

    useEffect(() => {
        loadExistingKyc();
        // eslint-disable-next-line
    }, []);

    const loadExistingKyc = async () => {
        try {
            setLoading(true);

            if (!customerId) {
                setLoading(false);
                return;
            }

            const response = await axios.get(
                `${KYC_API}/customer/${customerId}`
            );

            const records = Array.isArray(response.data)
                ? response.data
                : [];

            if (records.length > 0) {
                // Show the most recent record
                setExistingKyc(records[records.length - 1]);
            }

        } catch (err) {
            console.warn("No existing KYC found", err);
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // STEP 1: SUBMIT PERSONAL DETAILS
    // =====================================================

    const submitDetails = async (e) => {
        e.preventDefault();
        setError("");

        // =================================================
        // REAL FORMAT VALIDATION
        // A genuine Aadhaar number is exactly 12 digits.
        // A genuine PAN follows a fixed pattern:
        // 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).
        // =================================================

        const aadhaarPattern = /^[0-9]{12}$/;
        const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

        const aadhaarValid = aadhaarPattern.test(
            detailsForm.aadhaarNumber.trim()
        );

        const panValid = panPattern.test(
            detailsForm.panNumber.trim().toUpperCase()
        );

        setDocumentFormatValid(aadhaarValid && panValid);

        if (!aadhaarValid) {
            setError(
                "Invalid Aadhaar number. It must be exactly 12 digits (numbers only)."
            );
            return;
        }

        if (!panValid) {
            setError(
                "Invalid PAN number. It must follow the format ABCDE1234F (5 letters, 4 digits, 1 letter)."
            );
            return;
        }

        setWorking(true);

        try {

            const payload = {
                customerId: customerId,
                fullName: detailsForm.fullName,
                aadhaarNumber: detailsForm.aadhaarNumber.trim(),
                panNumber: detailsForm.panNumber.trim().toUpperCase(),
                dateOfBirth: detailsForm.dateOfBirth,
                address: detailsForm.address,
                status: "PENDING",
            };

            const response = await axios.post(KYC_API, payload);

            setKycId(response.data.kycId);
            setStep("ocr");

        } catch (err) {
            console.error(err);
            setError(
                "Unable to submit your details. Please check all fields and try again."
            );
        } finally {
            setWorking(false);
        }
    };

    // =====================================================
    // STEP 2: OCR DOCUMENT VERIFICATION
    // =====================================================
    const runOcr = async (e) => {
        e.preventDefault();
        setError("");

        if (!documentFile) {
            setError("Please choose a photo of your document before submitting.");
            return;
        }

        setWorking(true);

        try {

            // Real file upload — must be FormData, not a JSON object.
            // Don't set a Content-Type header manually here; axios sets
            // the correct multipart boundary automatically for FormData.
            const formData = new FormData();
            formData.append("document", documentFile);
            formData.append("documentType", ocrForm.documentType);

            const response = await axios.post(
                `${OCR_API}/verify`,
                formData
            );

            setOcrResult(response.data);
            setStep("facematch");

        } catch (err) {
            console.error(err);
            setError("Document verification failed. Please try again.");
        } finally {
            setWorking(false);
        }
    };

    // =====================================================
    // STEP 3: FACE MATCH
    // =====================================================
        const runFaceMatch = async (e) => {
        e.preventDefault();
        setError("");

        if (!documentFile) {
            setError("Missing document photo from Step 2. Please go back and re-upload it.");
            return;
        }
        if (!selfieFile) {
            setError("Please capture a selfie before submitting.");
            return;
        }

        setWorking(true);

        try {
            const formData = new FormData();
            formData.append("customerImage", selfieFile);
            formData.append("documentImage", documentFile);

         const response = await axios.post(
                `${FACEMATCH_API}/verify`,
                formData
            );

            // kyc-service returns 200 OK even when the underlying face-match
            // failed internally (e.g. no face detected) - it encodes the
            // failure inside the "status" field rather than throwing an
            // HTTP error. Catch that case here so we don't silently move
            // forward with a broken result.
            if (
                !response.data.status ||
                response.data.status.startsWith("ERROR")
            ) {
                setError(
                    "We couldn't detect a face clearly enough to compare. Please make sure your Step 2 document photo shows a visible face, and try your selfie again."
                );
                return;
            }

            setFaceResult(response.data);
            setStep("liveness");

        } catch (err) {
            console.error(err);
            setError("Face match failed. Please try again.");
        } finally {
            setWorking(false);
        }
    };

    // =====================================================
    // STEP 4: LIVENESS CHECK
    // =====================================================

        const runLiveness = async (e) => {
        e.preventDefault();
        setError("");

        if (!livenessFrames || livenessFrames.length < 5) {
            setError("Please complete the liveness capture before submitting.");
            return;
        }

        setWorking(true);

        try {
            const formData = new FormData();
            livenessFrames.forEach((frame) => {
                formData.append("frames", frame);
            });

            const response = await axios.post(
                `${LIVENESS_API}/check`,
                formData
            );

            if (response.data.status && response.data.status.startsWith("ERROR")) {
                setError(
                    "We couldn't process that capture clearly. Please check your lighting and try again."
                );
                return;
            }

            if (!response.data.live) {
                setError(
                    "We couldn't confirm liveness from that capture. Please try again and follow the on-screen prompts closely."
                );
                return;
            }

            setLivenessResult(response.data);
            setStep("risk");

        } catch (err) {
            console.error(err);
            setError("Liveness check failed. Please try again.");
        } finally {
            setWorking(false);
        }
    };

    // =====================================================
    // STEP 5: RISK ASSESSMENT (AUTO-COMPUTED, NOT
    // CUSTOMER-EDITABLE — based on real signals: whether
    // the document formats looked genuine, and time of
    // submission)
    // =====================================================

    const computeRiskScore = () => {

        // Base score — everyone starts here
        let score = 10;

        // Invalid-looking document formats are a real red flag
        if (!documentFormatValid) {
            score += 40;
        }

        // Submissions in the middle of the night are
        // statistically more fraud-prone (same rule used
        // in the payment fraud check)
        const hour = new Date().getHours();

        if (hour >= 0 && hour < 5) {
            score += 20;
        }

        // A small, deterministic amount of variation based
        // on the Aadhaar number itself — same person always
        // gets the same extra amount, but it's not something
        // the customer can directly dial in themselves.
        const digits = detailsForm.aadhaarNumber.replace(
            /\D/g,
            ""
        );

        let seed = 0;

        for (const digit of digits) {
            seed += Number(digit);
        }

        score += seed % 15;

        return Math.min(score, 100);
    };

    const runRisk = async () => {
        setError("");
        setWorking(true);

        try {

            const computedScore = computeRiskScore();

            setRiskScoreInput(computedScore);

            const params = new URLSearchParams();
            params.append("riskScore", computedScore);

            const response = await axios.post(
                `${RISK_API}/assess?${params.toString()}`
            );

            setRiskResult(response.data);
            setStep("compliance");

        } catch (err) {
            console.error(err);
            setError("Risk assessment failed. Please try again.");
        } finally {
            setWorking(false);
        }
    };

    useEffect(() => {
        if (step === "risk" && livenessResult && !riskResult) {
            runRisk();
        }
        // eslint-disable-next-line
    }, [step, livenessResult]);

    // =====================================================
    // STEP 6: COMPLIANCE CHECK
    // =====================================================

    const runCompliance = async () => {
        setError("");
        setWorking(true);

        try {

            const params = new URLSearchParams();
            params.append("faceMatched", faceResult?.matched ?? false);
            params.append("livenessPassed", livenessResult?.live ?? false);
            params.append("riskLevel", riskResult?.riskLevel ?? "HIGH");

            const response = await axios.post(
                `${COMPLIANCE_API}/check?${params.toString()}`
            );

            setComplianceResult(response.data);
            setStep("final");

        } catch (err) {
            console.error(err);
            setError("Compliance check failed. Please try again.");
        } finally {
            setWorking(false);
        }
    };

    // =====================================================
    // STEP 7: FINAL VERIFICATION
    // =====================================================

    const runFinal = async () => {
        setError("");
        setWorking(true);

        try {

            const params = new URLSearchParams();
            params.append("faceMatched", faceResult?.matched ?? false);
            params.append("livenessPassed", livenessResult?.live ?? false);
            params.append("riskLevel", riskResult?.riskLevel ?? "HIGH");
            params.append("compliant", complianceResult?.compliant ?? false);

            const response = await axios.post(
                `${COMPLIANCE_API}/final?${params.toString()}`
            );

            setFinalResult(response.data);

            // Save the remarks back onto the KYC record for the admin to see
            if (kycId) {
                try {
                    await axios.put(`${KYC_API}/${kycId}`, {
                        customerId: customerId,
                        fullName: detailsForm.fullName,
                        aadhaarNumber: detailsForm.aadhaarNumber,
                        panNumber: detailsForm.panNumber,
                        dateOfBirth: detailsForm.dateOfBirth,
                        address: detailsForm.address,
                        status: "PENDING",
                        remarks:
                            response.data.verificationStatus === "VERIFIED"
                                ? "All automated checks passed. Awaiting officer approval."
                                : "Automated checks failed. " +
                                  response.data.remarks,
                    });
                } catch (updateErr) {
                    console.warn("Unable to save remarks", updateErr);
                }
            }

        } catch (err) {
            console.error(err);
            setError("Final verification failed. Please try again.");
        } finally {
            setWorking(false);
        }
    };

    // =====================================================
    // AUTO-RUN COMPLIANCE + FINAL ONCE RISK IS DONE
    // =====================================================

    useEffect(() => {
        if (step === "compliance" && riskResult && !complianceResult) {
            runCompliance();
        }
        // eslint-disable-next-line
    }, [step, riskResult]);

    useEffect(() => {
        if (step === "final" && complianceResult && !finalResult) {
            runFinal();
        }
        // eslint-disable-next-line
    }, [step, complianceResult]);

    // =====================================================
    // RENDER: LOADING
    // =====================================================

    if (loading) {
        return (
            <CustomerLayout>
                <div className="kyc-loading">
                    <Loader2 className="kyc-spinner" size={32} />
                    <p>Checking your KYC status...</p>
                </div>
            </CustomerLayout>
        );
    }

    // =====================================================
    // RENDER: ALREADY HAS A KYC RECORD
    // =====================================================

    if (existingKyc) {
        const status = (existingKyc.status || "PENDING").toUpperCase();

        return (
            <CustomerLayout>
                <div className="kyc-page">
                    <div className="kyc-header">
                        <ShieldCheck size={22} />
                        <h1>KYC Verification</h1>
                    </div>

                    <div className={`kyc-status-card kyc-status-${status.toLowerCase()}`}>
                        {status === "APPROVED" ? (
                            <CheckCircle2 size={40} />
                        ) : status === "REJECTED" ? (
                            <XCircle size={40} />
                        ) : (
                            <Loader2 size={40} />
                        )}

                        <div>
                            <h2>
                                {status === "APPROVED"
                                    ? "KYC Approved"
                                    : status === "REJECTED"
                                    ? "KYC Rejected"
                                    : "KYC Pending Review"}
                            </h2>

                            <p>
                                {status === "APPROVED"
                                    ? "You're fully verified. You can now open accounts and transact freely."
                                    : status === "REJECTED"
                                    ? existingKyc.remarks ||
                                      "Your KYC was rejected. Please contact support."
                                    : existingKyc.remarks ||
                                      "Your KYC has been submitted and is awaiting officer approval."}
                            </p>
                        </div>
                    </div>

                    <div className="kyc-detail-grid">
                        <div>
                            <span>Full Name</span>
                            <strong>{existingKyc.fullName}</strong>
                        </div>
                        <div>
                            <span>Aadhaar Number</span>
                            <strong>{existingKyc.aadhaarNumber}</strong>
                        </div>
                        <div>
                            <span>PAN Number</span>
                            <strong>{existingKyc.panNumber}</strong>
                        </div>
                        <div>
                            <span>Date of Birth</span>
                            <strong>{existingKyc.dateOfBirth}</strong>
                        </div>
                        <div className="kyc-detail-wide">
                            <span>Address</span>
                            <strong>{existingKyc.address}</strong>
                        </div>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    // =====================================================
    // RENDER: WIZARD
    // =====================================================

    const stepIndex = STEPS.indexOf(step);

    return (
        <CustomerLayout>
            <div className="kyc-page">

                <div className="kyc-header">
                    <ShieldCheck size={22} />
                    <h1>KYC Verification</h1>
                </div>

                <p className="kyc-subtitle">
                    Complete these steps to verify your identity before opening an account.
                </p>

                {/* PROGRESS BAR */}
                <div className="kyc-progress">
                    {STEPS.map((s, i) => (
                        <div
                            key={s}
                            className={`kyc-progress-dot ${
                                i <= stepIndex ? "done" : ""
                            } ${i === stepIndex ? "active" : ""}`}
                        />
                    ))}
                </div>

                {error && <div className="kyc-error">{error}</div>}

                {/* STEP 1: DETAILS */}
                {step === "details" && (
                    <form className="kyc-card" onSubmit={submitDetails}>
                        <div className="kyc-card-title">
                            <FileText size={20} />
                            <h3>Step 1: Personal Details</h3>
                        </div>

                        <input
                            required
                            placeholder="Full Name"
                            value={detailsForm.fullName}
                            onChange={(e) =>
                                setDetailsForm({
                                    ...detailsForm,
                                    fullName: e.target.value,
                                })
                            }
                        />

                        <input
                            required
                            placeholder="Aadhaar Number"
                            value={detailsForm.aadhaarNumber}
                            onChange={(e) =>
                                setDetailsForm({
                                    ...detailsForm,
                                    aadhaarNumber: e.target.value,
                                })
                            }
                        />

                        <input
                            required
                            placeholder="PAN Number"
                            value={detailsForm.panNumber}
                            onChange={(e) =>
                                setDetailsForm({
                                    ...detailsForm,
                                    panNumber: e.target.value,
                                })
                            }
                        />

                        <input
                            required
                            type="date"
                            value={detailsForm.dateOfBirth}
                            onChange={(e) =>
                                setDetailsForm({
                                    ...detailsForm,
                                    dateOfBirth: e.target.value,
                                })
                            }
                        />

                        <input
                            required
                            placeholder="Address"
                            value={detailsForm.address}
                            onChange={(e) =>
                                setDetailsForm({
                                    ...detailsForm,
                                    address: e.target.value,
                                })
                            }
                        />

                        <button disabled={working} type="submit">
                            {working ? "Submitting..." : "Next: Document Check"}
                        </button>
                    </form>
                )}
                {/* STEP 2: OCR */}
                {step === "ocr" && (
                    <form className="kyc-card" onSubmit={runOcr}>
                        <div className="kyc-card-title">
                            <FileText size={20} />
                            <h3>Step 2: Document Verification (OCR)</h3>
                        </div>

                        <select
                            value={ocrForm.documentType}
                            onChange={(e) =>
                                setOcrForm({
                                    ...ocrForm,
                                    documentType: e.target.value,
                                })
                            }
                        >
                            <option value="Aadhaar">Aadhaar Card</option>
                            <option value="PAN">PAN Card</option>
                            <option value="Passport">Passport</option>
                        </select>

                        <p className="kyc-hint">
                            Upload a clear photo of your {ocrForm.documentType} —
                            we'll automatically read your details from it.
                        </p>

                        <input
                            required
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setDocumentFile(e.target.files?.[0] || null)
                            }
                        />

                        {documentFile && (
                            <div className="kyc-mini-result">
                                Selected: {documentFile.name}
                            </div>
                        )}

                        <button disabled={working || !documentFile} type="submit">
                            {working ? "Scanning..." : "Verify Document"}
                        </button>
                    </form>
                )}

                                {/* STEP 3: FACE MATCH */}
                {step === "facematch" && (
                    <form className="kyc-card" onSubmit={runFaceMatch}>
                        <div className="kyc-card-title">
                            <ScanFace size={20} />
                            <h3>Step 3: Face Match</h3>
                        </div>

                        {ocrResult && (
                            <div className="kyc-mini-result">
                                Document check: {ocrResult.status} —
                                extracted name "{ocrResult.extractedName}"
                            </div>
                        )}

                        <p className="kyc-hint">
                            We'll compare a live photo of you against the
                            document photo you uploaded in Step 2. Look
                            directly at the camera and capture a clear selfie.
                        </p>

                        <WebcamCapture
                            onCapture={setSelfieFile}
                            buttonLabel="Take Selfie"
                        />

                        <button disabled={working || !selfieFile} type="submit">
                            {working ? "Matching..." : "Verify Face Match"}
                        </button>
                    </form>
                )}

                 {/* STEP 4: LIVENESS */}
                {step === "liveness" && (
                    <form className="kyc-card" onSubmit={runLiveness}>
                        <div className="kyc-card-title">
                            <Activity size={20} />
                            <h3>Step 4: Liveness Check</h3>
                        </div>

                        {faceResult && (
                            <div className="kyc-mini-result">
                                Face match: {faceResult.status} —
                                confidence {faceResult.confidence}%
                            </div>
                        )}

                        <p className="kyc-hint">
                            This confirms you're a real person in front of the
                            camera right now, not a photo. Click Start, then
                            follow the on-screen prompts — including closing
                            your eyes when asked.
                        </p>

                        <LivenessCapture onComplete={setLivenessFrames} />

                        <button
                            disabled={working || livenessFrames.length < 5}
                            type="submit"
                        >
                            {working ? "Checking..." : "Run Liveness Check"}
                        </button>
                    </form>
                )}

                {/* STEP 5: RISK (auto-computed, not editable) */}
                {step === "risk" && (
                    <div className="kyc-card">
                        <div className="kyc-card-title">
                            <Gauge size={20} />
                            <h3>Step 5: Risk Assessment</h3>
                        </div>

                        {livenessResult && (
                            <div className="kyc-mini-result">
                                Liveness: {livenessResult.status} —
                                confidence {livenessResult.confidence}%
                            </div>
                        )}

                        <p className="kyc-hint">
                            Your risk score is calculated automatically by
                            the system — based on your document details and
                            submission time — not something you can set
                            yourself.
                        </p>

                        {!riskResult && (
                            <div className="kyc-working-row">
                                <Loader2 className="kyc-spinner" size={20} />
                                Calculating your risk score...
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 6+7: COMPLIANCE + FINAL (auto-run) */}
                {step === "compliance" && (
                    <div className="kyc-card">
                        <div className="kyc-card-title">
                            <ClipboardCheck size={20} />
                            <h3>Step 6: Compliance Check</h3>
                        </div>

                        {riskResult && (
                            <div className="kyc-mini-result">
                                Risk level: {riskResult.riskLevel} —
                                status {riskResult.status}
                            </div>
                        )}

                        <div className="kyc-working-row">
                            <Loader2 className="kyc-spinner" size={20} />
                            Running compliance check...
                        </div>
                    </div>
                )}

                {step === "final" && (
                    <div className="kyc-card">
                        <div className="kyc-card-title">
                            <ShieldCheck size={20} />
                            <h3>Step 7: Final Verification</h3>
                        </div>

                        {complianceResult && (
                            <div className="kyc-mini-result">
                                Compliance: {complianceResult.status}
                            </div>
                        )}

                        {!finalResult && (
                            <div className="kyc-working-row">
                                <Loader2 className="kyc-spinner" size={20} />
                                Finalizing your verification...
                            </div>
                        )}

                        {finalResult && (
                            <div
                                className={`kyc-final-result ${
                                    finalResult.verificationStatus ===
                                    "VERIFIED"
                                        ? "verified"
                                        : "rejected"
                                }`}
                            >
                                {finalResult.verificationStatus ===
                                "VERIFIED" ? (
                                    <CheckCircle2 size={40} />
                                ) : (
                                    <XCircle size={40} />
                                )}

                                <div>
                                    <h2>
                                        {finalResult.verificationStatus ===
                                        "VERIFIED"
                                            ? "All Checks Passed!"
                                            : "Verification Failed"}
                                    </h2>
                                    <p>{finalResult.remarks}</p>

                                    {finalResult.verificationStatus ===
                                        "VERIFIED" && (
                                        <p className="kyc-next-step">
                                            Your details have been sent to a
                                            bank officer for final approval.
                                            You'll be able to open accounts
                                            once approved.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </CustomerLayout>
    );
}

export default CustomerKyc;