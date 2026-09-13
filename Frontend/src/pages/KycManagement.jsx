import { useEffect, useState } from "react";
import axios from "axios";
import {
    ShieldCheck,
    RefreshCw,
    Search,
    CheckCircle,
    XCircle,
    History,
    Trash2,
    Eye,
    X,
} from "lucide-react";

import BankingLayout from "../components/layout/BankingLayout";
import "./KycManagement.css";

const KYC_API = "http://localhost:8080/kyc";
const AUDIT_API = "http://localhost:8080/audit";

// This must exactly match 'admin.api.key' in kyc-service's
// application.properties.
const ADMIN_API_KEY = "YOUR_ADMIN_KEY_HERE";

function KycManagement() {

    const [records, setRecords] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    // =====================================================
    // VIEW KYC DETAILS
    // =====================================================

    const [selectedRecord, setSelectedRecord] = useState(null);

    const viewKycDetails = (record) => {
        setSelectedRecord(record);
    };

    const closeKycDetails = () => {
        setSelectedRecord(null);
    };

    // =====================================================
    // FETCH ALL KYC RECORDS
    // =====================================================

    const fetchRecords = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(KYC_API);

            const data = Array.isArray(response.data)
                ? response.data
                : [];

            setRecords(data);
            setFiltered(data);

        } catch (err) {
            console.error(err);

            setError(
                "Unable to load KYC records. Make sure API Gateway and KYC Service are running."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    // =====================================================
    // SEARCH
    // =====================================================

    useEffect(() => {

        if (!search.trim()) {
            setFiltered(records);
            return;
        }

        const term = search.toLowerCase();

        setFiltered(
            records.filter(
                (r) =>
                    String(r.customerId)
                        .includes(term) ||
                    (r.fullName || "")
                        .toLowerCase()
                        .includes(term) ||
                    (r.status || "")
                        .toLowerCase()
                        .includes(term)
            )
        );

    }, [search, records]);

    // =====================================================
    // APPROVE
    // =====================================================

    const approveKyc = async (record) => {

        if (!window.confirm(
            `Approve KYC for ${record.fullName}?`
        )) {
            return;
        }

        try {

            await axios.put(
                `${KYC_API}/${record.kycId}`,
                {
                    customerId: record.customerId,
                    fullName: record.fullName,
                    aadhaarNumber: record.aadhaarNumber,
                    panNumber: record.panNumber,
                    dateOfBirth: record.dateOfBirth,
                    address: record.address,
                    status: "APPROVED",
                    remarks: "Approved by bank officer.",
                },
                {
                    headers: {
                        "X-Admin-Key": ADMIN_API_KEY,
                    },
                }
            );

            alert("KYC approved successfully.");

            await fetchRecords();

        } catch (err) {

            console.error(err);
            alert("Unable to approve KYC.");
        }
    };

    // =====================================================
    // REJECT
    // =====================================================

    const rejectKyc = async (record) => {

        if (!window.confirm(
            `Reject KYC for ${record.fullName}?`
        )) {
            return;
        }

        try {

            await axios.put(
                `${KYC_API}/${record.kycId}`,
                {
                    customerId: record.customerId,
                    fullName: record.fullName,
                    aadhaarNumber: record.aadhaarNumber,
                    panNumber: record.panNumber,
                    dateOfBirth: record.dateOfBirth,
                    address: record.address,
                    status: "REJECTED",
                    remarks: "Rejected by bank officer.",
                },
                {
                    headers: {
                        "X-Admin-Key": ADMIN_API_KEY,
                    },
                }
            );

            alert("KYC rejected.");

            await fetchRecords();

        } catch (err) {

            console.error(err);
            alert("Unable to reject KYC.");
        }
    };

    // =====================================================
    // DELETE
    // =====================================================

    const deleteKyc = async (record) => {

        if (!window.confirm(
            `Permanently delete this KYC record for ${record.fullName}? This cannot be undone.`
        )) {
            return;
        }

        try {

            await axios.delete(
                `${KYC_API}/${record.kycId}`,
                {
                    headers: {
                        "X-Admin-Key": ADMIN_API_KEY,
                    },
                }
            );

            alert("KYC record deleted.");

            await fetchRecords();

        } catch (err) {

            console.error(err);
            alert("Unable to delete KYC record.");
        }
    };

    // =====================================================
    // VIEW AUDIT TRAIL
    // =====================================================

    const viewAuditTrail = async (record) => {

        try {

            const response = await axios.get(
                `${AUDIT_API}/kyc/${record.kycId}`
            );

            const entries = Array.isArray(response.data)
                ? response.data
                : [];

            if (entries.length === 0) {

                alert(
                    "No audit entries found for this KYC record."
                );

                return;
            }

            const text = entries
                .map(
                    (e) =>
                        `[${e.timestamp}] ${e.action} — ${e.status}\n${e.remarks || ""}`
                )
                .join("\n\n");

            alert(
                `Audit Trail for ${record.fullName}:\n\n${text}`
            );

        } catch (err) {

            console.error(err);
            alert("Unable to load audit trail.");
        }
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (

        <BankingLayout>

            <div className="kyc-mgmt-page">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="kyc-mgmt-header">

                    <div>

                        <p className="kyc-mgmt-eyebrow">
                            FINCORE NEXUS / KYC
                        </p>

                        <h1>
                            <ShieldCheck size={22} />
                            KYC Management
                        </h1>

                        <p className="kyc-mgmt-subtitle">
                            Review and approve customer KYC submissions.
                        </p>

                    </div>


                    <button
                        className="kyc-mgmt-refresh"
                        onClick={fetchRecords}
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>

                </div>


                {/* =================================================
                    SEARCH
                ================================================= */}

                <div className="kyc-mgmt-search">

                    <Search size={16} />

                    <input
                        placeholder="Search by customer ID, name, or status..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div className="kyc-mgmt-error">
                        {error}
                    </div>
                )}


                {/* =================================================
                    TABLE
                ================================================= */}

                {loading ? (

                    <p>
                        Loading KYC records...
                    </p>

                ) : (

                    <table className="kyc-mgmt-table">

                        <thead>

                            <tr>

                                <th>KYC ID</th>

                                <th>Customer ID</th>

                                <th>Full Name</th>

                                <th>Aadhaar</th>

                                <th>PAN</th>

                                <th>
                                    Automated Check Result
                                </th>

                                <th>Status</th>

                                <th>Actions</th>

                            </tr>

                        </thead>


                        <tbody>

                            {filtered.map((record) => (

                                <tr key={record.kycId}>

                                    <td>
                                        #{record.kycId}
                                    </td>

                                    <td>
                                        {record.customerId}
                                    </td>

                                    <td>
                                        {record.fullName}
                                    </td>

                                    <td>
                                        {record.aadhaarNumber}
                                    </td>

                                    <td>
                                        {record.panNumber}
                                    </td>


                                    {/* AUTOMATED CHECK RESULT */}

                                    <td className="kyc-mgmt-remarks">

                                        {record.remarks ? (

                                            <span
                                                className={
                                                    record.remarks
                                                        .toLowerCase()
                                                        .includes("passed")
                                                        ? "kyc-remarks-good"
                                                        : "kyc-remarks-bad"
                                                }
                                                title={record.remarks}
                                            >

                                                {record.remarks.length > 60
                                                    ? record.remarks.slice(0, 60) + "..."
                                                    : record.remarks}

                                            </span>

                                        ) : (

                                            <span className="kyc-remarks-none">
                                                Not yet submitted through wizard
                                            </span>

                                        )}

                                    </td>


                                    {/* STATUS */}

                                    <td>

                                        <span
                                            className={`kyc-mgmt-status kyc-mgmt-status-${(
                                                record.status || "pending"
                                            ).toLowerCase()}`}
                                        >
                                            {record.status}
                                        </span>

                                    </td>


                                    {/* =================================================
                                        ACTIONS
                                    ================================================= */}

                                    <td className="kyc-mgmt-actions">

                                        {/* VIEW / EYE */}

                                        <button
                                            className="kyc-mgmt-view"
                                            onClick={() =>
                                                viewKycDetails(record)
                                            }
                                            title="View KYC Details"
                                        >
                                            <Eye size={16} />
                                        </button>


                                        {/* APPROVE */}

                                        {record.status !== "APPROVED" && (

                                            <button
                                                className="kyc-mgmt-approve"
                                                onClick={() =>
                                                    approveKyc(record)
                                                }
                                                title="Approve"
                                            >
                                                <CheckCircle size={16} />
                                            </button>

                                        )}


                                        {/* REJECT */}

                                        {record.status !== "REJECTED" && (

                                            <button
                                                className="kyc-mgmt-reject"
                                                onClick={() =>
                                                    rejectKyc(record)
                                                }
                                                title="Reject"
                                            >
                                                <XCircle size={16} />
                                            </button>

                                        )}


                                        {/* AUDIT */}

                                        <button
                                            className="kyc-mgmt-audit"
                                            onClick={() =>
                                                viewAuditTrail(record)
                                            }
                                            title="View Audit Trail"
                                        >
                                            <History size={16} />
                                        </button>


                                        {/* DELETE */}

                                        <button
                                            className="kyc-mgmt-delete"
                                            onClick={() =>
                                                deleteKyc(record)
                                            }
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                    </td>

                                </tr>

                            ))}


                            {/* NO RECORDS */}

                            {filtered.length === 0 && (

                                <tr>

                                    <td
                                        colSpan={8}
                                        style={{
                                            textAlign: "center",
                                        }}
                                    >
                                        No KYC records found.
                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                )}


                {/* =================================================
                    KYC DETAILS MODAL
                ================================================= */}

                {selectedRecord && (

                    <div
                        onClick={closeKycDetails}
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0, 0, 0, 0.45)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 9999,
                            padding: "20px",
                        }}
                    >

                        <div
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                            style={{
                                width: "min(720px, 95vw)",
                                maxHeight: "90vh",
                                overflowY: "auto",
                                background: "#ffffff",
                                borderRadius: "18px",
                                padding: "30px",
                                boxShadow:
                                    "0 20px 60px rgba(0,0,0,0.25)",
                                position: "relative",
                            }}
                        >

                            {/* CLOSE BUTTON */}

                            <button
                                type="button"
                                onClick={closeKycDetails}
                                style={{
                                    position: "absolute",
                                    top: "18px",
                                    right: "18px",
                                    border: "none",
                                    background: "#f3f4f6",
                                    borderRadius: "50%",
                                    width: "36px",
                                    height: "36px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                }}
                                title="Close"
                            >
                                <X size={18} />
                            </button>


                            {/* MODAL HEADER */}

                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "13px",
                                    letterSpacing: "2px",
                                    fontWeight: "700",
                                    color: "#4f46e5",
                                }}
                            >
                                KYC DETAILS
                            </p>

                            <h2
                                style={{
                                    marginTop: "10px",
                                    marginBottom: "25px",
                                    fontSize: "30px",
                                    color: "#172033",
                                }}
                            >
                                KYC #{selectedRecord.kycId}
                            </h2>


                            {/* DETAILS */}

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(2, minmax(0, 1fr))",
                                    gap: "18px",
                                }}
                            >

                                <div>
                                    <strong>
                                        Customer ID
                                    </strong>

                                    <p>
                                        {selectedRecord.customerId ?? "-"}
                                    </p>
                                </div>


                                <div>
                                    <strong>
                                        Full Name
                                    </strong>

                                    <p>
                                        {selectedRecord.fullName || "-"}
                                    </p>
                                </div>


                                <div>
                                    <strong>
                                        Aadhaar Number
                                    </strong>

                                    <p>
                                        {selectedRecord.aadhaarNumber || "-"}
                                    </p>
                                </div>


                                <div>
                                    <strong>
                                        PAN Number
                                    </strong>

                                    <p>
                                        {selectedRecord.panNumber || "-"}
                                    </p>
                                </div>


                                <div>
                                    <strong>
                                        Date of Birth
                                    </strong>

                                    <p>
                                        {selectedRecord.dateOfBirth || "-"}
                                    </p>
                                </div>


                                <div>
                                    <strong>
                                        Status
                                    </strong>

                                    <p>
                                        {selectedRecord.status || "-"}
                                    </p>
                                </div>


                                <div
                                    style={{
                                        gridColumn: "1 / -1",
                                    }}
                                >
                                    <strong>
                                        Address
                                    </strong>

                                    <p>
                                        {selectedRecord.address || "-"}
                                    </p>
                                </div>


                                <div
                                    style={{
                                        gridColumn: "1 / -1",
                                    }}
                                >
                                    <strong>
                                        Automated Check Result
                                    </strong>

                                    <p>
                                        {selectedRecord.remarks || "-"}
                                    </p>
                                </div>

                            </div>


                            {/* CLOSE */}

                            <button
                                type="button"
                                onClick={closeKycDetails}
                                style={{
                                    marginTop: "25px",
                                    padding: "11px 22px",
                                    border: "none",
                                    borderRadius: "8px",
                                    background: "#5b4ff5",
                                    color: "#ffffff",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                }}
                            >
                                Close
                            </button>

                        </div>

                    </div>

                )}

            </div>

        </BankingLayout>
    );
}

export default KycManagement;