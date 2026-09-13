import { useEffect, useState } from "react";
import axios from "axios";

import {
    HandCoins,
    RefreshCw,
    Search,
    Eye,
    X,
    Plus,
} from "lucide-react";

import CustomerLayout from "../../components/layout/CustomerLayout";
import "./CustomerLoans.css";

const API_URL =
    "http://localhost:8080/api/loans";

function CustomerLoans() {

    const [loans, setLoans] = useState([]);
    const [filteredLoans, setFilteredLoans] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [selectedLoan, setSelectedLoan] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showNewLoan, setShowNewLoan] = useState(false);
    const [loanForm, setLoanForm] = useState({ loanType: "PERSONAL", loanAmount: "", interestRate: "", tenureMonths: "" });
    const [creatingLoan, setCreatingLoan] = useState(false);


    // =====================================================
    // GET LOGGED-IN CUSTOMER
    // =====================================================

    const getLoggedInCustomer = () => {

        try {

            const user = JSON.parse(
                localStorage.getItem("user") || "{}"
            );

            console.log(
                "LOGGED-IN CUSTOMER:",
                user
            );

            return user;

        } catch (error) {

            console.error(
                "Unable to read logged-in customer:",
                error
            );

            return {};

        }

    };


    // =====================================================
    // GET CUSTOMER ID
    // =====================================================

    const getCustomerId = () => {

        const user = getLoggedInCustomer();

        return (
            user.customerId ||
            user.customerNumber ||
            user.id
        );

    };


    // =====================================================
    // LOAD LOANS
    // =====================================================

    const loadLoans = async () => {

        try {

            setLoading(true);
            setError("");

            const customerId =
                getCustomerId();

            console.log(
                "Customer Loans - Customer ID:",
                customerId
            );


            if (!customerId) {

                setError(
                    "Customer ID was not found. Please login again."
                );

                setLoans([]);

                return;

            }


            const response = await axios.get(`${API_URL}/customer/${customerId}`);
            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.content || response.data?.loans || [];
            setLoans(data);

        } catch (err) {

            console.error(
                "Customer Loan Service error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to load your loans. Make sure Loan Service and API Gateway are running."
            );


            setLoans([]);

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadLoans();

    }, []);


    // =====================================================
    // SEARCH
    // =====================================================

    useEffect(() => {

        const keyword =
            search
                .toLowerCase()
                .trim();


        if (!keyword) {

            setFilteredLoans(
                loans
            );

            return;

        }


        const result =
            loans.filter(
                (loan) =>
                    [
                        loan.loanNumber,
                        loan.loanType,
                        loan.status,
                        loan.loanStatus,
                        loan.principalAmount,
                        loan.amount,
                        loan.loanAmount,
                    ]
                        .filter(
                            (value) =>
                                value !== null &&
                                value !== undefined
                        )
                        .some(
                            (value) =>
                                String(value)
                                    .toLowerCase()
                                    .includes(
                                        keyword
                                    )
                        )
            );


        setFilteredLoans(
            result
        );

    }, [loans, search]);


    // =====================================================
    // STATUS
    // =====================================================

    const getStatus = (loan) => {

        return String(
            loan.status ||
            loan.loanStatus ||
            "PENDING"
        ).toUpperCase();

    };


    // =====================================================
    // AMOUNT
    // =====================================================

    const getAmount = (loan) => {

        return Number(
            loan.principalAmount ||
            loan.amount ||
            loan.loanAmount ||
            0
        );

    };


    // =====================================================
    // VIEW DETAILS
    // =====================================================

    const viewLoan = (loan) => {

        setSelectedLoan(
            loan
        );

        setShowDetails(
            true
        );

    };


    // =====================================================
    // CLOSE DETAILS
    // =====================================================

    const closeDetails = () => {

        setSelectedLoan(
            null
        );

        setShowDetails(
            false
        );

    };


    // =====================================================
    // NEW LOAN
    // =====================================================

    const handleNewLoan = () => {
        setLoanForm({ loanType: "PERSONAL", loanAmount: "", interestRate: "", tenureMonths: "" });
        setShowNewLoan(true);
    };

    const handleCreateLoan = async (e) => {
        e.preventDefault();
        const customerId = getCustomerId();
        if (!customerId) return alert("Customer ID was not found. Please login again.");
        if (!loanForm.loanAmount || !loanForm.interestRate || !loanForm.tenureMonths) {
            return alert("Please fill all loan details.");
        }
        try {
            setCreatingLoan(true);
            await axios.post(API_URL, {
                customerId: Number(customerId),
                loanType: loanForm.loanType,
                loanAmount: Number(loanForm.loanAmount),
                interestRate: Number(loanForm.interestRate),
                tenureMonths: Number(loanForm.tenureMonths)
            });
            setShowNewLoan(false);
            alert("Loan request submitted. It is now PENDING admin approval.");
            await loadLoans();
        } catch (err) {
            alert(err.response?.data?.message || "Unable to submit loan request.");
        } finally {
            setCreatingLoan(false);
        }
    };


    // =====================================================
    // STATISTICS
    // =====================================================

    const totalLoans =
        loans.length;


    const pendingLoans =
        loans.filter(
            (loan) =>
                getStatus(loan) ===
                "PENDING"
        ).length;


    const approvedLoans =
        loans.filter(
            (loan) =>
                getStatus(loan) ===
                "APPROVED"
        ).length;


    const rejectedLoans =
        loans.filter(
            (loan) =>
                getStatus(loan) ===
                "REJECTED"
        ).length;


    const totalAmount =
        loans.reduce(
            (sum, loan) =>
                sum +
                getAmount(loan),
            0
        );


    // =====================================================
    // UI
    // =====================================================

    return (

        <CustomerLayout>

            <div className="customer-loans-page">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="customer-loans-header">

                    <div>

                        <span className="customer-loans-eyebrow">
                            FINCORE NEXUS / MY LOANS
                        </span>


                        <h1>
                            My Loans
                        </h1>


                        <p>
                            View and track your loan
                            applications and repayments.
                        </p>

                    </div>


                    {/* =================================================
                        HEADER BUTTONS
                    ================================================= */}

                    <div className="customer-loans-header-actions">

                        {/* NEW LOAN */}

                        <button
                            type="button"
                            className="customer-new-loan-button"
                            onClick={
                                handleNewLoan
                            }
                        >

                            <Plus
                                size={18}
                            />

                            New Loan

                        </button>


                        {/* REFRESH */}

                        <button
                            type="button"
                            className="customer-loans-refresh"
                            onClick={
                                loadLoans
                            }
                        >

                            <RefreshCw
                                size={17}
                            />

                            Refresh

                        </button>

                    </div>

                </div>


                {/* =================================================
                    SERVICE BANNER
                ================================================= */}

                <div className="customer-loan-service-banner">

                    <div>

                        <span className="customer-live-dot"></span>


                        <div>

                            <strong>
                                Loan Service
                            </strong>


                            <span>
                                Your personal loan information
                            </span>

                        </div>

                    </div>


                    <span className="customer-service-status">
                        OPERATIONAL
                    </span>

                </div>


                {/* =================================================
                    SUMMARY
                ================================================= */}

                <div className="customer-loan-stats">


                    {/* TOTAL LOANS */}

                    <div className="customer-loan-stat-card">

                        <div className="customer-loan-stat-icon purple">

                            <HandCoins
                                size={22}
                            />

                        </div>


                        <div>

                            <span>
                                Total Loans
                            </span>


                            <strong>
                                {totalLoans}
                            </strong>

                        </div>

                    </div>


                    {/* TOTAL AMOUNT */}

                    <div className="customer-loan-stat-card">

                        <div className="customer-loan-stat-icon blue">

                            <HandCoins
                                size={22}
                            />

                        </div>


                        <div>

                            <span>
                                Total Amount
                            </span>


                            <strong>

                                ₹
                                {totalAmount.toLocaleString(
                                    "en-IN"
                                )}

                            </strong>

                        </div>

                    </div>


                    {/* APPROVED */}

                    <div className="customer-loan-stat-card">

                        <div className="customer-loan-stat-icon green">

                            <HandCoins
                                size={22}
                            />

                        </div>


                        <div>

                            <span>
                                Approved
                            </span>


                            <strong>
                                {approvedLoans}
                            </strong>

                        </div>

                    </div>


                    {/* PENDING */}

                    <div className="customer-loan-stat-card">

                        <div className="customer-loan-stat-icon orange">

                            <HandCoins
                                size={22}
                            />

                        </div>


                        <div>

                            <span>
                                Pending
                            </span>


                            <strong>
                                {pendingLoans}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    LOAN DIRECTORY
                ================================================= */}

                <div className="customer-loans-panel">


                    <div className="customer-loans-panel-header">

                        <div>

                            <span>
                                LOAN DIRECTORY
                            </span>


                            <h2>
                                My loan applications
                            </h2>

                        </div>


                        <strong>
                            {filteredLoans.length} loans
                        </strong>

                    </div>


                    {/* =================================================
                        SEARCH
                    ================================================= */}

                    <div className="customer-loan-toolbar">

                        <div className="customer-loan-search">

                            <Search
                                size={18}
                            />


                            <input
                                type="text"
                                placeholder="Search loan number, type or status..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    </div>


                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (

                        <div className="customer-loan-error">

                            <strong>
                                Unable to load loans
                            </strong>


                            <span>
                                {error}
                            </span>


                            <button
                                type="button"
                                onClick={
                                    loadLoans
                                }
                            >
                                Retry
                            </button>

                        </div>

                    )}


                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {loading ? (

                        <div className="customer-loan-loading">

                            <div className="customer-loading-spinner"></div>


                            <span>
                                Loading your loans...
                            </span>

                        </div>

                    ) : (

                        <div className="customer-loans-table-wrapper">

                            <table className="customer-loans-table">


                                <thead>

                                <tr>

                                    <th>
                                        LOAN NUMBER
                                    </th>

                                    <th>
                                        TYPE
                                    </th>

                                    <th>
                                        AMOUNT
                                    </th>

                                    <th>
                                        INTEREST
                                    </th>

                                    <th>
                                        TENURE
                                    </th>

                                    <th>
                                        STATUS
                                    </th>

                                    <th>
                                        ACTION
                                    </th>

                                </tr>

                                </thead>


                                <tbody>


                                {filteredLoans.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="customer-empty-loans"
                                        >

                                            <HandCoins
                                                size={42}
                                            />


                                            <strong>
                                                No loans found
                                            </strong>


                                            <span>
                                                    You don't have any
                                                    loan applications yet.
                                                </span>

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
                                                getAmount(
                                                    loan
                                                );


                                            return (

                                                <tr
                                                    key={
                                                        id
                                                    }
                                                >


                                                    {/* LOAN NUMBER */}

                                                    <td>

                                                        <strong>

                                                            {
                                                                loan.loanNumber ||
                                                                `LOAN-${id}`
                                                            }

                                                        </strong>

                                                    </td>


                                                    {/* TYPE */}

                                                    <td>

                                                            <span className="customer-loan-type">

                                                                {
                                                                    loan.loanType ||
                                                                    "-"
                                                                }

                                                            </span>

                                                    </td>


                                                    {/* AMOUNT */}

                                                    <td>

                                                        <strong className="customer-loan-amount">

                                                            ₹
                                                            {amount.toLocaleString(
                                                                "en-IN"
                                                            )}

                                                        </strong>

                                                    </td>


                                                    {/* INTEREST */}

                                                    <td>

                                                        {
                                                            loan.interestRate ??
                                                            "-"
                                                        }

                                                        %

                                                    </td>


                                                    {/* TENURE */}

                                                    <td>

                                                        {
                                                            loan.tenureMonths ??
                                                            "-"
                                                        }

                                                        {" "}

                                                        months

                                                    </td>


                                                    {/* STATUS */}

                                                    <td>

                                                            <span
                                                                className={`customer-loan-status ${status.toLowerCase()}`}
                                                            >

                                                                {
                                                                    status
                                                                }

                                                            </span>

                                                    </td>


                                                    {/* ACTION */}

                                                    <td>

                                                        <button
                                                            type="button"
                                                            className="customer-loan-view-button"
                                                            onClick={() =>
                                                                viewLoan(
                                                                    loan
                                                                )
                                                            }
                                                            title="View loan"
                                                        >

                                                            <Eye
                                                                size={16}
                                                            />

                                                            View

                                                        </button>

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


                {showNewLoan && (
                    <div className="customer-loan-modal-overlay">
                        <div className="customer-loan-modal">
                            <div className="customer-loan-modal-header">
                                <div><span>LOAN APPLICATION</span><h2>Apply for Loan</h2></div>
                                <button type="button" onClick={() => setShowNewLoan(false)}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleCreateLoan}>
                                <div className="customer-loan-details">
                                    <div><label>Loan Type</label><select value={loanForm.loanType} onChange={e => setLoanForm({...loanForm, loanType:e.target.value})}><option>PERSONAL</option><option>HOME</option><option>EDUCATION</option><option>AUTO</option></select></div>
                                    <div><label>Loan Amount</label><input type="number" min="1" value={loanForm.loanAmount} onChange={e => setLoanForm({...loanForm, loanAmount:e.target.value})} /></div>
                                    <div><label>Interest Rate (%)</label><input type="number" min="0" step="0.01" value={loanForm.interestRate} onChange={e => setLoanForm({...loanForm, interestRate:e.target.value})} /></div>
                                    <div><label>Tenure (months)</label><input type="number" min="1" value={loanForm.tenureMonths} onChange={e => setLoanForm({...loanForm, tenureMonths:e.target.value})} /></div>
                                </div>
                                <div className="customer-loan-modal-footer">
                                    <button type="button" onClick={() => setShowNewLoan(false)}>Cancel</button>
                                    <button type="submit" disabled={creatingLoan}>{creatingLoan ? "Submitting..." : "Submit Application"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* =================================================
                    DETAILS MODAL
                ================================================= */}

                {showDetails &&
                    selectedLoan && (

                        <div className="customer-loan-modal-overlay">


                            <div className="customer-loan-modal">


                                {/* MODAL HEADER */}

                                <div className="customer-loan-modal-header">

                                    <div>

                                        <span>
                                            LOAN DETAILS
                                        </span>


                                        <h2>

                                            {
                                                selectedLoan.loanNumber ||
                                                "Loan Application"
                                            }

                                        </h2>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={
                                            closeDetails
                                        }
                                    >

                                        <X
                                            size={20}
                                        />

                                    </button>

                                </div>


                                {/* DETAILS */}

                                <div className="customer-loan-details">


                                    <div>

                                        <span>
                                            Customer ID
                                        </span>


                                        <strong>
                                            {
                                                selectedLoan.customerId
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Loan Type
                                        </span>


                                        <strong>

                                            {
                                                selectedLoan.loanType ||
                                                "-"
                                            }

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Principal Amount
                                        </span>


                                        <strong>

                                            ₹
                                            {getAmount(
                                                selectedLoan
                                            ).toLocaleString(
                                                "en-IN"
                                            )}

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Interest Rate
                                        </span>


                                        <strong>

                                            {
                                                selectedLoan.interestRate ??
                                                "-"
                                            }

                                            %

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Tenure
                                        </span>


                                        <strong>

                                            {
                                                selectedLoan.tenureMonths ??
                                                "-"
                                            }

                                            {" "}

                                            months

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Status
                                        </span>


                                        <strong>

                                            {
                                                getStatus(
                                                    selectedLoan
                                                )
                                            }

                                        </strong>

                                    </div>

                                </div>


                                {/* FOOTER */}

                                <div className="customer-loan-modal-footer">

                                    <button
                                        type="button"
                                        onClick={
                                            closeDetails
                                        }
                                    >
                                        Close
                                    </button>

                                </div>

                            </div>

                        </div>

                    )}

            </div>

        </CustomerLayout>

    );

}

export default CustomerLoans;