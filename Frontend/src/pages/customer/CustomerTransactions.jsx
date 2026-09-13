import React, { useEffect, useState } from "react";
import axios from "axios";

import CustomerLayout from "../../components/layout/CustomerLayout";
import "./CustomerTransactions.css";

const API_URL = "http://localhost:8080/api/transactions";

const CustomerTransactions = () => {

    // =====================================================
    // GET LOGGED-IN CUSTOMER
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

    const getCustomerId = () => {
        const user = getLoggedInUser();

        return (
            user.customerId ||
            user.id ||
            10
        );
    };

    const customerId = getCustomerId();

    // =====================================================
    // STATE
    // =====================================================

    const [transactions, setTransactions] = useState([]);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [creatingTransaction, setCreatingTransaction] =
        useState(false);

    const [formError, setFormError] = useState("");

    // =====================================================
    // FORM
    // =====================================================

    const [formData, setFormData] = useState({
        customerId: customerId,
        accountId: "",
        transactionType: "DEPOSIT",
        amount: "",
        description: ""
    });

    // =====================================================
    // LOAD TRANSACTIONS
    // =====================================================

    const fetchTransactions = async () => {

        try {

            setLoading(true);
            setError("");

            console.log(
                "Loading transactions for customer:",
                customerId
            );

            const response = await axios.get(
                `${API_URL}/customer/${customerId}`
            );

            console.log(
                "Transactions response:",
                response.data
            );

            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.content ||
                response.data?.transactions ||
                [];

            setTransactions(data);

        } catch (err) {

            console.error(
                "Error fetching transactions:",
                err
            );

            setTransactions([]);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to load transactions. Make sure Transaction Service and API Gateway are running."
            );

        } finally {

            setLoading(false);

        }

    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        fetchTransactions();

    }, []);

    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

    };

    // =====================================================
    // OPEN NEW TRANSACTION
    // =====================================================

    const openModal = () => {

        setFormData({
            customerId: customerId,
            accountId: "",
            transactionType: "DEPOSIT",
            amount: "",
            description: ""
        });

        setFormError("");

        setShowModal(true);

    };

    // =====================================================
    // CLOSE MODAL
    // =====================================================

    const closeModal = () => {

        if (creatingTransaction) {
            return;
        }

        setShowModal(false);

        setFormError("");

        setFormData({
            customerId: customerId,
            accountId: "",
            transactionType: "DEPOSIT",
            amount: "",
            description: ""
        });

    };

    // =====================================================
    // CREATE TRANSACTION
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setFormError("");

        // -----------------------------
        // CUSTOMER ID
        // -----------------------------

        if (!customerId) {

            setFormError(
                "Customer ID was not found. Please login again."
            );

            return;

        }

        // -----------------------------
        // ACCOUNT ID
        // -----------------------------

        if (!formData.accountId) {

            setFormError(
                "Please enter Account ID."
            );

            return;

        }

        // -----------------------------
        // AMOUNT
        // -----------------------------

        if (!formData.amount) {

            setFormError(
                "Please enter transaction amount."
            );

            return;

        }

        if (Number(formData.amount) <= 0) {

            setFormError(
                "Amount must be greater than zero."
            );

            return;

        }

        try {

            setCreatingTransaction(true);

            const payload = {

                customerId:
                    Number(customerId),

                accountId:
                    Number(formData.accountId),

                amount:
                    Number(formData.amount),

                transactionType:
                formData.transactionType,

                description:
                    formData.description || ""

            };

            console.log(
                "Creating transaction:",
                payload
            );

            await axios.post(
                API_URL,
                payload
            );

            // -----------------------------
            // CLOSE MODAL
            // -----------------------------

            setShowModal(false);

            // -----------------------------
            // RESET FORM
            // -----------------------------

            setFormData({
                customerId: customerId,
                accountId: "",
                transactionType: "DEPOSIT",
                amount: "",
                description: ""
            });

            // -----------------------------
            // REFRESH
            // -----------------------------

            await fetchTransactions();

        } catch (err) {

            console.error(
                "Transaction creation error:",
                err
            );

            console.error(
                "Backend response:",
                err.response?.data
            );

            setFormError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to create transaction. Please check Transaction Service."
            );

        } finally {

            setCreatingTransaction(false);

        }

    };

    // =====================================================
    // SEARCH
    // =====================================================

    const filteredTransactions =
        transactions.filter((transaction) => {

            const keyword =
                searchTerm
                    .toLowerCase()
                    .trim();

            if (!keyword) {
                return true;
            }

            return [
                transaction.transactionReference,
                transaction.transactionId,
                transaction.accountId,
                transaction.transactionType,
                transaction.type,
                transaction.status,
                transaction.description,
                transaction.amount
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

        });

    // =====================================================
    // STATUS
    // =====================================================

    const getStatus = (transaction) => {

        return String(
            transaction.status ||
            transaction.transactionStatus ||
            "PENDING"
        ).toUpperCase();

    };

    // =====================================================
    // TRANSACTION TYPE
    // =====================================================

    const getTransactionType = (transaction) => {

        return String(
            transaction.transactionType ||
            transaction.type ||
            "TRANSACTION"
        ).toUpperCase();

    };

    // =====================================================
    // AMOUNT
    // =====================================================

    const getAmount = (transaction) => {

        return Number(
            transaction.amount ||
            transaction.transactionAmount ||
            0
        );

    };

    // =====================================================
    // FORMAT AMOUNT
    // =====================================================

    const formatAmount = (amount) => {

        return Number(amount || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        try {

            return new Date(date).toLocaleString(
                "en-IN"
            );

        } catch {

            return date;

        }

    };

    // =====================================================
    // STATISTICS
    // =====================================================

    const totalTransactions =
        transactions.length;

    const successfulTransactions =
        transactions.filter(
            (transaction) =>
                getStatus(transaction) ===
                "SUCCESS"
        ).length;

    const pendingTransactions =
        transactions.filter(
            (transaction) =>
                getStatus(transaction) ===
                "PENDING"
        ).length;

    const transactionVolume =
        transactions.reduce(
            (sum, transaction) =>
                sum + getAmount(transaction),
            0
        );

    // =====================================================
    // RENDER
    // =====================================================

    return (

        <CustomerLayout>

            <div className="customer-transactions-page">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="transactions-header">

                    <div>

                        <div className="breadcrumb">
                            FINCORE NEXUS / MY TRANSACTIONS
                        </div>

                        <h1>
                            My Transactions
                        </h1>

                        <p>
                            View and monitor your banking transactions.
                        </p>

                    </div>

                    <div className="header-actions">

                        <button
                            type="button"
                            className="new-transaction-btn"
                            onClick={openModal}
                        >

                            <span>
                                ＋
                            </span>

                            New Transaction

                        </button>

                        <button
                            type="button"
                            className="refresh-btn"
                            onClick={fetchTransactions}
                        >

                            ↻

                            Refresh

                        </button>

                    </div>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="error-message">

                        {error}

                        <button
                            type="button"
                            onClick={fetchTransactions}
                            style={{
                                marginLeft: "12px"
                            }}
                        >
                            Retry
                        </button>

                    </div>

                )}


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <div className="transaction-stats">

                    {/* TOTAL */}

                    <div className="stat-card">

                        <div className="stat-icon">
                            ⇄
                        </div>

                        <div>

                            <p>
                                Total Transactions
                            </p>

                            <h2>
                                {totalTransactions}
                            </h2>

                        </div>

                    </div>


                    {/* VOLUME */}

                    <div className="stat-card">

                        <div className="stat-icon">
                            ₹
                        </div>

                        <div>

                            <p>
                                Transaction Volume
                            </p>

                            <h2>
                                ₹
                                {formatAmount(
                                    transactionVolume
                                )}
                            </h2>

                        </div>

                    </div>


                    {/* SUCCESSFUL */}

                    <div className="stat-card">

                        <div className="stat-icon">
                            ✓
                        </div>

                        <div>

                            <p>
                                Successful
                            </p>

                            <h2>
                                {successfulTransactions}
                            </h2>

                        </div>

                    </div>


                    {/* PENDING */}

                    <div className="stat-card">

                        <div className="stat-icon">
                            ◷
                        </div>

                        <div>

                            <p>
                                Pending
                            </p>

                            <h2>
                                {pendingTransactions}
                            </h2>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    TRANSACTION DIRECTORY
                ================================================= */}

                <div className="transaction-directory">

                    <div className="directory-header">

                        <div>

                            <div className="section-label">
                                TRANSACTION DIRECTORY
                            </div>

                            <h2>
                                Your banking transactions
                            </h2>

                        </div>

                        <strong>
                            {filteredTransactions.length}
                            {" "}
                            transactions
                        </strong>

                    </div>


                    {/* SEARCH */}

                    <div className="transaction-search">

                        <span>
                            ⌕
                        </span>

                        <input
                            type="text"
                            placeholder="Search transaction ID, account, type or status..."
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    {/* TABLE */}

                    <div className="transaction-table-wrapper">

                        <table className="transaction-table">

                            <thead>

                            <tr>

                                <th>
                                    TRANSACTION ID
                                </th>

                                <th>
                                    ACCOUNT ID
                                </th>

                                <th>
                                    TYPE
                                </th>

                                <th>
                                    AMOUNT
                                </th>

                                <th>
                                    STATUS
                                </th>

                                <th>
                                    DATE
                                </th>

                                <th>
                                    ACTION
                                </th>

                            </tr>

                            </thead>


                            <tbody>

                            {loading ? (

                                <tr>

                                    <td
                                        colSpan="7"
                                        className="empty-row"
                                    >
                                        Loading transactions...
                                    </td>

                                </tr>

                            ) : filteredTransactions.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="7"
                                        className="empty-row"
                                    >

                                        <div className="empty-icon">
                                            ⇄
                                        </div>

                                        <div>
                                            No transactions found
                                        </div>

                                    </td>

                                </tr>

                            ) : (

                                filteredTransactions.map(
                                    (transaction, index) => {

                                        const id =
                                            transaction.id ||
                                            transaction.transactionReference ||
                                            index;

                                        const type =
                                            getTransactionType(
                                                transaction
                                            );

                                        const status =
                                            getStatus(
                                                transaction
                                            );

                                        const amount =
                                            getAmount(
                                                transaction
                                            );

                                        return (

                                            <tr
                                                key={id}
                                            >

                                                {/* TRANSACTION ID */}

                                                <td>

                                                    <strong>
                                                        {
                                                            transaction.transactionReference ||
                                                            transaction.transactionId ||
                                                            `TXN-${transaction.id || index + 1}`
                                                        }
                                                    </strong>

                                                </td>


                                                {/* ACCOUNT */}

                                                <td>

                                                    {
                                                        transaction.accountId ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* TYPE */}

                                                <td>

                                                        <span
                                                            className={`transaction-type ${type.toLowerCase()}`}
                                                        >

                                                            {type}

                                                        </span>

                                                </td>


                                                {/* AMOUNT */}

                                                <td>

                                                    <strong>
                                                        ₹
                                                        {formatAmount(
                                                            amount
                                                        )}
                                                    </strong>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                        <span
                                                            className={`status-badge ${status.toLowerCase()}`}
                                                        >

                                                            {status}

                                                        </span>

                                                </td>


                                                {/* DATE */}

                                                <td>

                                                    {
                                                        formatDate(
                                                            transaction.createdAt
                                                        )
                                                    }

                                                </td>


                                                {/* ACTION */}

                                                <td>

                                                    <button
                                                        type="button"
                                                        className="view-btn"
                                                        onClick={() =>
                                                            alert(
                                                                `Transaction: ${
                                                                    transaction.transactionReference ||
                                                                    transaction.id
                                                                }`
                                                            )
                                                        }
                                                    >

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

                </div>


                {/* =================================================
                    NEW TRANSACTION MODAL
                ================================================= */}

                {showModal && (

                    <div
                        className="modal-overlay"
                        onClick={closeModal}
                    >

                        <div
                            className="transaction-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            {/* MODAL HEADER */}

                            <div className="modal-header">

                                <div>

                                    <div className="modal-label">
                                        NEW TRANSACTION
                                    </div>

                                    <h2>
                                        Create Transaction
                                    </h2>

                                </div>

                                <button
                                    type="button"
                                    className="close-modal-btn"
                                    onClick={closeModal}
                                    disabled={
                                        creatingTransaction
                                    }
                                >

                                    ×

                                </button>

                            </div>


                            {/* FORM */}

                            <form
                                className="transaction-form"
                                onSubmit={handleSubmit}
                            >

                                {/* CUSTOMER ID */}

                                <div className="form-group">

                                    <label>
                                        Customer ID
                                    </label>

                                    <input
                                        type="number"
                                        name="customerId"
                                        value={
                                            formData.customerId
                                        }
                                        readOnly
                                    />

                                </div>


                                {/* ACCOUNT ID */}

                                <div className="form-group">

                                    <label>
                                        Account ID
                                    </label>

                                    <input
                                        type="number"
                                        name="accountId"
                                        placeholder="Enter account ID"
                                        value={
                                            formData.accountId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                {/* TRANSACTION TYPE */}

                                <div className="form-group">

                                    <label>
                                        Transaction Type
                                    </label>

                                    <select
                                        name="transactionType"
                                        value={
                                            formData.transactionType
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >

                                        <option value="DEPOSIT">
                                            Deposit
                                        </option>

                                        <option value="WITHDRAWAL">
                                            Withdrawal
                                        </option>

                                        <option value="BANK_TRANSFER">
                                            Bank Transfer
                                        </option>

                                    </select>

                                </div>


                                {/* AMOUNT */}

                                <div className="form-group">

                                    <label>
                                        Amount
                                    </label>

                                    <input
                                        type="number"
                                        name="amount"
                                        placeholder="Enter amount"
                                        min="0.01"
                                        step="0.01"
                                        value={
                                            formData.amount
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                {/* DESCRIPTION */}

                                <div className="form-group full-width">

                                    <label>
                                        Description
                                    </label>

                                    <input
                                        type="text"
                                        name="description"
                                        placeholder="Transaction description"
                                        value={
                                            formData.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>


                                {/* ERROR */}

                                {formError && (

                                    <div className="form-error">

                                        <strong>
                                            Unable to create transaction
                                        </strong>

                                        <span>
                                            {formError}
                                        </span>

                                    </div>

                                )}


                                {/* FOOTER */}

                                <div className="modal-footer">

                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={closeModal}
                                        disabled={
                                            creatingTransaction
                                        }
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        className="create-btn"
                                        disabled={
                                            creatingTransaction
                                        }
                                    >

                                        {creatingTransaction
                                            ? "Creating..."
                                            : "Create Transaction"}

                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}

            </div>

        </CustomerLayout>

    );

};

export default CustomerTransactions;