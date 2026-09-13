import { useEffect, useState } from "react";
import axios from "axios";
import {
    Plus,
    RefreshCw,
    WalletCards,
    Search,
    X,
    Eye,
    Trash2,
    ArrowDownToLine,
    ArrowUpFromLine,
    Power,
    PowerOff,
    CheckCircle,
    XCircle,
} from "lucide-react";

import BankingLayout from "../components/layout/BankingLayout";
import "./Accounts.css";

const API_URL =
    "http://localhost:8080/api/accounts";

const TRANSACTION_API_URL =
    "http://localhost:8080/api/transactions";

const CUSTOMER_API_URL =
    "http://localhost:8080/api/customers";

const EMPTY_FORM = {
    customerId: "",
    accountType: "SAVINGS",
    initialDeposit: "",
};

function Accounts() {

    const [accounts, setAccounts] = useState([]);
    const [filteredAccounts, setFilteredAccounts] =
        useState([]);

    const [customers, setCustomers] =
        useState({});

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [showModal, setShowModal] =
        useState(false);

    const [showDetails, setShowDetails] =
        useState(false);

    const [selectedAccount, setSelectedAccount] =
        useState(null);

    const [form, setForm] =
        useState(EMPTY_FORM);


    // =====================================================
    // FETCH CUSTOMERS
    // =====================================================

    const fetchCustomers = async () => {

        try {

            const response =
                await axios.get(
                    CUSTOMER_API_URL
                );

            const data =
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.content ||
                    response.data?.customers ||
                    [];

            const customerMap = {};

            data.forEach((customer) => {

                if (
                    customer.id !== undefined &&
                    customer.id !== null
                ) {

                    customerMap[
                        String(customer.id)
                        ] = customer;
                }

            });

            setCustomers(customerMap);

        } catch (err) {

            console.error(
                "Customer service error:",
                err
            );

            setCustomers({});
        }
    };


    // =====================================================
    // FETCH ACCOUNTS
    // =====================================================

    const fetchAccounts = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await axios.get(
                    API_URL
                );

            const data =
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.content ||
                    response.data?.accounts ||
                    [];

            setAccounts(data);

        } catch (err) {

            console.error(
                "Account service error:",
                err
            );

            setError(
                "Account Service could not be reached. Make sure Account Service and API Gateway are running."
            );

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        fetchAccounts();
        fetchCustomers();

    }, []);


    // =====================================================
    // GET CUSTOMER NAME
    // =====================================================

    const getCustomerName = (
        customerId
    ) => {

        if (
            customerId === null ||
            customerId === undefined ||
            customerId === ""
        ) {

            return "-";
        }

        const customer =
            customers[String(customerId)];

        if (!customer) {

            return `Customer #${customerId}`;
        }

        const firstName =
            customer.firstName || "";

        const lastName =
            customer.lastName || "";

        const fullName =
            `${firstName} ${lastName}`.trim();

        return (
            fullName ||
            `Customer #${customerId}`
        );
    };


    // =====================================================
    // FILTER / SEARCH
    // =====================================================

    useEffect(() => {

        const keyword =
            search.toLowerCase().trim();

        if (!keyword) {

            setFilteredAccounts(accounts);
            return;
        }

        const result =
            accounts.filter((account) => {

                const customerName =
                    getCustomerName(
                        account.customerId
                    );

                return [
                    account.accountNumber,
                    account.accountType,
                    account.status,
                    account.customerId,
                    account.balance,
                    account.currentBalance,
                    customerName,
                ]
                    .filter(
                        (value) =>
                            value !== null &&
                            value !== undefined
                    )
                    .some((value) =>
                        String(value)
                            .toLowerCase()
                            .includes(keyword)
                    );
            });

        setFilteredAccounts(result);

    }, [
        accounts,
        search,
        customers,
    ]);


    // =====================================================
    // CREATE ACCOUNT MODAL
    // =====================================================

    const openCreateModal = () => {

        setSelectedAccount(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };


    const closeModal = () => {

        setShowModal(false);
        setSelectedAccount(null);
        setForm(EMPTY_FORM);
    };


    const handleChange = (e) => {

        const {
            name,
            value,
        } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    // =====================================================
    // CREATE ACCOUNT
    // =====================================================

    const createAccount = async (e) => {

        e.preventDefault();

        try {

            const payload = {

                customerId:
                    Number(form.customerId),

                accountType:
                form.accountType,

                initialDeposit:
                    Number(
                        form.initialDeposit || 0
                    ),
            };

            await axios.post(
                API_URL,
                payload
            );

            alert(
                "Account created successfully."
            );

            closeModal();

            await fetchAccounts();
            await fetchCustomers();

        } catch (err) {

            console.error(
                "Create account error:",
                err
            );

            alert(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to create account."
            );
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
    // DELETE ACCOUNT
    // =====================================================

    const deleteAccount = async (
        account
    ) => {

        const id =
            account.id ||
            account.accountId;

        if (!id) {

            alert(
                "Account ID not found."
            );

            return;
        }

        const confirmed =
            window.confirm(
                `Delete account ${
                    account.accountNumber || id
                }?`
            );

        if (!confirmed) return;

        try {

            await axios.delete(
                `${API_URL}/${id}`
            );

            alert(
                "Account deleted successfully."
            );

            await fetchAccounts();

        } catch (err) {

            console.error(
                "Delete account error:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Unable to delete account."
            );
        }
    };


    // =====================================================
    // DEPOSIT
    // =====================================================

    const deposit = async (
        account
    ) => {

        const id =
            account.id ||
            account.accountId;

        if (!id) {

            alert(
                "Account ID not found."
            );

            return;
        }

        const amount =
            window.prompt(
                "Enter deposit amount:"
            );

        if (!amount) return;

        const value =
            Number(amount);

        if (
            !Number.isFinite(value) ||
            value <= 0
        ) {

            alert(
                "Enter a valid amount."
            );

            return;
        }

        try {

            /*
             * IMPORTANT
             *
             * Do NOT directly call:
             *
             * PUT /accounts/{id}/deposit
             *
             * here.
             *
             * Transaction Service itself calls
             * Account Service and updates the balance.
             *
             * It also stores `value` as the
             * transaction amount.
             */

            await axios.post(
                TRANSACTION_API_URL,
                {
                    customerId:
                        Number(
                            account.customerId
                        ),

                    accountId:
                        Number(id),

                    amount:
                    value,

                    transactionType:
                        "DEPOSIT",

                    description:
                        "Cash deposit",
                }
            );

            alert(
                "Deposit successful."
            );

            await fetchAccounts();

        } catch (err) {

            console.error(
                "Deposit error:",
                err
            );

            alert(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Unable to deposit amount."
            );
        }
    };


    // =====================================================
    // WITHDRAW
    // =====================================================

    const withdraw = async (
        account
    ) => {

        const id =
            account.id ||
            account.accountId;

        if (!id) {

            alert(
                "Account ID not found."
            );

            return;
        }

        const amount =
            window.prompt(
                "Enter withdrawal amount:"
            );

        if (!amount) return;

        const value =
            Number(amount);

        if (
            !Number.isFinite(value) ||
            value <= 0
        ) {

            alert(
                "Enter a valid amount."
            );

            return;
        }

        try {

            /*
             * Transaction Service will:
             *
             * 1. Withdraw the amount
             *    from the account.
             *
             * 2. Save `value` as the
             *    transaction amount.
             */

            await axios.post(
                TRANSACTION_API_URL,
                {
                    customerId:
                        Number(
                            account.customerId
                        ),

                    accountId:
                        Number(id),

                    amount:
                    value,

                    transactionType:
                        "WITHDRAWAL",

                    description:
                        "Cash withdrawal",
                }
            );

            alert(
                "Withdrawal successful."
            );

            await fetchAccounts();

        } catch (err) {

            console.error(
                "Withdraw error:",
                err
            );

            alert(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Unable to withdraw amount."
            );
        }
    };


    // =====================================================
    // ACTIVATE
    // =====================================================

    const activateAccount = async (
        account
    ) => {

        const id =
            account.id ||
            account.accountId;

        if (!id) {

            alert(
                "Account ID not found."
            );

            return;
        }

        try {

            await axios.put(
                `${API_URL}/${id}/activate`
            );

            alert(
                "Account activated."
            );

            await fetchAccounts();

        } catch (err) {

            console.error(
                "Activate error:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Unable to activate account."
            );
        }
    };


    // =====================================================
    // APPROVE
    // =====================================================

    const approveAccount = async (
        account
    ) => {

        const id =
            account.id ||
            account.accountId;

        if (!id) {

            return alert(
                "Account ID not found."
            );
        }

        if (
            !window.confirm(
                "Approve this account request?"
            )
        ) {

            return;
        }

        try {

            await axios.put(
                `${API_URL}/${id}/approve`
            );

            alert(
                "Account approved successfully."
            );

            await fetchAccounts();

        } catch (err) {

            console.error(
                "Approve account error:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Unable to approve account."
            );
        }
    };


    // =====================================================
    // REJECT
    // =====================================================

    const rejectAccount = async (
        account
    ) => {

        const id =
            account.id ||
            account.accountId;

        if (!id) {

            return alert(
                "Account ID not found."
            );
        }

        if (
            !window.confirm(
                "Reject this account request?"
            )
        ) {

            return;
        }

        try {

            await axios.put(
                `${API_URL}/${id}/reject`
            );

            alert(
                "Account rejected."
            );

            await fetchAccounts();

        } catch (err) {

            console.error(
                "Reject account error:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Unable to reject account."
            );
        }
    };


    // =====================================================
    // DEACTIVATE
    // =====================================================

    const deactivateAccount = async (
        account
    ) => {

        const id =
            account.id ||
            account.accountId;

        if (!id) {

            alert(
                "Account ID not found."
            );

            return;
        }

        try {

            await axios.put(
                `${API_URL}/${id}/deactivate`
            );

            alert(
                "Account deactivated."
            );

            await fetchAccounts();

        } catch (err) {

            console.error(
                "Deactivate error:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Unable to deactivate account."
            );
        }
    };


    // =====================================================
    // STATISTICS
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


    const savingsCount =
        accounts.filter(
            (account) =>
                String(
                    account.accountType || ""
                ).toUpperCase() ===
                "SAVINGS"
        ).length;


    const currentCount =
        accounts.filter(
            (account) =>
                String(
                    account.accountType || ""
                ).toUpperCase() ===
                "CURRENT"
        ).length;


    // =====================================================
    // JSX
    // =====================================================

    return (

        <BankingLayout>

            <div className="accounts-page">

                {/* HEADER */}

                <div className="accounts-header">

                    <div>

                        <span className="accounts-eyebrow">
                            FINCORE NEXUS / ACCOUNT SERVICE
                        </span>

                        <h1>
                            Accounts
                        </h1>

                        <p>
                            Manage customer accounts,
                            balances and banking
                            information from one place.
                        </p>

                    </div>


                    <div className="accounts-actions">

                        <button
                            className="refresh-button"
                            onClick={() => {
                                fetchAccounts();
                                fetchCustomers();
                            }}
                        >

                            <RefreshCw size={17} />

                            Refresh

                        </button>


                        <button
                            className="add-account-button"
                            onClick={
                                openCreateModal
                            }
                        >

                            <Plus size={18} />

                            Open Account

                        </button>

                    </div>

                </div>


                {/* SERVICE */}

                <div className="account-service-banner">

                    <div className="service-banner-left">

                        <span className="service-live-dot"></span>

                        <div>

                            <strong>
                                Account Service
                            </strong>

                            <span>
                                Connected through API
                                Gateway · Port 8080
                            </span>

                        </div>

                    </div>


                    <div className="service-live">

                        <span></span>

                        OPERATIONAL

                    </div>

                </div>


                {/* STATS */}

                <div className="account-stats">

                    <div className="account-stat-card">

                        <div className="account-stat-icon purple">

                            <WalletCards
                                size={22}
                            />

                        </div>

                        <div>

                            <span>
                                Total Accounts
                            </span>

                            <strong>
                                {accounts.length}
                            </strong>

                        </div>

                    </div>


                    <div className="account-stat-card">

                        <div className="account-stat-icon blue">

                            <WalletCards
                                size={22}
                            />

                        </div>

                        <div>

                            <span>
                                Total Balance
                            </span>

                            <strong>

                                ₹
                                {totalBalance.toLocaleString(
                                    "en-IN",
                                    {
                                        minimumFractionDigits: 2,
                                    }
                                )}

                            </strong>

                        </div>

                    </div>


                    <div className="account-stat-card">

                        <div className="account-stat-icon green">

                            <WalletCards
                                size={22}
                            />

                        </div>

                        <div>

                            <span>
                                Savings Accounts
                            </span>

                            <strong>
                                {savingsCount}
                            </strong>

                        </div>

                    </div>


                    <div className="account-stat-card">

                        <div className="account-stat-icon orange">

                            <WalletCards
                                size={22}
                            />

                        </div>

                        <div>

                            <span>
                                Current Accounts
                            </span>

                            <strong>
                                {currentCount}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* ACCOUNT DIRECTORY */}

                <div className="accounts-panel">

                    <div className="accounts-panel-header">

                        <div>

                            <span className="panel-label">
                                ACCOUNT DIRECTORY
                            </span>

                            <h2>
                                All bank accounts
                            </h2>

                        </div>


                        <span className="account-count">

                            {filteredAccounts.length}{" "}
                            accounts displayed

                        </span>

                    </div>


                    {/* SEARCH */}

                    <div className="account-toolbar">

                        <div className="account-search">

                            <Search size={18} />

                            <input
                                placeholder="Search account number, customer name, type or status..."
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

                        <div className="account-error">

                            <div>

                                <strong>
                                    Account Service
                                    unavailable
                                </strong>

                                <span>
                                    {error}
                                </span>

                            </div>

                            <button
                                onClick={
                                    fetchAccounts
                                }
                            >
                                Retry
                            </button>

                        </div>

                    )}


                    {/* LOADING */}

                    {loading ? (

                        <div className="account-loading">

                            <div className="loading-spinner"></div>

                            <span>
                                Loading accounts...
                            </span>

                        </div>

                    ) : (

                        <div className="accounts-table-wrapper">

                            <table className="accounts-table">

                                <thead>

                                <tr>

                                    <th>
                                        ACCOUNT NUMBER
                                    </th>

                                    <th>
                                        CUSTOMER NAME
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
                                        ACTIONS
                                    </th>

                                </tr>

                                </thead>


                                <tbody>

                                {filteredAccounts.length ===
                                0 ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="empty-accounts"
                                        >

                                            <WalletCards
                                                size={40}
                                            />

                                            <strong>
                                                No accounts
                                                found
                                            </strong>

                                            <span>
                                                Accounts
                                                created
                                                through the
                                                Account
                                                Service
                                                will
                                                appear
                                                here.
                                            </span>

                                            <button
                                                onClick={
                                                    openCreateModal
                                                }
                                            >

                                                <Plus
                                                    size={16}
                                                />

                                                Open
                                                Account

                                            </button>

                                        </td>

                                    </tr>

                                ) : (

                                    filteredAccounts.map(
                                        (account) => {

                                            const id =
                                                account.id ||
                                                account.accountId;

                                            const status =
                                                String(
                                                    account.status ||
                                                    "ACTIVE"
                                                ).toUpperCase();

                                            const customerName =
                                                getCustomerName(
                                                    account.customerId
                                                );


                                            return (

                                                <tr
                                                    key={id}
                                                >

                                                    {/* ACCOUNT NUMBER */}

                                                    <td>

                                                        <strong className="account-number">

                                                            {account.accountNumber ||
                                                                `ACC-${id}`}

                                                        </strong>

                                                    </td>


                                                    {/* CUSTOMER NAME */}

                                                    <td>

                                                        <strong>
                                                            {
                                                                customerName
                                                            }
                                                        </strong>

                                                    </td>


                                                    {/* TYPE */}

                                                    <td>

                                                        <span className="account-type">

                                                            {account.accountType ||
                                                                "-"}

                                                        </span>

                                                    </td>


                                                    {/* BALANCE */}

                                                    <td>

                                                        <strong className="account-balance">

                                                            ₹
                                                            {Number(
                                                                account.balance ||
                                                                account.currentBalance ||
                                                                0
                                                            ).toLocaleString(
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
                                                            className={`account-status ${status.toLowerCase()}`}
                                                        >

                                                            <span></span>

                                                            {
                                                                status
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* ACTIONS */}

                                                    <td>

                                                        <div className="account-action-buttons">

                                                            {/* VIEW */}

                                                            <button
                                                                title="View"
                                                                onClick={() =>
                                                                    viewAccount(
                                                                        account
                                                                    )
                                                                }
                                                            >

                                                                <Eye
                                                                    size={16}
                                                                />

                                                            </button>


                                                            {status ===
                                                            "PENDING" ? (

                                                                <>

                                                                    {/* APPROVE */}

                                                                    <button
                                                                        title="Approve"
                                                                        className="approve-action"
                                                                        onClick={() =>
                                                                            approveAccount(
                                                                                account
                                                                            )
                                                                        }
                                                                    >

                                                                        <CheckCircle
                                                                            size={16}
                                                                        />

                                                                    </button>


                                                                    {/* REJECT */}

                                                                    <button
                                                                        title="Reject"
                                                                        className="reject-action"
                                                                        onClick={() =>
                                                                            rejectAccount(
                                                                                account
                                                                            )
                                                                        }
                                                                    >

                                                                        <XCircle
                                                                            size={16}
                                                                        />

                                                                    </button>

                                                                </>

                                                            ) : (

                                                                <>

                                                                    {/* DEPOSIT */}

                                                                    <button
                                                                        title="Deposit"
                                                                        onClick={() =>
                                                                            deposit(
                                                                                account
                                                                            )
                                                                        }
                                                                    >

                                                                        <ArrowDownToLine
                                                                            size={16}
                                                                        />

                                                                    </button>


                                                                    {/* WITHDRAW */}

                                                                    <button
                                                                        title="Withdraw"
                                                                        onClick={() =>
                                                                            withdraw(
                                                                                account
                                                                            )
                                                                        }
                                                                    >

                                                                        <ArrowUpFromLine
                                                                            size={16}
                                                                        />

                                                                    </button>


                                                                    {/* ACTIVATE / DEACTIVATE */}

                                                                    {status ===
                                                                    "ACTIVE" ? (

                                                                        <button
                                                                            title="Deactivate"
                                                                            onClick={() =>
                                                                                deactivateAccount(
                                                                                    account
                                                                                )
                                                                            }
                                                                        >

                                                                            <PowerOff
                                                                                size={16}
                                                                            />

                                                                        </button>

                                                                    ) : (

                                                                        <button
                                                                            title="Activate"
                                                                            onClick={() =>
                                                                                activateAccount(
                                                                                    account
                                                                                )
                                                                            }
                                                                        >

                                                                            <Power
                                                                                size={16}
                                                                            />

                                                                        </button>

                                                                    )}

                                                                </>

                                                            )}


                                                            {/* DELETE */}

                                                            <button
                                                                className="delete-action"
                                                                title="Delete"
                                                                onClick={() =>
                                                                    deleteAccount(
                                                                        account
                                                                    )
                                                                }
                                                            >

                                                                <Trash2
                                                                    size={16}
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


                {/* =====================================================
                    CREATE ACCOUNT MODAL
                ===================================================== */}

                {showModal && (

                    <div className="modal-overlay">

                        <div className="account-modal">

                            <div className="modal-header">

                                <div>

                                    <span>
                                        ACCOUNT SERVICE
                                    </span>

                                    <h2>
                                        Open New Account
                                    </h2>

                                    <p>
                                        Create a new bank
                                        account for an
                                        existing customer.
                                    </p>

                                </div>


                                <button
                                    onClick={
                                        closeModal
                                    }
                                    className="modal-close"
                                >

                                    <X size={20} />

                                </button>

                            </div>


                            <form
                                onSubmit={
                                    createAccount
                                }
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
                                        Account Type
                                    </label>

                                    <select
                                        name="accountType"
                                        value={
                                            form.accountType
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="SAVINGS">
                                            SAVINGS
                                        </option>

                                        <option value="CURRENT">
                                            CURRENT
                                        </option>

                                    </select>

                                </div>


                                <div className="form-group">

                                    <label>
                                        Initial Deposit
                                    </label>

                                    <input
                                        name="initialDeposit"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            form.initialDeposit
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="1000"
                                        required
                                    />

                                </div>


                                <div className="form-actions">

                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={
                                            closeModal
                                        }
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        className="primary-button"
                                    >

                                        <Plus
                                            size={17}
                                        />

                                        Create Account

                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}


                {/* =====================================================
                    ACCOUNT DETAILS
                ===================================================== */}

                {showDetails &&
                    selectedAccount && (

                        <div className="modal-overlay">

                            <div className="account-modal details-modal">

                                <div className="modal-header">

                                    <div>

                                    <span>
                                        ACCOUNT DETAILS
                                    </span>

                                        <h2>

                                            {selectedAccount.accountNumber ||
                                                "Bank Account"}

                                        </h2>

                                    </div>


                                    <button
                                        className="modal-close"
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


                                <div className="account-detail-list">

                                    <p>

                                        <strong>
                                            Account ID:
                                        </strong>

                                        <span>

                                        {selectedAccount.id ||
                                            selectedAccount.accountId}

                                    </span>

                                    </p>


                                    <p>

                                        <strong>
                                            Customer Name:
                                        </strong>

                                        <span>

                                        {getCustomerName(
                                            selectedAccount.customerId
                                        )}

                                    </span>

                                    </p>


                                    <p>

                                        <strong>
                                            Customer ID:
                                        </strong>

                                        <span>

                                        {
                                            selectedAccount.customerId
                                        }

                                    </span>

                                    </p>


                                    <p>

                                        <strong>
                                            Account Type:
                                        </strong>

                                        <span>

                                        {
                                            selectedAccount.accountType
                                        }

                                    </span>

                                    </p>


                                    <p>

                                        <strong>
                                            Balance:
                                        </strong>

                                        <span>

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

                                    </span>

                                    </p>


                                    <p>

                                        <strong>
                                            Status:
                                        </strong>

                                        <span>

                                        {selectedAccount.status ||
                                            "ACTIVE"}

                                    </span>

                                    </p>

                                </div>


                                <div className="details-footer">

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

                        </div>

                    )}

            </div>

        </BankingLayout>
    );
}

export default Accounts;