import { useEffect, useState } from "react";
import axios from "axios";

import {
    WalletCards,
    RefreshCw,
    Eye,
    X,
} from "lucide-react";

import CustomerLayout from "../../components/layout/CustomerLayout";

import "./CustomerAccounts.css";

const API_URL =
    "http://localhost:8080/api/accounts";

function CustomerAccounts() {

    const [user, setUser] = useState(null);

    const [accounts, setAccounts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [selectedAccount, setSelectedAccount] =
        useState(null);

    const [showDetails, setShowDetails] =
        useState(false);

    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestForm, setRequestForm] = useState({
        accountType: "SAVINGS",
        currency: "INR"
    });
    const [requesting, setRequesting] = useState(false);


    // =====================================================
    // LOAD LOGGED-IN USER
    // =====================================================

    useEffect(() => {

        try {

            const savedUser =
                JSON.parse(
                    localStorage.getItem("user") ||
                    localStorage.getItem("fincore_user") ||
                    "{}"
                );

            console.log(
                "CUSTOMER ACCOUNTS USER:",
                savedUser
            );

            setUser(savedUser);

        } catch (err) {

            console.error(
                "Unable to read logged-in user:",
                err
            );

            setUser({});

        }

    }, []);


    // =====================================================
    // LOAD ACCOUNTS
    // =====================================================

    useEffect(() => {

        if (!user) {
            return;
        }

        const customerId =
            user.customerId ||
            user.id;

        if (!customerId) {

            setError(
                "Customer ID is missing."
            );

            setLoading(false);

            return;
        }

        loadAccounts(customerId);

    }, [user]);


    // =====================================================
    // FETCH ACCOUNTS
    // =====================================================

    const loadAccounts = async (customerId) => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${API_URL}/customer/${customerId}`
            );

            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.content || response.data?.accounts || [];

            setAccounts(data);
        } catch (err) {
            console.error("Account Service error:", err);
            setError(
                err.response?.data?.message ||
                "Unable to load your accounts."
            );
            setAccounts([]);
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // REFRESH
    // =====================================================

    const handleRefresh = () => {

        const customerId =
            user?.customerId ||
            user?.id;

        if (customerId) {

            loadAccounts(
                customerId
            );

        }

    };


    // =====================================================
    // NEW ACCOUNT
    // =====================================================

    const handleNewAccount = () => {
        setRequestForm({ accountType: "SAVINGS", currency: "INR" });
        setShowRequestModal(true);
    };

    const handleRequestAccount = async (e) => {
        e.preventDefault();

        const id = user?.customerId || user?.id;
        if (!id) {
            setError("Customer ID is missing. Please login again.");
            return;
        }

        try {
            setRequesting(true);
            await axios.post(`${API_URL}/request`, {
                customerId: Number(id),
                accountType: requestForm.accountType,
                currency: requestForm.currency,
                initialDeposit: 0
            });

            setShowRequestModal(false);
            alert("Account request submitted. It is now PENDING admin approval.");
            await loadAccounts(id);
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to submit account request."
            );
        } finally {
            setRequesting(false);
        }
    };


    // =====================================================
    // VIEW ACCOUNT
    // =====================================================

    const viewAccount = (account) => {

        setSelectedAccount(account);

        setShowDetails(true);

    };


    // =====================================================
    // TOTAL BALANCE
    // =====================================================

    const totalBalance =
        accounts.reduce(
            (sum, account) =>
                sum +
                Number(
                    account.balance ||
                    account.currentBalance ||
                    0
                ),
            0
        );


    // =====================================================
    // ACTIVE ACCOUNTS
    // =====================================================

    const activeAccounts =
        accounts.filter(
            (account) =>
                String(
                    account.status ||
                    "ACTIVE"
                ).toUpperCase() ===
                "ACTIVE"
        ).length;


    // =====================================================
    // SAVINGS
    // =====================================================

    const savingsAccounts =
        accounts.filter(
            (account) =>
                String(
                    account.accountType ||
                    ""
                ).toUpperCase() ===
                "SAVINGS"
        ).length;


    // =====================================================
    // CURRENT
    // =====================================================

    const currentAccounts =
        accounts.filter(
            (account) =>
                String(
                    account.accountType ||
                    ""
                ).toUpperCase() ===
                "CURRENT"
        ).length;


    // =====================================================
    // USER INFORMATION
    // =====================================================

    const firstName =
        user?.firstName ||
        "Customer";

    const lastName =
        user?.lastName ||
        "";

    const customerId =
        user?.customerId ||
        user?.id ||
        "-";


    // =====================================================
    // UI
    // =====================================================

    return (

        <CustomerLayout>

            <div className="customer-accounts-page">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="customer-page-header">

                    <div>

                        <span className="customer-eyebrow">
                            FINCORE NEXUS / MY ACCOUNTS
                        </span>

                        <h1>
                            My Accounts
                        </h1>

                        <p>
                            View your bank accounts,
                            balances and account information.
                        </p>

                    </div>


                    {/* =================================================
                        HEADER BUTTONS
                    ================================================= */}

                    <div className="customer-page-actions">

                        <button
                            type="button"
                            className="customer-new-button"
                            onClick={handleNewAccount}
                        >
                            + New Account
                        </button>


                        <button
                            type="button"
                            className="customer-refresh-button"
                            onClick={handleRefresh}
                        >

                            <RefreshCw
                                size={17}
                            />

                            Refresh

                        </button>

                    </div>

                </div>


                {/* =================================================
                    CUSTOMER INFO
                ================================================= */}

                <div className="customer-account-info">

                    <div>

                        <span>
                            CUSTOMER
                        </span>

                        <strong>
                            {firstName} {lastName}
                        </strong>

                    </div>

                    <div>

                        <span>
                            CUSTOMER ID
                        </span>

                        <strong>
                            {customerId}
                        </strong>

                    </div>

                    <div>

                        <span>
                            EMAIL
                        </span>

                        <strong>
                            {user?.email || "-"}
                        </strong>

                    </div>

                </div>


                {/* =================================================
                    SUMMARY
                ================================================= */}

                <div className="customer-account-stats">


                    {/* TOTAL ACCOUNTS */}

                    <div className="customer-account-stat">

                        <div className="customer-account-stat-icon">

                            <WalletCards
                                size={22}
                            />

                        </div>

                        <div>

                            <span>
                                Total Accounts
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : accounts.length}
                            </strong>

                        </div>

                    </div>


                    {/* TOTAL BALANCE */}

                    <div className="customer-account-stat">

                        <div className="customer-account-stat-icon">

                            <WalletCards
                                size={22}
                            />

                        </div>

                        <div>

                            <span>
                                Total Balance
                            </span>

                            <strong>

                                {loading
                                    ? "..."
                                    : `₹${totalBalance.toLocaleString(
                                        "en-IN",
                                        {
                                            minimumFractionDigits: 2,
                                        }
                                    )}`}

                            </strong>

                        </div>

                    </div>


                    {/* ACTIVE ACCOUNTS */}

                    <div className="customer-account-stat">

                        <div className="customer-account-stat-icon">

                            <WalletCards
                                size={22}
                            />

                        </div>

                        <div>

                            <span>
                                Active Accounts
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : activeAccounts}
                            </strong>

                        </div>

                    </div>


                    {/* ACCOUNT TYPES */}

                    <div className="customer-account-stat">

                        <div className="customer-account-stat-icon">

                            <WalletCards
                                size={22}
                            />

                        </div>

                        <div>

                            <span>
                                Account Types
                            </span>

                            <strong>
                                {savingsAccounts} Savings
                            </strong>

                            <small>
                                {currentAccounts} Current
                            </small>

                        </div>

                    </div>


                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="customer-account-error">

                        <strong>
                            Account Service unavailable
                        </strong>

                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={handleRefresh}
                        >
                            Retry
                        </button>

                    </div>

                )}


                {/* =================================================
                    ACCOUNT DIRECTORY
                ================================================= */}

                <div className="customer-accounts-panel">


                    <div className="customer-accounts-panel-header">

                        <div>

                            <span>
                                ACCOUNT DIRECTORY
                            </span>

                            <h2>
                                Your bank accounts
                            </h2>

                        </div>

                        <span>
                            {accounts.length} accounts
                        </span>

                    </div>


                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {loading ? (

                        <div className="customer-account-loading">

                            <div className="customer-loading-spinner"></div>

                            <span>
                                Loading your accounts...
                            </span>

                        </div>

                    ) : accounts.length === 0 ? (

                        /* =================================================
                           EMPTY
                        ================================================= */

                        <div className="customer-account-empty">

                            <WalletCards
                                size={45}
                            />

                            <strong>
                                No accounts found
                            </strong>

                            <span>
                                No bank accounts are currently
                                associated with Customer ID{" "}
                                {customerId}.
                            </span>

                            <button
                                type="button"
                                className="customer-new-button"
                                onClick={handleNewAccount}
                            >
                                + New Account
                            </button>

                        </div>

                    ) : (

                        /* =================================================
                           TABLE
                        ================================================= */

                        <div className="customer-accounts-table-wrapper">

                            <table className="customer-accounts-table">

                                <thead>

                                <tr>

                                    <th>
                                        ACCOUNT NUMBER
                                    </th>

                                    <th>
                                        TYPE
                                    </th>

                                    <th>
                                        BALANCE
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

                                {accounts.map(
                                    (account, index) => {

                                        const id =
                                            account.id ||
                                            account.accountId ||
                                            index;

                                        const status =
                                            String(
                                                account.status ||
                                                "ACTIVE"
                                            ).toUpperCase();

                                        const balance =
                                            Number(
                                                account.balance ||
                                                account.currentBalance ||
                                                0
                                            );


                                        return (

                                            <tr
                                                key={id}
                                            >

                                                {/* ACCOUNT NUMBER */}

                                                <td>

                                                    <strong className="customer-account-number">

                                                        {
                                                            account.accountNumber ||
                                                            `ACC-${id}`
                                                        }

                                                    </strong>

                                                </td>


                                                {/* TYPE */}

                                                <td>

                                                        <span className="customer-account-type">

                                                            {
                                                                account.accountType ||
                                                                "-"
                                                            }

                                                        </span>

                                                </td>


                                                {/* BALANCE */}

                                                <td>

                                                    <strong className="customer-account-balance">

                                                        ₹
                                                        {balance.toLocaleString(
                                                            "en-IN",
                                                            {
                                                                minimumFractionDigits: 2,
                                                            }
                                                        )}

                                                    </strong>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                        <span
                                                            className={`customer-account-status ${
                                                                status === "ACTIVE"
                                                                    ? "active"
                                                                    : "inactive"
                                                            }`}
                                                        >

                                                            <span></span>

                                                            {status}

                                                        </span>

                                                </td>


                                                {/* ACTION */}

                                                <td>

                                                    <button
                                                        type="button"
                                                        className="customer-view-account"
                                                        onClick={() =>
                                                            viewAccount(
                                                                account
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
                                )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>


                {/* =================================================
                    ACCOUNT DETAILS MODAL
                ================================================= */}

                {showDetails &&
                    selectedAccount && (

                        <div className="customer-modal-overlay">

                            <div className="customer-account-modal">


                                {/* MODAL HEADER */}

                                <div className="customer-modal-header">

                                    <div>

                                        <span>
                                            ACCOUNT DETAILS
                                        </span>

                                        <h2>
                                            {
                                                selectedAccount.accountNumber ||
                                                "Bank Account"
                                            }
                                        </h2>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowDetails(
                                                false
                                            )
                                        }
                                    >

                                        <X
                                            size={20}
                                        />

                                    </button>

                                </div>


                                {/* DETAILS */}

                                <div className="customer-account-detail-list">


                                    <div>

                                        <span>
                                            Account ID
                                        </span>

                                        <strong>
                                            {
                                                selectedAccount.id ||
                                                selectedAccount.accountId ||
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Customer ID
                                        </span>

                                        <strong>
                                            {
                                                selectedAccount.customerId ||
                                                customerId
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Account Number
                                        </span>

                                        <strong>
                                            {
                                                selectedAccount.accountNumber ||
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Account Type
                                        </span>

                                        <strong>
                                            {
                                                selectedAccount.accountType ||
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Balance
                                        </span>

                                        <strong>

                                            ₹
                                            {Number(
                                                selectedAccount.balance ||
                                                selectedAccount.currentBalance ||
                                                0
                                            ).toLocaleString(
                                                "en-IN",
                                                {
                                                    minimumFractionDigits: 2,
                                                }
                                            )}

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Status
                                        </span>

                                        <strong>
                                            {
                                                selectedAccount.status ||
                                                "ACTIVE"
                                            }
                                        </strong>

                                    </div>


                                    {selectedAccount.createdAt && (

                                        <div>

                                            <span>
                                                Created At
                                            </span>

                                            <strong>
                                                {new Date(
                                                    selectedAccount.createdAt
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </strong>

                                        </div>

                                    )}

                                </div>


                                {/* MODAL FOOTER */}

                                <div className="customer-modal-footer">

                                    <button
                                        type="button"
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

                        </div>

                    )}

            </div>

            {showRequestModal && (
                <div className="customer-modal-overlay">
                    <div className="customer-account-modal">
                        <div className="customer-modal-header">
                            <div>
                                <span>ACCOUNT REQUEST</span>
                                <h2>Request New Account</h2>
                            </div>
                            <button type="button" onClick={() => setShowRequestModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleRequestAccount}>
                            <div className="customer-account-details">
                                <div>
                                    <label>Account Type</label>
                                    <select
                                        value={requestForm.accountType}
                                        onChange={(e) => setRequestForm({ ...requestForm, accountType: e.target.value })}
                                    >
                                        <option value="SAVINGS">Savings</option>
                                        <option value="CURRENT">Current</option>
                                    </select>
                                </div>
                                <div>
                                    <label>Currency</label>
                                    <select
                                        value={requestForm.currency}
                                        onChange={(e) => setRequestForm({ ...requestForm, currency: e.target.value })}
                                    >
                                        <option value="INR">INR</option>
                                    </select>
                                </div>
                            </div>
                            <div className="customer-modal-footer">
                                <button type="button" onClick={() => setShowRequestModal(false)}>Cancel</button>
                                <button type="submit" disabled={requesting}>
                                    {requesting ? "Submitting..." : "Submit Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </CustomerLayout>

    );

}

export default CustomerAccounts;