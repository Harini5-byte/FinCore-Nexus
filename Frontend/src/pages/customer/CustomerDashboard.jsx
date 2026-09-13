
import { useEffect, useState } from "react";
import axios from "axios";

import {
    WalletCards,
    ArrowLeftRight,
    HandCoins,
    CreditCard,
    UserCircle,
    RefreshCw,
} from "lucide-react";

import CustomerLayout from "../../components/layout/CustomerLayout";

import "./CustomerDashboard.css";

const ACCOUNTS_API =
    "http://localhost:8080/api/accounts";

const LOANS_API =
    "http://localhost:8080/api/loans";

const TRANSACTIONS_API =
    "http://localhost:8080/api/transactions";

const PAYMENTS_API =
    "http://localhost:8080/api/payments";


function CustomerDashboard() {

    // =====================================================
    // LOGGED-IN CUSTOMER
    // =====================================================

    const [user, setUser] = useState(null);

    const [accounts, setAccounts] = useState([]);
    const [loans, setLoans] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [payments, setPayments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =====================================================
    // GET USER FROM LOCAL STORAGE
    // =====================================================

    useEffect(() => {

        const savedUser =
            JSON.parse(
                localStorage.getItem("user") ||
                localStorage.getItem("fincore_user") ||
                "{}"
            );

        console.log(
            "CUSTOMER DASHBOARD USER:",
            savedUser
        );

        setUser(savedUser);

    }, []);


    // =====================================================
    // LOAD CUSTOMER DATA
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
                "Customer ID is missing from the logged-in user."
            );

            setLoading(false);

            return;
        }

        console.log(
            "Loading dashboard for Customer ID:",
            customerId
        );

        loadCustomerData(customerId);

    }, [user]);


    // =====================================================
    // LOAD ALL CUSTOMER DATA
    // =====================================================

    const loadCustomerData = async (customerId) => {

        try {

            setLoading(true);
            setError("");


            // =================================================
            // ACCOUNTS
            // =================================================

            try {

                const response =
                    await axios.get(
                        `${ACCOUNTS_API}/customer/${customerId}`
                    );

                const data =
                    Array.isArray(response.data)
                        ? response.data
                        : response.data?.content ||
                          response.data?.accounts ||
                          [];

                setAccounts(data);

                console.log(
                    "CUSTOMER ACCOUNTS:",
                    data
                );

            } catch (err) {

                console.warn(
                    "Customer account endpoint failed. Trying all accounts...",
                    err
                );

                /*
                 * FALLBACK
                 *
                 * If your Account Service currently has only
                 * GET /api/accounts, get all accounts and filter
                 * them here using customerId.
                 */

                try {

                    const response =
                        await axios.get(
                            ACCOUNTS_API
                        );

                    const data =
                        Array.isArray(response.data)
                            ? response.data
                            : response.data?.content ||
                              response.data?.accounts ||
                              [];

                    const customerAccounts =
                        data.filter(
                            (account) =>
                                String(
                                    account.customerId
                                ) ===
                                String(customerId)
                        );

                    setAccounts(
                        customerAccounts
                    );

                    console.log(
                        "FILTERED CUSTOMER ACCOUNTS:",
                        customerAccounts
                    );

                } catch (fallbackError) {

                    console.error(
                        "Unable to load accounts:",
                        fallbackError
                    );

                    setAccounts([]);

                }

            }


            // =================================================
            // LOANS
            // =================================================

            try {

                const response =
                    await axios.get(
                        LOANS_API
                    );

                const data =
                    Array.isArray(response.data)
                        ? response.data
                        : response.data?.content ||
                          response.data?.loans ||
                          [];

                const customerLoans =
                    data.filter(
                        (loan) =>
                            String(
                                loan.customerId
                            ) ===
                            String(customerId)
                    );

                setLoans(
                    customerLoans
                );

                console.log(
                    "CUSTOMER LOANS:",
                    customerLoans
                );

            } catch (err) {

                console.error(
                    "Loan Service error:",
                    err
                );

                setLoans([]);

            }


            // =================================================
            // TRANSACTIONS
            // =================================================

            try {

                const response =
                    await axios.get(
                        TRANSACTIONS_API
                    );

                const data =
                    Array.isArray(response.data)
                        ? response.data
                        : response.data?.content ||
                          response.data?.transactions ||
                          [];

                const customerTransactions =
                    data.filter(
                        (transaction) =>
                            String(
                                transaction.customerId
                            ) ===
                            String(customerId)
                    );

                setTransactions(
                    customerTransactions
                );

                console.log(
                    "CUSTOMER TRANSACTIONS:",
                    customerTransactions
                );

            } catch (err) {

                console.error(
                    "Transaction Service error:",
                    err
                );

                setTransactions([]);

            }


            // =================================================
            // PAYMENTS
            // =================================================

            try {

                const response =
                    await axios.get(
                        PAYMENTS_API
                    );

                const data =
                    Array.isArray(response.data)
                        ? response.data
                        : response.data?.content ||
                          response.data?.payments ||
                          [];

                const customerPayments =
                    data.filter(
                        (payment) =>
                            String(
                                payment.customerId
                            ) ===
                            String(customerId)
                    );

                setPayments(
                    customerPayments
                );

                console.log(
                    "CUSTOMER PAYMENTS:",
                    customerPayments
                );

            } catch (err) {

                console.error(
                    "Payment Service error:",
                    err
                );

                setPayments([]);

            }

        } catch (err) {

            console.error(
                "Customer dashboard error:",
                err
            );

            setError(
                "Unable to load customer dashboard data."
            );

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

            loadCustomerData(
                customerId
            );

        }

    };


    // =====================================================
    // CUSTOMER INFORMATION
    // =====================================================

    const firstName =
        user?.firstName ||
        "Customer";

    const lastName =
        user?.lastName ||
        "";

    const customerNumber =
        user?.customerNumber ||
        user?.customerId ||
        user?.id ||
        "-";


    // =====================================================
    // ACCOUNT CALCULATIONS
    // =====================================================

    const totalBalance =
        accounts.reduce(
            (total, account) =>
                total +
                Number(
                    account.balance ||
                    account.currentBalance ||
                    0
                ),
            0
        );


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
    // LOAN CALCULATIONS
    // =====================================================

    const activeLoans =
        loans.filter(
            (loan) => {

                const status =
                    String(
                        loan.status ||
                        loan.loanStatus ||
                        ""
                    ).toUpperCase();

                return (
                    status === "APPROVED" ||
                    status === "ACTIVE"
                );

            }
        ).length;


    // =====================================================
    // PAYMENT CALCULATIONS
    // =====================================================

    const successfulPayments =
        payments.filter(
            (payment) => {

                const status =
                    String(
                        payment.status ||
                        payment.paymentStatus ||
                        ""
                    ).toUpperCase();

                return (
                    status === "COMPLETED" ||
                    status === "SUCCESS" ||
                    status === "SUCCESSFUL"
                );

            }
        ).length;


    // =====================================================
    // LOADING
    // =====================================================

    if (!user) {

        return (
            <CustomerLayout>

                <div
                    style={{
                        padding: "35px",
                    }}
                >

                    <h2>
                        Loading customer...
                    </h2>

                </div>

            </CustomerLayout>
        );

    }


    // =====================================================
    // UI
    // =====================================================

    return (

        <CustomerLayout>

            <div
                style={{
                    padding: "35px",
                }}
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "30px",
                    }}
                >

                    <div>

                        <span
                            style={{
                                color: "#4f46e5",
                                fontSize: "12px",
                                fontWeight: "800",
                                letterSpacing: "1px",
                            }}
                        >
                            FINCORE NEXUS
                        </span>

                        <h1
                            style={{
                                marginTop: "8px",
                                marginBottom: "8px",
                            }}
                        >
                            Welcome,
                            {" "}
                            {firstName}
                            {" "}
                            {lastName}
                        </h1>

                        <p
                            style={{
                                color: "#667085",
                                margin: 0,
                            }}
                        >
                            Manage your accounts and
                            banking activities from one place.
                        </p>

                    </div>


                    <button
                        onClick={handleRefresh}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 16px",
                            border: "1px solid #e4e7ec",
                            borderRadius: "10px",
                            background: "#ffffff",
                            cursor: "pointer",
                            fontWeight: "600",
                        }}
                    >

                        <RefreshCw size={17} />

                        Refresh

                    </button>

                </div>


                {/* =================================================
                    CUSTOMER INFORMATION
                ================================================= */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                        padding: "20px",
                        marginBottom: "25px",
                        background: "#f8f9ff",
                        border: "1px solid #e8eaff",
                        borderRadius: "14px",
                    }}
                >

                    <UserCircle
                        size={42}
                        color="#4f46e5"
                    />

                    <div>

                        <strong
                            style={{
                                display: "block",
                                fontSize: "16px",
                            }}
                        >
                            {firstName} {lastName}
                        </strong>

                        <span
                            style={{
                                display: "block",
                                marginTop: "4px",
                                color: "#667085",
                                fontSize: "13px",
                            }}
                        >
                            Customer ID:{" "}
                            <strong>
                                {customerNumber}
                            </strong>
                        </span>

                        <span
                            style={{
                                display: "block",
                                marginTop: "3px",
                                color: "#667085",
                                fontSize: "13px",
                            }}
                        >
                            {user?.email}
                        </span>

                    </div>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div
                        style={{
                            padding: "15px",
                            marginBottom: "20px",
                            background: "#fff4f4",
                            border: "1px solid #f5c2c2",
                            borderRadius: "10px",
                            color: "#b42318",
                        }}
                    >
                        {error}
                    </div>

                )}


                {/* =================================================
                    SUMMARY CARDS
                ================================================= */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(4, 1fr)",
                        gap: "20px",
                        marginBottom: "30px",
                    }}
                >

                    {/* ACCOUNTS */}

                    <div className="account-stat-card">

                        <WalletCards
                            size={22}
                        />

                        <div>

                            <span>
                                My Accounts
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : accounts.length}
                            </strong>

                            <small>
                                {activeAccounts}
                                {" "}
                                active
                            </small>

                        </div>

                    </div>


                    {/* BALANCE */}

                    <div className="account-stat-card">

                        <WalletCards
                            size={22}
                        />

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

                            <small>
                                Across all accounts
                            </small>

                        </div>

                    </div>


                    {/* TRANSACTIONS */}

                    <div className="account-stat-card">

                        <ArrowLeftRight
                            size={22}
                        />

                        <div>

                            <span>
                                Transactions
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : transactions.length}
                            </strong>

                            <small>
                                Recorded transactions
                            </small>

                        </div>

                    </div>


                    {/* LOANS */}

                    <div className="account-stat-card">

                        <HandCoins
                            size={22}
                        />

                        <div>

                            <span>
                                Active Loans
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : activeLoans}
                            </strong>

                            <small>
                                Loan applications
                            </small>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    QUICK ACCESS
                ================================================= */}

                <h2
                    style={{
                        marginBottom: "18px",
                    }}
                >
                    Banking Services
                </h2>


                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(4, 1fr)",
                        gap: "20px",
                    }}
                >

                    {/* ACCOUNTS */}

                    <div
                        className="account-stat-card"
                        style={{
                            cursor: "pointer",
                        }}
                    >

                        <WalletCards
                            size={24}
                        />

                        <div>

                            <span>
                                My Accounts
                            </span>

                            <strong>
                                View Accounts
                            </strong>

                        </div>

                    </div>


                    {/* TRANSACTIONS */}

                    <div
                        className="account-stat-card"
                        style={{
                            cursor: "pointer",
                        }}
                    >

                        <ArrowLeftRight
                            size={24}
                        />

                        <div>

                            <span>
                                Transactions
                            </span>

                            <strong>
                                View History
                            </strong>

                        </div>

                    </div>


                    {/* LOANS */}

                    <div
                        className="account-stat-card"
                        style={{
                            cursor: "pointer",
                        }}
                    >

                        <HandCoins
                            size={24}
                        />

                        <div>

                            <span>
                                Loans
                            </span>

                            <strong>
                                {activeLoans}
                                {" "}
                                Active
                            </strong>

                        </div>

                    </div>


                    {/* PAYMENTS */}

                    <div
                        className="account-stat-card"
                        style={{
                            cursor: "pointer",
                        }}
                    >

                        <CreditCard
                            size={24}
                        />

                        <div>

                            <span>
                                Payments
                            </span>

                            <strong>
                                {successfulPayments}
                                {" "}
                                Successful
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    RECENT ACCOUNTS
                ================================================= */}

                <div
                    style={{
                        marginTop: "35px",
                        background: "#ffffff",
                        border: "1px solid #eaecf0",
                        borderRadius: "14px",
                        overflow: "hidden",
                    }}
                >

                    <div
                        style={{
                            padding: "20px",
                            borderBottom:
                                "1px solid #eaecf0",
                        }}
                    >

                        <h2
                            style={{
                                margin: 0,
                            }}
                        >
                            My Accounts
                        </h2>

                        <p
                            style={{
                                margin: "5px 0 0",
                                color: "#667085",
                            }}
                        >
                            Your bank accounts and current balances.
                        </p>

                    </div>


                    {loading ? (

                        <div
                            style={{
                                padding: "30px",
                                textAlign: "center",
                                color: "#667085",
                            }}
                        >
                            Loading accounts...
                        </div>

                    ) : accounts.length === 0 ? (

                        <div
                            style={{
                                padding: "30px",
                                textAlign: "center",
                                color: "#667085",
                            }}
                        >
                            No bank accounts found for
                            Customer ID {customerNumber}.
                        </div>

                    ) : (

                        <div
                            style={{
                                overflowX: "auto",
                            }}
                        >

                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse:
                                        "collapse",
                                }}
                            >

                                <thead>

                                    <tr>

                                        <th
                                            style={{
                                                textAlign: "left",
                                                padding: "15px 20px",
                                            }}
                                        >
                                            Account Number
                                        </th>

                                        <th
                                            style={{
                                                textAlign: "left",
                                                padding: "15px 20px",
                                            }}
                                        >
                                            Type
                                        </th>

                                        <th
                                            style={{
                                                textAlign: "left",
                                                padding: "15px 20px",
                                            }}
                                        >
                                            Balance
                                        </th>

                                        <th
                                            style={{
                                                textAlign: "left",
                                                padding: "15px 20px",
                                            }}
                                        >
                                            Status
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {accounts.map(
                                        (account) => {

                                            const id =
                                                account.id ||
                                                account.accountId;

                                            const status =
                                                String(
                                                    account.status ||
                                                    "ACTIVE"
                                                ).toUpperCase();

                                            return (

                                                <tr
                                                    key={id}
                                                >

                                                    <td
                                                        style={{
                                                            padding: "15px 20px",
                                                        }}
                                                    >
                                                        <strong>
                                                            {
                                                                account.accountNumber ||
                                                                `ACC-${id}`
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td
                                                        style={{
                                                            padding: "15px 20px",
                                                        }}
                                                    >
                                                        {
                                                            account.accountType ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td
                                                        style={{
                                                            padding: "15px 20px",
                                                        }}
                                                    >
                                                        <strong>
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

                                                    <td
                                                        style={{
                                                            padding: "15px 20px",
                                                        }}
                                                    >
                                                        <span>
                                                            {status}
                                                        </span>
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

            </div>

        </CustomerLayout>
    );
}

export default CustomerDashboard;
