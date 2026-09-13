import { useEffect, useState } from "react";
import axios from "axios";
import "./Loans.css";

import {
    Plus,
    RefreshCw,
    Search,
    Eye,
    Trash2,
    CheckCircle,
    XCircle,
    HandCoins,
    X,
    IndianRupee,
} from "lucide-react";

import BankingLayout from "../components/layout/BankingLayout";

const API_URL = "http://localhost:8080/api/loans";

const EMPTY_FORM = {
    customerId: "",
    loanType: "PERSONAL",
    principalAmount: "",
    interestRate: "",
    tenureMonths: "",
};

function Loans() {
    const [loans, setLoans] = useState([]);
    const [filteredLoans, setFilteredLoans] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const [selectedLoan, setSelectedLoan] = useState(null);

    const [form, setForm] = useState(EMPTY_FORM);

    const fetchLoans = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(API_URL);

            const data = Array.isArray(response.data)
                ? response.data
                : response.data.content || response.data.loans || [];

            setLoans(data);
        } catch (err) {
            console.error("Loan service error:", err);

            setError(
                "Loan Service could not be reached. Make sure Loan Service and API Gateway are running."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoans();
    }, []);

    useEffect(() => {
        const keyword = search.toLowerCase().trim();

        if (!keyword) {
            setFilteredLoans(loans);
            return;
        }

        const result = loans.filter((loan) =>
            [
                loan.loanNumber,
                loan.loanType,
                loan.status,
                loan.customerId,
                loan.id,
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value)
                        .toLowerCase()
                        .includes(keyword)
                )
        );

        setFilteredLoans(result);
    }, [loans, search]);

    const openCreateModal = () => {
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setForm(EMPTY_FORM);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const createLoan = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                customerId: Number(form.customerId),
                loanType: form.loanType,
                loanAmount: Number(
                    form.principalAmount
                ),
                interestRate: Number(
                    form.interestRate
                ),
                tenureMonths: Number(
                    form.tenureMonths
                ),
            };

            await axios.post(API_URL, payload);

            alert("Loan application created successfully.");

            closeModal();

            fetchLoans();
        } catch (err) {
            console.error("Create loan error:", err);

            alert(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to create loan."
            );
        }
    };

    const viewLoan = (loan) => {
        setSelectedLoan(loan);
        setShowDetails(true);
    };

    const approveLoan = async (loan) => {
        const id = loan.id || loan.loanId;

        if (!id) {
            alert("Loan ID not found.");
            return;
        }

        const confirmed = window.confirm(
            "Approve this loan?"
        );

        if (!confirmed) return;

        try {
            await axios.put(
                `${API_URL}/${id}/approve`
            );

            alert("Loan approved successfully.");

            fetchLoans();
        } catch (err) {
            console.error("Approve loan error:", err);

            alert(
                err.response?.data?.message ||
                "Unable to approve loan."
            );
        }
    };

    const rejectLoan = async (loan) => {
        const id = loan.id || loan.loanId;

        if (!id) {
            alert("Loan ID not found.");
            return;
        }

        const confirmed = window.confirm(
            "Reject this loan?"
        );

        if (!confirmed) return;

        try {
            await axios.put(
                `${API_URL}/${id}/reject`
            );

            alert("Loan rejected.");

            fetchLoans();
        } catch (err) {
            console.error("Reject loan error:", err);

            alert(
                err.response?.data?.message ||
                "Unable to reject loan."
            );
        }
    };

    const closeLoan = async (loan) => {
        const id = loan.id || loan.loanId;

        const confirmed = window.confirm(
            "Close this loan?"
        );

        if (!confirmed) return;

        try {
            await axios.put(
                `${API_URL}/${id}/close`
            );

            alert("Loan closed.");

            fetchLoans();
        } catch (err) {
            console.error("Close loan error:", err);

            alert(
                err.response?.data?.message ||
                "Unable to close loan."
            );
        }
    };

    const repayLoan = async (loan) => {
        const id = loan.id || loan.loanId;

        const amount = window.prompt(
            "Enter repayment amount:"
        );

        if (!amount) return;

        const value = Number(amount);

        if (value <= 0) {
            alert("Enter a valid amount.");
            return;
        }

        try {
            await axios.put(
                `${API_URL}/${id}/repay`,
                null,
                {
                    params: {
                        amount: value,
                    },
                }
            );

            alert("Loan repayment successful.");

            fetchLoans();
        } catch (err) {
            console.error("Repayment error:", err);

            alert(
                err.response?.data?.message ||
                "Unable to process repayment."
            );
        }
    };

    const deleteLoan = async (loan) => {
        const id = loan.id || loan.loanId;

        const confirmed = window.confirm(
            `Delete loan ${
                loan.loanNumber || id
            }?`
        );

        if (!confirmed) return;

        try {
            await axios.delete(
                `${API_URL}/${id}`
            );

            alert("Loan deleted successfully.");

            fetchLoans();
        } catch (err) {
            console.error("Delete loan error:", err);

            alert(
                err.response?.data?.message ||
                "Unable to delete loan."
            );
        }
    };

    const getStatus = (loan) =>
        String(
            loan.status ||
            loan.loanStatus ||
            "PENDING"
        ).toUpperCase();

    const pendingCount = loans.filter(
        (loan) =>
            getStatus(loan) === "PENDING"
    ).length;

    const approvedCount = loans.filter(
        (loan) =>
            getStatus(loan) === "APPROVED"
    ).length;

    const rejectedCount = loans.filter(
        (loan) =>
            getStatus(loan) === "REJECTED"
    ).length;

    const totalAmount = loans.reduce(
        (sum, loan) =>
            sum +
            Number(
                loan.principalAmount ||
                loan.amount ||
                loan.loanAmount ||
                0
            ),
        0
    );

    return (
        <BankingLayout>

            <div className="loans-page">

                {/* HEADER */}

                <div className="loans-header">

                    <div>

                        <span className="loans-eyebrow">
                            FINCORE NEXUS / LOAN SERVICE
                        </span>

                        <h1>Loans</h1>

                        <p>
                            Manage loan applications,
                            approvals and repayments.
                        </p>

                    </div>

                    <div className="loans-actions">

                        <button
                            className="refresh-button"
                            onClick={fetchLoans}
                        >
                            <RefreshCw size={17} />
                            Refresh
                        </button>

                        <button
                            className="add-loan-button"
                            onClick={openCreateModal}
                        >
                            <Plus size={18} />
                            New Loan
                        </button>

                    </div>

                </div>

                {/* SERVICE */}

                <div className="loan-service-banner">

                    <div>
                        <strong>
                            Loan Service
                        </strong>

                        <span>
                            Connected through API Gateway ·
                            Port 8080
                        </span>
                    </div>

                    <div className="service-live">
                        <span></span>
                        OPERATIONAL
                    </div>

                </div>

                {/* STATS */}

                <div className="loan-stats">

                    <div className="loan-stat-card">

                        <HandCoins size={22} />

                        <div>
                            <span>
                                Total Applications
                            </span>

                            <strong>
                                {loans.length}
                            </strong>
                        </div>

                    </div>

                    <div className="loan-stat-card">

                        <IndianRupee size={22} />

                        <div>
                            <span>
                                Total Loan Amount
                            </span>

                            <strong>
                                ₹
                                {totalAmount.toLocaleString(
                                    "en-IN"
                                )}
                            </strong>
                        </div>

                    </div>

                    <div className="loan-stat-card">

                        <CheckCircle size={22} />

                        <div>
                            <span>
                                Approved
                            </span>

                            <strong>
                                {approvedCount}
                            </strong>
                        </div>

                    </div>

                    <div className="loan-stat-card">

                        <HandCoins size={22} />

                        <div>
                            <span>
                                Pending
                            </span>

                            <strong>
                                {pendingCount}
                            </strong>
                        </div>

                    </div>

                </div>

                {/* TABLE */}

                <div className="loans-panel">

                    <div className="loans-panel-header">

                        <div>

                            <span className="panel-label">
                                LOAN DIRECTORY
                            </span>

                            <h2>
                                All loan applications
                            </h2>

                        </div>

                        <span>
                            {filteredLoans.length} loans
                        </span>

                    </div>

                    <div className="loan-toolbar">

                        <div className="loan-search">

                            <Search size={18} />

                            <input
                                placeholder="Search loan number, customer ID, type or status..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    </div>

                    {error && (
                        <div className="loan-error">

                            <strong>
                                Loan Service unavailable
                            </strong>

                            <span>
                                {error}
                            </span>

                            <button
                                onClick={fetchLoans}
                            >
                                Retry
                            </button>

                        </div>
                    )}

                    {loading ? (
                        <div className="loan-loading">
                            Loading loans...
                        </div>
                    ) : (
                        <div className="loans-table-wrapper">

                            <table className="loans-table">

                                <thead>

                                <tr>
                                    <th>LOAN NUMBER</th>
                                    <th>CUSTOMER ID</th>
                                    <th>TYPE</th>
                                    <th>AMOUNT</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                </tr>

                                </thead>

                                <tbody>

                                {filteredLoans.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="empty-loans"
                                        >

                                            <HandCoins
                                                size={40}
                                            />

                                            <strong>
                                                No loans found
                                            </strong>

                                            <span>
                                                    Create a new
                                                    loan application
                                                    to get started.
                                                </span>

                                            <button
                                                onClick={
                                                    openCreateModal
                                                }
                                            >
                                                <Plus
                                                    size={16}
                                                />
                                                New Loan
                                            </button>

                                        </td>

                                    </tr>

                                ) : (

                                    filteredLoans.map(
                                        (loan) => {

                                            const id =
                                                loan.id ||
                                                loan.loanId;

                                            const status =
                                                getStatus(
                                                    loan
                                                );

                                            const amount =
                                                Number(
                                                    loan.principalAmount ||
                                                    loan.amount ||
                                                    loan.loanAmount ||
                                                    0
                                                );

                                            return (

                                                <tr
                                                    key={id}
                                                >

                                                    <td>
                                                        <strong>
                                                            {loan.loanNumber ||
                                                                `LOAN-${id}`}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {loan.customerId ||
                                                            "-"}
                                                    </td>

                                                    <td>
                                                        {loan.loanType ||
                                                            "-"}
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            ₹
                                                            {amount.toLocaleString(
                                                                "en-IN"
                                                            )}
                                                        </strong>
                                                    </td>

                                                    <td>

                                                            <span
                                                                className={`loan-status ${status.toLowerCase()}`}
                                                            >
                                                                {status}
                                                            </span>

                                                    </td>

                                                    <td>

                                                        <div className="loan-action-buttons">

                                                            <button
                                                                title="View"
                                                                onClick={() =>
                                                                    viewLoan(
                                                                        loan
                                                                    )
                                                                }
                                                            >
                                                                <Eye
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            </button>

                                                            {status ===
                                                                "PENDING" && (
                                                                    <>
                                                                        <button
                                                                            title="Approve"
                                                                            onClick={() =>
                                                                                approveLoan(
                                                                                    loan
                                                                                )
                                                                            }
                                                                        >
                                                                            <CheckCircle
                                                                                size={
                                                                                    16
                                                                                }
                                                                            />
                                                                        </button>

                                                                        <button
                                                                            title="Reject"
                                                                            onClick={() =>
                                                                                rejectLoan(
                                                                                    loan
                                                                                )
                                                                            }
                                                                        >
                                                                            <XCircle
                                                                                size={
                                                                                    16
                                                                                }
                                                                            />
                                                                        </button>
                                                                    </>
                                                                )}

                                                            {status ===
                                                                "APPROVED" && (
                                                                    <>
                                                                        <button
                                                                            title="Repay"
                                                                            onClick={() =>
                                                                                repayLoan(
                                                                                    loan
                                                                                )
                                                                            }
                                                                        >
                                                                            <IndianRupee
                                                                                size={
                                                                                    16
                                                                                }
                                                                            />
                                                                        </button>

                                                                        <button
                                                                            title="Close Loan"
                                                                            onClick={() =>
                                                                                closeLoan(
                                                                                    loan
                                                                                )
                                                                            }
                                                                        >
                                                                            <CheckCircle
                                                                                size={
                                                                                    16
                                                                                }
                                                                            />
                                                                        </button>
                                                                    </>
                                                                )}

                                                            <button
                                                                className="delete-action"
                                                                title="Delete"
                                                                onClick={() =>
                                                                    deleteLoan(
                                                                        loan
                                                                    )
                                                                }
                                                            >
                                                                <Trash2
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            );
                                        }
                                    )

                                )}

                                </tbody>

                            </table>

                        </div>
                    )}

                </div>

                {/* CREATE LOAN MODAL */}

                {showModal && (

                    <div className="modal-overlay">

                        <div className="loan-modal">

                            <div className="modal-header">

                                <div>

                                    <span>
                                        LOAN SERVICE
                                    </span>

                                    <h2>
                                        New Loan Application
                                    </h2>

                                    <p>
                                        Create a loan application
                                        for a customer.
                                    </p>

                                </div>

                                <button
                                    className="modal-close"
                                    onClick={closeModal}
                                >
                                    <X size={20} />
                                </button>

                            </div>

                            <form
                                onSubmit={createLoan}
                            >

                                <div className="form-group">

                                    <label>
                                        Customer ID
                                    </label>

                                    <input
                                        name="customerId"
                                        type="number"
                                        value={
                                            form.customerId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Example: 1"
                                        required
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        Loan Type
                                    </label>

                                    <select
                                        name="loanType"
                                        value={
                                            form.loanType
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="PERSONAL">
                                            PERSONAL
                                        </option>

                                        <option value="HOME">
                                            HOME
                                        </option>

                                        <option value="CAR">
                                            CAR
                                        </option>

                                        <option value="EDUCATION">
                                            EDUCATION
                                        </option>

                                        <option value="BUSINESS">
                                            BUSINESS
                                        </option>

                                    </select>

                                </div>

                                <div className="form-group">

                                    <label>
                                        Loan Amount
                                    </label>

                                    <input
                                        name="principalAmount"
                                        type="number"
                                        min="1"
                                        value={
                                            form.principalAmount
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="500000"
                                        required
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        Interest Rate (%)
                                    </label>

                                    <input
                                        name="interestRate"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={
                                            form.interestRate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="8.5"
                                        required
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        Tenure (Months)
                                    </label>

                                    <input
                                        name="tenureMonths"
                                        type="number"
                                        min="1"
                                        value={
                                            form.tenureMonths
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="60"
                                        required
                                    />

                                </div>

                                <div className="form-actions">

                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={closeModal}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="primary-button"
                                    >
                                        <Plus size={17} />
                                        Create Loan
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}

                {/* DETAILS MODAL */}

                {showDetails &&
                    selectedLoan && (

                        <div className="modal-overlay">

                            <div className="loan-modal">

                                <button
                                    className="modal-close"
                                    onClick={() =>
                                        setShowDetails(
                                            false
                                        )
                                    }
                                >
                                    <X size={20} />
                                </button>

                                <span className="loans-eyebrow">
                                    LOAN DETAILS
                                </span>

                                <h2>
                                    {selectedLoan.loanNumber ||
                                        "Loan Application"}
                                </h2>

                                <div className="loan-detail-list">

                                    <p>
                                        <strong>
                                            Customer ID:
                                        </strong>{" "}
                                        {
                                            selectedLoan.customerId
                                        }
                                    </p>

                                    <p>
                                        <strong>
                                            Loan Type:
                                        </strong>{" "}
                                        {
                                            selectedLoan.loanType
                                        }
                                    </p>

                                    <p>
                                        <strong>
                                            Principal:
                                        </strong>{" "}
                                        ₹
                                        {Number(
                                            selectedLoan.principalAmount ||
                                            selectedLoan.amount ||
                                            selectedLoan.loanAmount ||
                                            0
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </p>

                                    <p>
                                        <strong>
                                            Interest Rate:
                                        </strong>{" "}
                                        {
                                            selectedLoan.interestRate ??
                                            "-"
                                        }
                                        %
                                    </p>

                                    <p>
                                        <strong>
                                            Tenure:
                                        </strong>{" "}
                                        {
                                            selectedLoan.tenureMonths ??
                                            "-"
                                        }{" "}
                                        months
                                    </p>

                                    <p>
                                        <strong>
                                            Status:
                                        </strong>{" "}
                                        {getStatus(
                                            selectedLoan
                                        )}
                                    </p>

                                </div>

                                <button
                                    className="primary-button"
                                    onClick={() =>
                                        setShowDetails(
                                            false
                                        )
                                    }
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

export default Loans;