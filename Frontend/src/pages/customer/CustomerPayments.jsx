import { useEffect, useState } from "react";
import axios from "axios";

import {
    CreditCard,
    RefreshCw,
    Search,
    Eye,
    X,
    Plus,
    ArrowUpRight,
    ArrowDownLeft,
} from "lucide-react";

import CustomerLayout from "../../components/layout/CustomerLayout";
import "./CustomerPayments.css";

const API_URL = "http://localhost:8080/api/payments";
const ACCOUNT_API_URL = "http://localhost:8080/api/accounts";

function CustomerPayments() {

    // =====================================================
    // PAYMENTS
    // =====================================================

    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    // =====================================================
    // CUSTOMER ACCOUNTS
    // =====================================================

    const [customerAccounts, setCustomerAccounts] = useState([]);

    // =====================================================
    // NEW PAYMENT
    // =====================================================

    const [showNewPayment, setShowNewPayment] = useState(false);

    const [paymentForm, setPaymentForm] = useState({
        accountId: "",
        recipientAccountId: "",
        paymentType: "ONLINE_PAYMENT",
        paymentMethod: "IMPS",
        amount: "",
        description: "",
        senderEmail: "",
        recipientEmail: "",
    });

    const [creatingPayment, setCreatingPayment] = useState(false);

    const [paymentCreateError, setPaymentCreateError] =
        useState("");

    // =====================================================
    // PAYMENT RESULT POPUPS
    // =====================================================

    const [paymentSuccess, setPaymentSuccess] = useState(null);

    const [paymentWarning, setPaymentWarning] = useState(null);

    // =====================================================
    // GET LOGGED-IN USER
    // =====================================================

    const getLoggedInUser = () => {

        try {

            return JSON.parse(
                localStorage.getItem("user") || "{}"
            );

        } catch (err) {

            console.error(
                "Unable to read logged-in user:",
                err
            );

            return {};

        }

    };

    // =====================================================
    // GET CUSTOMER ID
    // =====================================================

    const getCustomerId = () => {

        const user = getLoggedInUser();

        return (
            user.customerId ||
            user.id ||
            null
        );

    };

    // =====================================================
    // GET CUSTOMER ACCOUNTS
    // =====================================================

    const loadCustomerAccounts = async () => {

        try {

            const customerId = getCustomerId();

            if (!customerId) {
                return;
            }

            const response = await axios.get(
                `${ACCOUNT_API_URL}/customer/${customerId}`
            );

            const accounts =
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.content || [];

            setCustomerAccounts(accounts);

            console.log(
                "Customer accounts:",
                accounts
            );

        } catch (err) {

            console.error(
                "Unable to load customer accounts:",
                err
            );

            setCustomerAccounts([]);

        }

    };

    // =====================================================
    // GET CUSTOMER ACCOUNT IDS
    // =====================================================

    const getCustomerAccountIds = () => {

        return customerAccounts
            .map(account => Number(account.id))
            .filter(id => !Number.isNaN(id));

    };

    // =====================================================
    // GET PAYMENT DIRECTION
    // =====================================================

    const getPaymentDirection = (payment) => {

        const customerAccountIds =
            getCustomerAccountIds();

        const senderAccountId =
            Number(payment.accountId);

        const recipientAccountId =
            Number(payment.recipientAccountId);

        // DEPOSIT, WITHDRAWAL, EMI, and BILL only ever touch ONE
        // account (yours) - there's no real sender/recipient pair to
        // label, so give them their own honest direction instead of
        // being forced into "SENT to nobody".
        const singleAccountTypes = ["DEPOSIT", "WITHDRAWAL", "EMI", "BILL"];

        if (singleAccountTypes.includes((payment.paymentType || "").toUpperCase())) {
            return (payment.paymentType || "").toUpperCase();
        }

        if (
            customerAccountIds.includes(
                senderAccountId
            )
        ) {

            return "SENT";

        }

        if (
            customerAccountIds.includes(
                recipientAccountId
            )
        ) {

            return "RECEIVED";

        }

        return "UNKNOWN";

    };

    // =====================================================
    // LOAD PAYMENTS
    // =====================================================

    const loadPayments = async () => {

        try {

            setLoading(true);
            setError("");

            const customerId = getCustomerId();

            console.log(
                "Customer Payments - Customer ID:",
                customerId
            );

            if (!customerId) {

                setError(
                    "Customer ID was not found. Please login again."
                );

                return;

            }

            const response = await axios.get(
                `${API_URL}/customer/${customerId}`
            );

            console.log(
                "Payments response:",
                response.data
            );

            const data =
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.content ||
                    response.data?.payments ||
                    [];

            setPayments(data);

        } catch (err) {

            console.error(
                "Customer Payment Service error:",
                err
            );

            console.error(
                "Backend response:",
                err.response?.data
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to load your payments."
            );

        } finally {

            setLoading(false);

        }

    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadCustomerAccounts();
        loadPayments();

    }, []);

    // =====================================================
    // SEARCH
    // =====================================================

    useEffect(() => {

        const keyword =
            search.toLowerCase().trim();

        if (!keyword) {

            setFilteredPayments(payments);

            return;

        }

        const result =
            payments.filter(
                (payment) => {

                    const direction =
                        getPaymentDirection(payment);

                    return [
                        payment.paymentReference,
                        payment.paymentId,
                        payment.paymentType,
                        payment.paymentMethod,
                        payment.status,
                        payment.accountId,
                        payment.recipientAccountId,
                        payment.loanId,
                        payment.amount,
                        direction,
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
                                    .includes(keyword)
                        );

                }
            );

        setFilteredPayments(result);

    }, [payments, search, customerAccounts]);

    // =====================================================
    // STATUS
    // =====================================================

    const getStatus = (payment) => {

        return String(
            payment.status ||
            payment.paymentStatus ||
            "PENDING"
        ).toUpperCase();

    };

    // =====================================================
    // AMOUNT
    // =====================================================

    const getAmount = (payment) => {

        return Number(
            payment.amount ||
            payment.paymentAmount ||
            0
        );

    };

    // =====================================================
    // PAYMENT REFERENCE
    // =====================================================

    const getPaymentReference = (payment) => {

        return (
            payment.paymentReference ||
            payment.paymentId ||
            `PAY-${payment.id || ""}`
        );

    };

    // =====================================================
    // VIEW PAYMENT
    // =====================================================

    const viewPayment = (payment) => {

        setSelectedPayment(payment);

        setShowDetails(true);

    };

    // =====================================================
    // CLOSE DETAILS
    // =====================================================

    const closeDetails = () => {

        setSelectedPayment(null);

        setShowDetails(false);

    };

    // =====================================================
    // OPEN NEW PAYMENT
    // =====================================================

    const openNewPayment = async () => {

        setPaymentCreateError("");
        setPaymentWarning(null);
        setPaymentSuccess(null);

        await loadCustomerAccounts();

        setPaymentForm({
            accountId: "",
            recipientAccountId: "",
            paymentType: "ONLINE_PAYMENT",
            paymentMethod: "IMPS",
            amount: "",
            description: "",
            senderEmail:
                getLoggedInUser().email || "",
            recipientEmail: "",
        });

        setShowNewPayment(true);

    };

    // =====================================================
    // CLOSE NEW PAYMENT
    // =====================================================

    const closeNewPayment = () => {

        if (creatingPayment) {

            return;

        }

        setShowNewPayment(false);

        setPaymentCreateError("");

    };

    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handlePaymentChange = (e) => {

        const {
            name,
            value,
        } = e.target;

        setPaymentForm(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );

    };

    // =====================================================
    // CREATE PAYMENT
    // =====================================================

    const handleCreatePayment = async (e) => {

        e.preventDefault();

        if (creatingPayment) {

            return;

        }

        setPaymentCreateError("");
        setPaymentWarning(null);

        const customerId = getCustomerId();

        // =================================================
        // VALIDATION
        // =================================================

        if (!customerId) {

            setPaymentCreateError(
                "Customer ID was not found. Please login again."
            );

            return;

        }

        if (!paymentForm.accountId) {

            setPaymentCreateError(
                "Please select your account."
            );

            return;

        }

        if (!paymentForm.recipientAccountId) {

            setPaymentCreateError(
                "Please enter Recipient Account ID."
            );

            return;

        }

        if (
            Number(paymentForm.accountId) ===
            Number(paymentForm.recipientAccountId)
        ) {

            setPaymentCreateError(
                "Your account and recipient account cannot be the same."
            );

            return;

        }

        if (!paymentForm.amount) {

            setPaymentCreateError(
                "Please enter Amount."
            );

            return;

        }

        if (
            Number(paymentForm.amount) <= 0
        ) {

            setPaymentCreateError(
                "Amount must be greater than zero."
            );

            return;

        }

        if (!paymentForm.paymentType) {

            setPaymentCreateError(
                "Please select Payment Type."
            );

            return;

        }

        try {

            setCreatingPayment(true);

            // =================================================
            // PAYMENT PAYLOAD
            // =================================================

            const payload = {

                customerId:
                    Number(customerId),

                accountId:
                    Number(
                        paymentForm.accountId
                    ),

                recipientAccountId:
                    Number(
                        paymentForm.recipientAccountId
                    ),

                amount:
                    Number(
                        paymentForm.amount
                    ),

                paymentType:
                    paymentForm.paymentType,

                paymentMethod:
                    paymentForm.paymentMethod,

                description:
                    paymentForm.description ||
                    null,

                customerEmail:
                    paymentForm.senderEmail ||
                    null,

                recipientEmail:
                    paymentForm.recipientEmail ||
                    null,

            };

            console.log(
                "Creating payment:",
                payload
            );

            // =================================================
            // CREATE + PROCESS PAYMENT
            // =================================================

            const response =
                await axios.post(
                    API_URL,
                    payload
                );

            const createdPayment =
                response.data;

            console.log(
                "Payment completed:",
                createdPayment
            );

            // =================================================
            // PAYMENT DETAILS
            // =================================================

            const paymentReference =
                createdPayment?.paymentReference ||
                `PAY-${createdPayment?.id || ""}`;

            const amount =
                Number(
                    createdPayment?.amount ||
                    payload.amount
                );

            // =================================================
            // CLOSE FORM
            // =================================================

            setShowNewPayment(false);

            // =================================================
            // RESET FORM
            // =================================================

            setPaymentForm({
                accountId: "",
                recipientAccountId: "",
                paymentType: "ONLINE_PAYMENT",
                paymentMethod: "IMPS",
                amount: "",
                description: "",
                senderEmail:
                    getLoggedInUser().email || "",
                recipientEmail: "",
            });

            // =================================================
            // REFRESH
            // =================================================

            await loadCustomerAccounts();
            await loadPayments();

            // =================================================
            // SUCCESS POPUP
            // =================================================

            setPaymentSuccess({

                paymentId:
                    paymentReference,

                accountId:
                    payload.accountId,

                recipientAccountId:
                    payload.recipientAccountId,

                amount:
                    amount,

            });

        } catch (err) {

            console.error(
                "Create payment error:",
                err
            );

            console.error(
                "HTTP status:",
                err.response?.status
            );

            console.error(
                "Backend error:",
                err.response?.data
            );

            const backendError =
                err.response?.data;

            let backendMessage = "";

            if (
                typeof backendError ===
                "string"
            ) {

                backendMessage =
                    backendError;

            } else if (
                backendError?.message
            ) {

                backendMessage =
                    backendError.message;

            } else if (
                backendError?.error
            ) {

                backendMessage =
                    backendError.error;

            } else {

                backendMessage =
                    err.message || "";

            }

            backendMessage =
                String(
                    backendMessage
                );

            setShowNewPayment(false);

            const lowerMessage =
                backendMessage.toLowerCase();

            if (
                lowerMessage.includes(
                    "insufficient"
                ) ||
                lowerMessage.includes(
                    "balance"
                ) ||
                lowerMessage.includes(
                    "unable to withdraw"
                ) ||
                lowerMessage.includes(
                    "withdraw"
                )
            ) {

                setPaymentWarning({

                    message:
                        "Insufficient balance. No money was deducted from your account.",

                });

            } else {

                setPaymentWarning({

                    message:
                        backendMessage ||
                        "Payment could not be completed. No money was deducted from your account.",

                });

            }

        } finally {

            setCreatingPayment(false);

        }

    };

    // =====================================================
    // STATISTICS
    // =====================================================

    const totalPayments =
        payments.length;

    const successfulPayments =
        payments.filter(
            (payment) => {

                const status =
                    getStatus(payment);

                return (
                    status === "COMPLETED" ||
                    status === "SUCCESS" ||
                    status === "SUCCESSFUL"
                );

            }
        ).length;

    const pendingPayments =
        payments.filter(
            (payment) =>
                getStatus(payment) ===
                "PENDING"
        ).length;

    const sentPayments =
        payments.filter(
            (payment) =>
                getPaymentDirection(payment) ===
                "SENT"
        );

    const receivedPayments =
        payments.filter(
            (payment) =>
                getPaymentDirection(payment) ===
                "RECEIVED"
        );

    const sentAmount =
        sentPayments.reduce(
            (sum, payment) =>
                sum + getAmount(payment),
            0
        );

    const receivedAmount =
        receivedPayments.reduce(
            (sum, payment) =>
                sum + getAmount(payment),
            0
        );

    const totalVolume =
        payments.reduce(
            (sum, payment) =>
                sum + getAmount(payment),
            0
        );

    // =====================================================
    // UI
    // =====================================================

    return (

        <CustomerLayout>

            <div className="customer-payments-page">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="customer-payments-header">

                    <div>

                        <span className="customer-payments-eyebrow">
                            FINCORE NEXUS / MY PAYMENTS
                        </span>

                        <h1>
                            My Payments
                        </h1>

                        <p>
                            View and monitor your payment
                            transactions.
                        </p>

                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "center",
                        }}
                    >

                        <button
                            type="button"
                            className="customer-new-payment-button"
                            onClick={openNewPayment}
                            disabled={creatingPayment}
                        >

                            <Plus size={17} />

                            New Payment

                        </button>

                        <button
                            type="button"
                            className="customer-payments-refresh"
                            onClick={() => {
                                loadCustomerAccounts();
                                loadPayments();
                            }}
                            disabled={creatingPayment}
                        >

                            <RefreshCw size={17} />

                            Refresh

                        </button>

                    </div>

                </div>

                {/* =================================================
                    SERVICE
                ================================================= */}

                <div className="customer-payment-service-banner">

                    <div>

                        <span className="customer-payment-live-dot"></span>

                        <div>

                            <strong>
                                Payment Service
                            </strong>

                            <span>
                                Your payment transaction information
                            </span>

                        </div>

                    </div>

                    <span className="customer-payment-status-live">
                        OPERATIONAL
                    </span>

                </div>

                {/* =================================================
                    SUMMARY
                ================================================= */}

                <div className="customer-payment-stats">

                    <div className="customer-payment-stat-card">

                        <div className="customer-payment-stat-icon purple">

                            <CreditCard size={22} />

                        </div>

                        <div>

                            <span>
                                Total Payments
                            </span>

                            <strong>
                                {totalPayments}
                            </strong>

                        </div>

                    </div>

                    <div className="customer-payment-stat-card">

                        <div className="customer-payment-stat-icon blue">
                            ₹
                        </div>

                        <div>

                            <span>
                                Total Volume
                            </span>

                            <strong>
                                ₹
                                {totalVolume.toLocaleString(
                                    "en-IN"
                                )}
                            </strong>

                        </div>

                    </div>

                    <div className="customer-payment-stat-card">

                        <div className="customer-payment-stat-icon green">
                            ↑
                        </div>

                        <div>

                            <span>
                                Sent
                            </span>

                            <strong>
                                ₹
                                {sentAmount.toLocaleString(
                                    "en-IN"
                                )}
                            </strong>

                        </div>

                    </div>

                    <div className="customer-payment-stat-card">

                        <div className="customer-payment-stat-icon orange">
                            ↓
                        </div>

                        <div>

                            <span>
                                Received
                            </span>

                            <strong>
                                ₹
                                {receivedAmount.toLocaleString(
                                    "en-IN"
                                )}
                            </strong>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    DIRECTORY
                ================================================= */}

                <div className="customer-payments-panel">

                    <div className="customer-payments-panel-header">

                        <div>

                            <span>
                                PAYMENT DIRECTORY
                            </span>

                            <h2>
                                My payment transactions
                            </h2>

                        </div>

                        <strong>
                            {filteredPayments.length} payments
                        </strong>

                    </div>

                    {/* SEARCH */}

                    <div className="customer-payment-toolbar">

                        <div className="customer-payment-search">

                            <Search size={18} />

                            <input
                                type="text"
                                placeholder="Search payment ID, account, direction or status..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    </div>

                    {/* ERROR */}

                    {error && (

                        <div className="customer-payment-error">

                            <strong>
                                Payment Service unavailable
                            </strong>

                            <span>
                                {error}
                            </span>

                            <button
                                onClick={loadPayments}
                            >
                                Retry
                            </button>

                        </div>

                    )}

                    {/* LOADING */}

                    {loading ? (

                        <div className="customer-payment-loading">

                            <div className="customer-payment-spinner"></div>

                            <span>
                                Loading your payments...
                            </span>

                        </div>

                    ) : (

                        <div className="customer-payments-table-wrapper">

                            <table className="customer-payments-table">

                                <thead>

                                <tr>

                                    <th>
                                        PAYMENT ID
                                    </th>

                                    <th>
                                        DIRECTION
                                    </th>

                                    <th>
                                        ACCOUNT
                                    </th>

                                    <th>
                                        PAYMENT TYPE
                                    </th>

                                    <th>
                                        AMOUNT
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

                                {filteredPayments.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="customer-empty-payments"
                                        >

                                            <CreditCard
                                                size={42}
                                            />

                                            <strong>
                                                No payments found
                                            </strong>

                                            <span>
                                                Your payment transactions
                                                will appear here.
                                            </span>

                                        </td>

                                    </tr>

                                ) : (

                                    filteredPayments.map(
                                        (
                                            payment,
                                            index
                                        ) => {

                                            const id =
                                                payment.id ||
                                                payment.paymentId ||
                                                index;

                                            const status =
                                                getStatus(
                                                    payment
                                                );

                                            const amount =
                                                getAmount(
                                                    payment
                                                );

                                            const direction =
                                                getPaymentDirection(
                                                    payment
                                                );

                                            const isSent =
                                                direction ===
                                                "SENT";

                                            const accountToShow =
                                                isSent
                                                    ? payment.recipientAccountId
                                                    : payment.accountId;

                                            return (

                                                <tr
                                                    key={id}
                                                >

                                                    {/* PAYMENT ID */}

                                                    <td>

                                                        <strong>
                                                            {
                                                                getPaymentReference(
                                                                    payment
                                                                )
                                                            }
                                                        </strong>

                                                    </td>

                                                    {/* DIRECTION */}

                                                    <td>

                                                        {direction === "SENT" ? (

                                                            <span
                                                                className="customer-payment-direction sent"
                                                                style={{
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    gap: "5px",
                                                                }}
                                                            >

                                                                <ArrowUpRight
                                                                    size={16}
                                                                />

                                                                SENT

                                                            </span>

                                                        ) : direction === "RECEIVED" ? (

                                                            <span
                                                                className="customer-payment-direction received"
                                                                style={{
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    gap: "5px",
                                                                }}
                                                            >

                                                                <ArrowDownLeft
                                                                    size={16}
                                                                />

                                                                RECEIVED

                                                            </span>

                                                        ) : (

                                                            <span
                                                                className="customer-payment-direction"
                                                                style={{
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    gap: "5px",
                                                                }}
                                                            >
                                                                {direction}
                                                            </span>

                                                        )}

                                                    </td>

                                                    {/* ACCOUNT */}

                                                    <td>

                                                        <strong>
                                                            {direction === "SENT"
                                                                ? `To: ${accountToShow || "-"}`
                                                                : direction === "RECEIVED"
                                                                    ? `From: ${accountToShow || "-"}`
                                                                    : `Account: ${payment.accountId}`
                                                            }
                                                        </strong>

                                                    </td>

                                                    {/* PAYMENT TYPE */}

                                                    <td>

                                                        <span className="customer-payment-type">

                                                            {
                                                                payment.paymentType ||
                                                                "-"
                                                            }

                                                        </span>

                                                    </td>

                                                    {/* AMOUNT */}

                                                    <td>

                                                        <strong className="customer-payment-amount">

                                                            ₹
                                                            {amount.toLocaleString(
                                                                "en-IN"
                                                            )}

                                                        </strong>

                                                    </td>

                                                    {/* STATUS */}

                                                    <td>

                                                        <span
                                                            className={`customer-payment-status ${status.toLowerCase()}`}
                                                        >

                                                            {status}

                                                        </span>

                                                    </td>

                                                    {/* ACTION */}

                                                    <td>

                                                        <button
                                                            type="button"
                                                            className="customer-payment-view-button"
                                                            onClick={() =>
                                                                viewPayment(
                                                                    payment
                                                                )
                                                            }
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

                {/* =================================================
                    PAYMENT DETAILS MODAL
                ================================================= */}

                {showDetails &&
                    selectedPayment && (

                        <div className="customer-payment-modal-overlay">

                            <div className="customer-payment-modal">

                                <div className="customer-payment-modal-header">

                                    <div>

                                        <span>
                                            PAYMENT DETAILS
                                        </span>

                                        <h2>
                                            {
                                                getPaymentReference(
                                                    selectedPayment
                                                )
                                            }
                                        </h2>

                                    </div>

                                    <button
                                        type="button"
                                        onClick={closeDetails}
                                    >

                                        <X size={20} />

                                    </button>

                                </div>

                                <div className="customer-payment-details">

                                    <div>

                                        <span>
                                            Payment ID
                                        </span>

                                        <strong>
                                            {
                                                getPaymentReference(
                                                    selectedPayment
                                                )
                                            }
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Direction
                                        </span>

                                        <strong>
                                            {
                                                getPaymentDirection(
                                                    selectedPayment
                                                )
                                            }
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Customer ID
                                        </span>

                                        <strong>
                                            {
                                                selectedPayment.customerId ||
                                                "-"
                                            }
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            From Account
                                        </span>

                                        <strong>
                                            {
                                                selectedPayment.accountId ||
                                                "-"
                                            }
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            To Account
                                        </span>

                                        <strong>
                                            {
                                                selectedPayment.recipientAccountId ||
                                                "-"
                                            }
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Payment Type
                                        </span>

                                        <strong>
                                            {
                                                selectedPayment.paymentType ||
                                                "-"
                                            }
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Payment Method
                                        </span>

                                        <strong>
                                            {
                                                selectedPayment.paymentMethod ||
                                                "-"
                                            }
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Amount
                                        </span>

                                        <strong>

                                            ₹
                                            {getAmount(
                                                selectedPayment
                                            ).toLocaleString(
                                                "en-IN"
                                            )}

                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Status
                                        </span>

                                        <strong>
                                            {
                                                getStatus(
                                                    selectedPayment
                                                )
                                            }
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Description
                                        </span>

                                        <strong>
                                            {
                                                selectedPayment.description ||
                                                "-"
                                            }
                                        </strong>

                                    </div>

                                </div>

                                <div className="customer-payment-modal-footer">

                                    <button
                                        type="button"
                                        onClick={closeDetails}
                                    >
                                        Close
                                    </button>

                                </div>

                            </div>

                        </div>

                    )}

                {/* =================================================
                    NEW PAYMENT MODAL
                ================================================= */}

                {showNewPayment && (

                    <div className="customer-payment-modal-overlay">

                        <div className="customer-payment-modal customer-new-payment-modal">

                            <div className="customer-payment-modal-header">

                                <div>

                                    <span>
                                        PAYMENT SERVICE
                                    </span>

                                    <h2>
                                        Make a Payment
                                    </h2>

                                </div>

                                <button
                                    type="button"
                                    onClick={closeNewPayment}
                                    disabled={creatingPayment}
                                >

                                    <X size={20} />

                                </button>

                            </div>

                            <form
                                onSubmit={
                                    handleCreatePayment
                                }
                            >

                                <div className="customer-payment-details">

                                    {/* =================================================
                                        YOUR ACCOUNT
                                    ================================================= */}

                                    <div>

                                        <label>
                                            Your Account
                                        </label>

                                        <select
                                            name="accountId"
                                            value={
                                                paymentForm.accountId
                                            }
                                            onChange={
                                                handlePaymentChange
                                            }
                                            required
                                            disabled={
                                                creatingPayment
                                            }
                                        >

                                            <option value="">
                                                Select your account
                                            </option>

                                            {customerAccounts
                                                .filter(
                                                    account =>
                                                        String(
                                                            account.status
                                                        ).toUpperCase() ===
                                                        "ACTIVE"
                                                )
                                                .map(
                                                    account => (

                                                        <option
                                                            key={account.id}
                                                            value={account.id}
                                                        >

                                                            Account {account.id}
                                                            {" - "}
                                                            {account.accountNumber}
                                                            {" - ₹"}
                                                            {Number(
                                                                account.balance || 0
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )}

                                                        </option>

                                                    )
                                                )}

                                        </select>

                                    </div>

                                    {/* =================================================
                                        PAYMENT TYPE
                                    ================================================= */}

                                    <div>

                                        <label>
                                            Payment Type
                                        </label>

                                        <select
                                            name="paymentType"
                                            value={
                                                paymentForm.paymentType
                                            }
                                            onChange={
                                                handlePaymentChange
                                            }
                                            required
                                            disabled={
                                                creatingPayment
                                            }
                                        >

                                            <option value="ONLINE_PAYMENT">
                                                Online Payment
                                            </option>

                                            <option value="SHOPKEEPER_PAYMENT">
                                                Shopkeeper Payment
                                            </option>

                                        </select>

                                    </div>

                                    {/* =================================================
                                        PAYMENT METHOD
                                    ================================================= */}

                                    <div>

                                        <label>
                                            Payment Method
                                        </label>

                                        <select
                                            name="paymentMethod"
                                            value={
                                                paymentForm.paymentMethod
                                            }
                                            onChange={
                                                handlePaymentChange
                                            }
                                            required
                                            disabled={
                                                creatingPayment
                                            }
                                        >

                                            <option value="IMPS">
                                                IMPS
                                            </option>

                                            <option value="NEFT">
                                                NEFT
                                            </option>

                                            <option value="RTGS">
                                                RTGS
                                            </option>

                                            <option value="UPI">
                                                UPI
                                            </option>

                                        </select>

                                    </div>

                                    {/* =================================================
                                        SENDER EMAIL (YOUR OWN CONFIRMATION EMAIL)
                                    ================================================= */}

                                    <div>

                                        <label>
                                            Your Email (for payment confirmation)
                                        </label>

                                        <input
                                            type="email"
                                            name="senderEmail"
                                            value={
                                                paymentForm.senderEmail
                                            }
                                            onChange={
                                                handlePaymentChange
                                            }
                                            placeholder="you@example.com"
                                            disabled={
                                                creatingPayment
                                            }
                                        />

                                    </div>

                                    {/* =================================================
                                        RECIPIENT EMAIL (OPTIONAL)
                                    ================================================= */}

                                    <div>

                                        <label>
                                            Recipient Email (optional)
                                        </label>

                                        <input
                                            type="email"
                                            name="recipientEmail"
                                            value={
                                                paymentForm.recipientEmail
                                            }
                                            onChange={
                                                handlePaymentChange
                                            }
                                            placeholder="For sending a credit alert"
                                            disabled={
                                                creatingPayment
                                            }
                                        />

                                    </div>

                                    {/* =================================================
                                        RECIPIENT
                                    ================================================= */}

                                    <div>

                                        <label>
                                            Recipient Account ID
                                        </label>

                                        <input
                                            type="number"
                                            name="recipientAccountId"
                                            value={
                                                paymentForm.recipientAccountId
                                            }
                                            onChange={
                                                handlePaymentChange
                                            }
                                            placeholder={
                                                paymentForm.paymentType ===
                                                "SHOPKEEPER_PAYMENT"
                                                    ? "Enter shopkeeper account ID"
                                                    : "Enter recipient account ID"
                                            }
                                            min="1"
                                            required
                                            disabled={
                                                creatingPayment
                                            }
                                        />

                                    </div>

                                    {/* =================================================
                                        AMOUNT
                                    ================================================= */}

                                    <div>

                                        <label>
                                            Amount
                                        </label>

                                        <input
                                            type="number"
                                            name="amount"
                                            value={
                                                paymentForm.amount
                                            }
                                            onChange={
                                                handlePaymentChange
                                            }
                                            placeholder="Enter amount"
                                            min="0.01"
                                            step="0.01"
                                            required
                                            disabled={
                                                creatingPayment
                                            }
                                        />

                                    </div>

                                    {/* =================================================
                                        DESCRIPTION
                                    ================================================= */}

                                    <div>

                                        <label>
                                            Description
                                        </label>

                                        <input
                                            type="text"
                                            name="description"
                                            value={
                                                paymentForm.description
                                            }
                                            onChange={
                                                handlePaymentChange
                                            }
                                            placeholder={
                                                paymentForm.paymentType ===
                                                "SHOPKEEPER_PAYMENT"
                                                    ? "Example: Grocery payment"
                                                    : "Example: Money transfer"
                                            }
                                            disabled={
                                                creatingPayment
                                            }
                                        />

                                    </div>

                                </div>

                                {/* ERROR */}

                                {paymentCreateError && (

                                    <div
                                        className="customer-payment-error"
                                        style={{
                                            margin:
                                                "0 24px 16px",
                                        }}
                                    >

                                        <strong>
                                            Unable to make payment
                                        </strong>

                                        <span>
                                            {
                                                paymentCreateError
                                            }
                                        </span>

                                    </div>

                                )}

                                {/* FOOTER */}

                                <div className="customer-payment-modal-footer">

                                    <button
                                        type="button"
                                        onClick={
                                            closeNewPayment
                                        }
                                        disabled={
                                            creatingPayment
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            creatingPayment
                                        }
                                        className="customer-new-payment-submit"
                                    >

                                        {
                                            creatingPayment
                                                ? "Processing..."
                                                : "Pay Now"
                                        }

                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}

                {/* =================================================
                    SUCCESS POPUP
                ================================================= */}

                {paymentSuccess && (

                    <div className="customer-payment-result-overlay">

                        <div className="customer-payment-result-modal success">

                            <div className="customer-payment-success-icon">
                                ✓
                            </div>

                            <h2>
                                Payment Successful
                            </h2>

                            <p className="customer-payment-result-amount">

                                ₹
                                {paymentSuccess.amount.toLocaleString(
                                    "en-IN"
                                )}

                                {" "}
                                has been successfully transferred.

                            </p>

                            <div className="customer-payment-result-info">

                                <div>

                                    <span>
                                        Payment ID
                                    </span>

                                    <strong>
                                        {
                                            paymentSuccess.paymentId
                                        }
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        From Account
                                    </span>

                                    <strong>
                                        {
                                            paymentSuccess.accountId
                                        }
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        To Account
                                    </span>

                                    <strong>
                                        {
                                            paymentSuccess.recipientAccountId
                                        }
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        Amount
                                    </span>

                                    <strong>
                                        ₹
                                        {paymentSuccess.amount.toLocaleString(
                                            "en-IN"
                                        )}
                                    </strong>

                                </div>

                            </div>

                            <p className="customer-payment-success-text">

                                ₹
                                {paymentSuccess.amount.toLocaleString(
                                    "en-IN"
                                )}
                                {" "}
                                has been deducted from Account
                                {" "}
                                {paymentSuccess.accountId}
                                {" "}
                                and added to Account
                                {" "}
                                {paymentSuccess.recipientAccountId}.

                            </p>

                            <button
                                type="button"
                                className="customer-payment-success-button"
                                onClick={() =>
                                    setPaymentSuccess(null)
                                }
                            >
                                Done
                            </button>

                        </div>

                    </div>

                )}

                {/* =================================================
                    PAYMENT WARNING
                ================================================= */}

                {paymentWarning && (

                    <div className="customer-payment-result-overlay">

                        <div className="customer-payment-result-modal warning">

                            <div className="customer-payment-warning-icon">
                                ⚠
                            </div>

                            <h2>
                                Payment Not Completed
                            </h2>

                            <p className="customer-payment-warning-title">
                                Payment Failed
                            </p>

                            <p className="customer-payment-warning-message">
                                {
                                    paymentWarning.message
                                }
                            </p>

                            <div className="customer-payment-no-deduction">

                                <span>
                                    ⚠
                                </span>

                                <strong>
                                    No money was deducted from
                                    your account.
                                </strong>

                            </div>

                            <button
                                type="button"
                                className="customer-payment-warning-button"
                                onClick={() =>
                                    setPaymentWarning(null)
                                }
                            >
                                OK
                            </button>

                        </div>

                    </div>

                )}

            </div>

        </CustomerLayout>

    );

}

export default CustomerPayments;