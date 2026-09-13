
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { transactionApi } from "../services/api";
import "./Transactions.css";

function Transactions() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await transactionApi.getAll();

            console.log(
                "Transaction API Response:",
                response.data
            );

            /*
             * Backend returns:
             *
             * [
             *   {
             *      id: 6,
             *      transactionReference: "...",
             *      customerId: 6,
             *      accountId: 6,
             *      amount: 50000,
             *      transactionType: "DEPOSIT",
             *      status: "SUCCESS"
             *   }
             * ]
             */

            let data = [];

            if (Array.isArray(response.data)) {
                data = response.data;
            } else if (
                Array.isArray(response.data?.content)
            ) {
                data = response.data.content;
            } else if (
                Array.isArray(response.data?.transactions)
            ) {
                data = response.data.transactions;
            }

            /*
             * Newest transaction first.
             *
             * This makes the recently added transaction
             * visible at the top.
             */
            data.sort(
                (a, b) =>
                    Number(b.id || 0) -
                    Number(a.id || 0)
            );

            setTransactions(data);

        } catch (error) {

            console.error(
                "Transaction service error:",
                error
            );

            setError(
                "Transaction Service could not be reached. Make sure Transaction Service and API Gateway are running."
            );

            setTransactions([]);

        } finally {

            setLoading(false);
        }
    };

    /*
     * Backend field:
     * transactionReference
     *
     * Older frontend field:
     * transactionId
     *
     * We support both so existing data
     * will continue to work.
     */
    const getTransactionReference = (
        transaction
    ) => {

        return (
            transaction.transactionReference ||
            transaction.transactionId ||
            transaction.reference ||
            transaction.id ||
            "N/A"
        );
    };

    const getTransactionType = (
        transaction
    ) => {

        return (
            transaction.transactionType ||
            transaction.type ||
            "UNKNOWN"
        );
    };

    const getStatus = (
        transaction
    ) => {

        return String(
            transaction.status ||
            "PENDING"
        ).toUpperCase();
    };

    const getAmount = (
        transaction
    ) => {

        return Number(
            transaction.amount || 0
        );
    };

    /*
     * SUCCESS and COMPLETED are both treated
     * as successfully processed transactions.
     */
    const completedCount =
        transactions.filter(
            (transaction) => {

                const status =
                    getStatus(transaction);

                return (
                    status === "SUCCESS" ||
                    status === "COMPLETED"
                );
            }
        ).length;

    const pendingCount =
        transactions.filter(
            (transaction) =>
                getStatus(transaction) ===
                "PENDING"
        ).length;

    const transactionVolume =
        transactions.reduce(
            (total, transaction) =>
                total +
                getAmount(transaction),
            0
        );

    return (
        <div className="app-layout">

            {/* ================= SIDEBAR ================= */}

            <Sidebar
                open={sidebarOpen}
                onClose={() =>
                    setSidebarOpen(false)
                }
            />

            {/* ================= MAIN AREA ================= */}

            <div className="main-area">

                <Navbar
                    onMenuClick={() =>
                        setSidebarOpen(true)
                    }
                />

                <main className="dashboard">

                    {/* ================= PAGE HEADER ================= */}

                    <div className="page-heading">

                        <div>

                            <span className="eyebrow">
                                TRANSACTION SERVICE
                            </span>

                            <h1>
                                Transactions
                            </h1>

                            <p>
                                Monitor and manage banking
                                transactions across the platform.
                            </p>

                        </div>

                    </div>

                    {/* ================= SUMMARY ================= */}

                    <div className="transaction-summary-grid">

                        <div className="transaction-summary-card">

                            <span>
                                Total Transactions
                            </span>

                            <strong>
                                {transactions.length}
                            </strong>

                            <small>
                                All recorded transactions
                            </small>

                        </div>

                        <div className="transaction-summary-card">

                            <span>
                                Completed
                            </span>

                            <strong>
                                {completedCount}
                            </strong>

                            <small>
                                Successfully processed
                            </small>

                        </div>

                        <div className="transaction-summary-card">

                            <span>
                                Pending
                            </span>

                            <strong>
                                {pendingCount}
                            </strong>

                            <small>
                                Awaiting processing
                            </small>

                        </div>

                        <div className="transaction-summary-card">

                            <span>
                                Transaction Volume
                            </span>

                            <strong>
                                ₹
                                {transactionVolume.toLocaleString(
                                    "en-IN",
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }
                                )}
                            </strong>

                            <small>
                                Current transaction value
                            </small>

                        </div>

                    </div>

                    {/* ================= TRANSACTION DIRECTORY ================= */}

                    <div className="table-card">

                        <div className="table-header">

                            <div>

                                <h3>
                                    Transaction Directory
                                </h3>

                                <span>
                                    {transactions.length} transactions
                                </span>

                            </div>

                            <button
                                className="primary-btn"
                                onClick={loadTransactions}
                                disabled={loading}
                            >
                                {loading
                                    ? "Loading..."
                                    : "Refresh"}
                            </button>

                        </div>

                        {/* ================= ERROR ================= */}

                        {error && (

                            <div className="empty-state">

                                <strong>
                                    Transaction Service unavailable
                                </strong>

                                <p>
                                    {error}
                                </p>

                                <button
                                    className="primary-btn"
                                    onClick={loadTransactions}
                                >
                                    Retry
                                </button>

                            </div>

                        )}

                        {/* ================= LOADING ================= */}

                        {loading && !error ? (

                            <div className="empty-state">
                                Loading transactions...
                            </div>

                        ) : !error &&
                            transactions.length === 0 ? (

                            <div className="empty-state">
                                No transactions found.
                            </div>

                        ) : !error ? (

                            <div className="table-wrapper">

                                <table>

                                    <thead>

                                    <tr>

                                        <th>
                                            ID
                                        </th>

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

                                    </tr>

                                    </thead>

                                    <tbody>

                                    {transactions.map(
                                        (
                                            transaction,
                                            index
                                        ) => {

                                            const id =
                                                transaction.id ||
                                                index + 1;

                                            /*
                                             * IMPORTANT:
                                             *
                                             * Backend uses
                                             * transactionReference.
                                             */
                                            const transactionReference =
                                                getTransactionReference(
                                                    transaction
                                                );

                                            const accountId =
                                                transaction.accountId ??
                                                "N/A";

                                            const transactionType =
                                                getTransactionType(
                                                    transaction
                                                );

                                            const amount =
                                                getAmount(
                                                    transaction
                                                );

                                            const status =
                                                getStatus(
                                                    transaction
                                                );

                                            return (

                                                <tr
                                                    key={id}
                                                >

                                                    {/* ID */}

                                                    <td>
                                                        #
                                                        {id}
                                                    </td>

                                                    {/* TRANSACTION ID */}

                                                    <td>

                                                        <strong>
                                                            {
                                                                transactionReference
                                                            }
                                                        </strong>

                                                    </td>

                                                    {/* ACCOUNT ID */}

                                                    <td>

                                                        <strong>
                                                            {
                                                                accountId
                                                            }
                                                        </strong>

                                                    </td>

                                                    {/* TYPE */}

                                                    <td>

                                                        <span className="transaction-type">

                                                            {
                                                                transactionType
                                                            }

                                                        </span>

                                                    </td>

                                                    {/* AMOUNT */}

                                                    <td className="transaction-amount">

                                                        ₹{" "}

                                                        {
                                                            amount.toLocaleString(
                                                                "en-IN",
                                                                {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2
                                                                }
                                                            )
                                                        }

                                                    </td>

                                                    {/* STATUS */}

                                                    <td>

                                                        <span
                                                            className={`transaction-badge ${status
    .toLowerCase()
    .replace(
        /\s+/g,
        "-"
    )}`}
                                                        >

                                                            <span></span>

                                                            {
                                                                status
                                                            }

                                                        </span>

                                                    </td>

                                                </tr>

                                            );
                                        }
                                    )}

                                    </tbody>

                                </table>

                            </div>

                        ) : null}

                    </div>

                </main>

            </div>

        </div>
    );
}

export default Transactions;
