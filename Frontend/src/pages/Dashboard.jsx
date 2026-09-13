import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
    Users,
    WalletCards,
    ArrowLeftRight,
    HandCoins,
    CreditCard,
    TrendingUp,
    TrendingDown,
    MoreHorizontal,
    ArrowUpRight,
    ArrowDownLeft,
    Activity,
    CheckCircle2,
    XCircle,
} from "lucide-react";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import { Link } from "react-router-dom";
import BankingLayout from "../components/layout/BankingLayout";
import "./Dashboard.css";

const API = "http://localhost:8080";

function Dashboard() {
    const [data, setData] = useState({
        customers: [],
        accounts: [],
        transactions: [],
        loans: [],
        payments: [],
    });

    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState({
        customers: false,
        accounts: false,
        transactions: false,
        loans: false,
        payments: false,
    });

    useEffect(() => {
        let mounted = true;

        const loadDashboard = async () => {
            setLoading(true);

            const requests = {
                customers: axios.get(`${API}/api/customers`),
                accounts: axios.get(`${API}/api/accounts`),
                transactions: axios.get(`${API}/api/transactions`),
                loans: axios.get(`${API}/api/loans`),
                payments: axios.get(`${API}/api/payments`),
            };

            const entries = Object.entries(requests);

            const results = await Promise.allSettled(
                entries.map(([, request]) => request)
            );

            if (!mounted) return;

            const nextData = {};
            const nextServices = {};

            entries.forEach(([name], index) => {
                const result = results[index];

                if (result.status === "fulfilled") {
                    nextData[name] = Array.isArray(result.value.data)
                        ? result.value.data
                        : [];
                    nextServices[name] = true;
                } else {
                    nextData[name] = [];
                    nextServices[name] = false;
                    console.error(`${name} service error:`, result.reason);
                }
            });

            setData(nextData);
            setServices(nextServices);
            setLoading(false);
        };

        loadDashboard();

        return () => {
            mounted = false;
        };
    }, []);

    const activeAccounts = useMemo(
        () =>
            data.accounts.filter(
                (account) =>
                    String(account.status || "").toUpperCase() === "ACTIVE"
            ),
        [data.accounts]
    );

    const activeLoans = useMemo(
        () =>
            data.loans.filter((loan) =>
                ["ACTIVE", "APPROVED"].includes(
                    String(loan.status || "").toUpperCase()
                )
            ),
        [data.loans]
    );

    const successfulPayments = useMemo(
        () =>
            data.payments.filter((payment) =>
                ["SUCCESS", "SUCCESSFUL", "COMPLETED", "PROCESSED"].includes(
                    String(payment.status || "").toUpperCase()
                )
            ),
        [data.payments]
    );

    const totalAccountBalance = useMemo(
        () =>
            activeAccounts.reduce(
                (sum, account) => sum + Number(account.balance || 0),
                0
            ),
        [activeAccounts]
    );

    const totalOutstandingLoans = useMemo(
        () =>
            activeLoans.reduce(
                (sum, loan) => sum + Number(loan.outstandingAmount || 0),
                0
            ),
        [activeLoans]
    );

    const totalPayments = useMemo(
        () =>
            successfulPayments.reduce(
                (sum, payment) => sum + Number(payment.amount || 0),
                0
            ),
        [successfulPayments]
    );

    const transactionData = useMemo(() => {
        const now = new Date();
        const months = [];

        // Last 8 complete/current months, calculated from real transactions.
        for (let i = 7; i >= 0; i -= 1) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

            months.push({
                key: `${date.getFullYear()}-${date.getMonth()}`,
                month: date.toLocaleString("en-IN", { month: "short" }),
                year: date.getFullYear(),
                amount: 0,
            });
        }

        data.transactions.forEach((transaction) => {
            const rawDate =
                transaction.transactionDate || transaction.createdAt;

            if (!rawDate) return;

            const date = new Date(rawDate);
            if (Number.isNaN(date.getTime())) return;

            const key = `${date.getFullYear()}-${date.getMonth()}`;
            const month = months.find((item) => item.key === key);

            if (month) {
                month.amount += Number(transaction.amount || 0);
            }
        });

        return months;
    }, [data.transactions]);

    const currentPeriodVolume = transactionData.reduce(
        (sum, item) => sum + item.amount,
        0
    );

    const previousPeriodVolume = useMemo(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 15, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - 7, 1);

        return data.transactions.reduce((sum, transaction) => {
            const rawDate =
                transaction.transactionDate || transaction.createdAt;

            if (!rawDate) return sum;

            const date = new Date(rawDate);

            if (Number.isNaN(date.getTime())) return sum;

            if (date >= start && date < end) {
                return sum + Number(transaction.amount || 0);
            }

            return sum;
        }, 0);
    }, [data.transactions]);

    const periodChange =
        previousPeriodVolume > 0
            ? ((currentPeriodVolume - previousPeriodVolume) /
                  previousPeriodVolume) *
              100
            : null;

    const customerMap = useMemo(() => {
        const map = {};

        data.customers.forEach((customer) => {
            map[customer.id] =
                `${customer.firstName || ""} ${customer.lastName || ""}`.trim() ||
                `Customer #${customer.id}`;
        });

        return map;
    }, [data.customers]);

    const recentTransactions = useMemo(() => {
        return [...data.transactions]
            .sort((a, b) => {
                const dateA = new Date(
                    a.transactionDate || a.createdAt || 0
                ).getTime();

                const dateB = new Date(
                    b.transactionDate || b.createdAt || 0
                ).getTime();

                return dateB - dateA;
            })
            .slice(0, 5)
            .map((transaction) => {
                const type = String(
                    transaction.transactionType || ""
                ).toUpperCase();

                const incoming = type === "DEPOSIT";

                return {
                    name:
                        customerMap[transaction.customerId] ||
                        `Customer #${transaction.customerId ?? "-"}`,
                    type: transaction.transactionType || "Transaction",
                    date: formatDateTime(
                        transaction.transactionDate || transaction.createdAt
                    ),
                    amount: `${incoming ? "+" : "-"} ${formatCurrency(
                        transaction.amount
                    )}`,
                    status: transaction.status || "Unknown",
                    incoming,
                };
            });
    }, [data.transactions, customerMap]);

    const allServicesOnline = Object.values(services).every(Boolean);

    const currentDate = new Date();

    return (
        <BankingLayout activePath="/dashboard">
            <div className="dashboard-page">

                {/* HEADER */}

                <div className="dashboard-header">
                    <div>
                        <span className="dashboard-eyebrow">
                            FINCORE NEXUS / OVERVIEW
                        </span>

                        <h1>Dashboard Overview</h1>

                        <p>
                            Live information from your banking services.
                        </p>
                    </div>

                    <div className="dashboard-date">
                        <span>
                            {currentDate.toLocaleDateString("en-IN", {
                                weekday: "long",
                            })}
                        </span>

                        <strong>
                            {currentDate.toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                            })}
                        </strong>
                    </div>
                </div>

                {/* SERVICE STATUS */}

                <div className="system-status">
                    <div className="system-status-left">
                        <div
                            className={`system-pulse ${
                                allServicesOnline ? "" : "system-pulse-error"
                            }`}
                        ></div>

                        <div>
                            <strong>
                                {loading
                                    ? "Loading live service data..."
                                    : allServicesOnline
                                    ? "Live data connected"
                                    : "Some services are unavailable"}
                            </strong>

                            <span>
                                Dashboard values are calculated from the
                                Customer, Account, Transaction, Loan and
                                Payment APIs.
                            </span>
                        </div>
                    </div>

                    <div className="system-health">
                        {allServicesOnline ? (
                            <CheckCircle2 size={16} />
                        ) : (
                            <XCircle size={16} />
                        )}

                        <strong>
                            {Object.values(services).filter(Boolean).length}/5
                        </strong>

                        <span>Services online</span>
                    </div>
                </div>

                {/* STAT CARDS */}

                <div className="dashboard-stat-grid">
                    <StatCard
                        icon={<Users size={21} />}
                        title="Total Customers"
                        value={loading ? "..." : formatNumber(data.customers.length)}
                        subtitle="live records"
                        iconClass="purple"
                    />

                    <StatCard
                        icon={<WalletCards size={21} />}
                        title="Active Accounts"
                        value={loading ? "..." : formatNumber(activeAccounts.length)}
                        subtitle="status: ACTIVE"
                        iconClass="blue"
                    />

                    <StatCard
                        icon={<ArrowLeftRight size={21} />}
                        title="Transactions"
                        value={loading ? "..." : formatNumber(data.transactions.length)}
                        subtitle="all transaction records"
                        iconClass="green"
                    />

                    <StatCard
                        icon={<HandCoins size={21} />}
                        title="Active Loans"
                        value={loading ? "..." : formatNumber(activeLoans.length)}
                        subtitle="active / approved"
                        iconClass="orange"
                    />
                </div>

                {/* CHART + BALANCE */}

                <div className="dashboard-main-grid">
                    <div className="dashboard-panel transaction-chart-panel">
                        <div className="panel-header">
                            <div>
                                <span className="panel-label">
                                    TRANSACTION ACTIVITY
                                </span>

                                <h2>Transaction volume</h2>
                            </div>

                            <span className="period-button">
                                Last 8 months
                            </span>
                        </div>

                        <div className="chart-summary">
                            <div>
                                <strong>
                                    {formatCurrency(currentPeriodVolume)}
                                </strong>

                                <span>
                                    {periodChange !== null ? (
                                        <>
                                            {periodChange >= 0 ? (
                                                <TrendingUp size={14} />
                                            ) : (
                                                <TrendingDown size={14} />
                                            )}

                                            {Math.abs(periodChange).toFixed(1)}%
                                            compared to previous 8 months
                                        </>
                                    ) : (
                                        "No previous-period data available"
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="transaction-chart">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={transactionData}>
                                    <defs>
                                        <linearGradient
                                            id="transactionGradient"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopOpacity={0.25}
                                            />
                                            <stop
                                                offset="100%"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#e9edf3"
                                    />

                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: "#94a3b8",
                                            fontSize: 12,
                                        }}
                                    />

                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: "#94a3b8",
                                            fontSize: 11,
                                        }}
                                        tickFormatter={(value) =>
                                            formatCompactCurrency(value)
                                        }
                                    />

                                    <Tooltip
                                        formatter={(value) =>
                                            formatCurrency(value)
                                        }
                                    />

                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#635bff"
                                        strokeWidth={3}
                                        fill="url(#transactionGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* BALANCE */}

                    <div className="dashboard-panel balance-panel">
                        <div className="panel-header">
                            <div>
                                <span className="panel-label">
                                    PLATFORM BALANCE
                                </span>

                                <h2>Financial overview</h2>
                            </div>

                            <MoreHorizontal size={20} />
                        </div>

                        <div className="total-balance">
                            <span>Total active account balance</span>

                            <strong>
                                {formatCurrency(totalAccountBalance)}
                            </strong>

                            <small>
                                Calculated from live ACTIVE account records
                            </small>
                        </div>

                        <div className="balance-items">
                            <BalanceItem
                                title="Active account balances"
                                amount={formatCompactCurrency(totalAccountBalance)}
                                percentage="—"
                                className="deposit"
                            />

                            <BalanceItem
                                title="Loans outstanding"
                                amount={formatCompactCurrency(totalOutstandingLoans)}
                                percentage="—"
                                className="loan"
                            />

                            <BalanceItem
                                title="Successful payments"
                                amount={formatCompactCurrency(totalPayments)}
                                percentage="—"
                                className="payment"
                            />
                        </div>

                        <Link to="/accounts" className="view-details">
                            View account analytics
                            <ArrowUpRight size={16} />
                        </Link>
                    </div>
                </div>

                {/* RECENT TRANSACTIONS + SERVICES */}

                <div className="dashboard-bottom-grid">
                    <div className="dashboard-panel recent-panel">
                        <div className="panel-header">
                            <div>
                                <span className="panel-label">
                                    ACTIVITY
                                </span>

                                <h2>Recent transactions</h2>
                            </div>

                            <Link to="/transactions" className="panel-link">
                                View all
                                <ArrowUpRight size={15} />
                            </Link>
                        </div>

                        <div className="transaction-list">
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map((transaction, index) => (
                                    <TransactionRow
                                        key={`${transaction.name}-${index}`}
                                        transaction={transaction}
                                    />
                                ))
                            ) : (
                                <div className="dashboard-empty-state">
                                    No transactions available.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SERVICE HEALTH */}

                    <div className="dashboard-panel service-health-panel">
                        <div className="panel-header">
                            <div>
                                <span className="panel-label">
                                    MICROSERVICES
                                </span>

                                <h2>Service health</h2>
                            </div>

                            <Activity size={19} />
                        </div>

                        <ServiceStatus
                            name="Customer Service"
                            port="8081"
                            online={services.customers}
                        />

                        <ServiceStatus
                            name="Account Service"
                            port="8082"
                            online={services.accounts}
                        />

                        <ServiceStatus
                            name="Transaction Service"
                            port="8083"
                            online={services.transactions}
                        />

                        <ServiceStatus
                            name="Loan Service"
                            port="8084"
                            online={services.loans}
                        />

                        <ServiceStatus
                            name="Payment Service"
                            port="8085"
                            online={services.payments}
                        />

                        <div className="eureka-status">
                            <div className="eureka-icon">✓</div>

                            <div>
                                <strong>API Gateway</strong>
                                <span>Dashboard data is requested through port 8080</span>
                            </div>

                            <span className="eureka-online">8080</span>
                        </div>
                    </div>
                </div>

                {/* QUICK ACTIONS */}

                <div className="quick-actions">
                    <div className="quick-heading">
                        <span className="panel-label">
                            QUICK ACTIONS
                        </span>

                        <h2>Manage your banking platform</h2>
                    </div>

                    <div className="quick-grid">
                        <QuickAction
                            icon={<Users size={20} />}
                            title="Manage Customers"
                            text="View and manage customer profiles"
                            link="/customers"
                        />

                        <QuickAction
                            icon={<WalletCards size={20} />}
                            title="Manage Accounts"
                            text="View accounts and balances"
                            link="/accounts"
                        />

                        <QuickAction
                            icon={<CreditCard size={20} />}
                            title="Process Payments"
                            text="Monitor payment operations"
                            link="/payments"
                        />

                        <QuickAction
                            icon={<HandCoins size={20} />}
                            title="Manage Loans"
                            text="Review loan applications"
                            link="/loans"
                        />
                    </div>
                </div>
            </div>
        </BankingLayout>
    );
}

/* STAT CARD */

function StatCard({
    icon,
    title,
    value,
    subtitle,
    iconClass,
}) {
    return (
        <div className="stat-card">
            <div className="stat-card-top">
                <div className={`stat-icon ${iconClass}`}>
                    {icon}
                </div>
            </div>

            <span className="stat-title">{title}</span>

            <strong className="stat-value">{value}</strong>

            <span className="stat-subtitle">{subtitle}</span>
        </div>
    );
}

/* BALANCE ITEM */

function BalanceItem({
    title,
    amount,
    percentage,
    className,
}) {
    return (
        <div className="balance-item">
            <div className="balance-item-info">
                <div className={`balance-dot ${className}`}></div>
                <span>{title}</span>
                <strong>{amount}</strong>
            </div>

            <span className="balance-percentage">
                {percentage}
            </span>
        </div>
    );
}

/* TRANSACTION */

function TransactionRow({ transaction }) {
    const isCompleted =
        ["SUCCESS", "SUCCESSFUL", "COMPLETED", "PROCESSED"].includes(
            String(transaction.status || "").toUpperCase()
        );

    return (
        <div className="transaction-row">
            <div
                className={`transaction-avatar ${
                    transaction.incoming ? "incoming" : "outgoing"
                }`}
            >
                {transaction.incoming ? (
                    <ArrowDownLeft size={17} />
                ) : (
                    <ArrowUpRight size={17} />
                )}
            </div>

            <div className="transaction-person">
                <strong>{transaction.name}</strong>
                <span>{transaction.type}</span>
            </div>

            <div className="transaction-date">
                {transaction.date}
            </div>

            <strong
                className={
                    transaction.incoming
                        ? "transaction-incoming"
                        : "transaction-outgoing"
                }
            >
                {transaction.amount}
            </strong>

            <span
                className={`transaction-status ${
                    isCompleted ? "completed" : "pending"
                }`}
            >
                {transaction.status}
            </span>
        </div>
    );
}

/* SERVICE */

function ServiceStatus({
    name,
    port,
    online,
}) {
    return (
        <div className="service-status-row">
            <div className="service-status-icon">
                {online ? (
                    <CheckCircle2 size={16} />
                ) : (
                    <XCircle size={16} />
                )}
            </div>

            <div className="service-status-info">
                <strong>{name}</strong>
                <span>Port {port}</span>
            </div>

            <div className="service-status-right">
                <span className="service-status-dot"></span>
                {online ? "Operational" : "Unavailable"}
            </div>
        </div>
    );
}

/* QUICK ACTION */

function QuickAction({
    icon,
    title,
    text,
    link,
}) {
    return (
        <Link to={link} className="quick-action">
            <div className="quick-action-icon">
                {icon}
            </div>

            <div>
                <strong>{title}</strong>
                <span>{text}</span>
            </div>

            <ArrowUpRight
                size={17}
                className="quick-arrow"
            />
        </Link>
    );
}

/* HELPERS */

function formatNumber(value) {
    return Number(value || 0).toLocaleString("en-IN");
}

function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;
}

function formatCompactCurrency(value) {
    const amount = Number(value || 0);

    if (Math.abs(amount) >= 10000000) {
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }

    if (Math.abs(amount) >= 100000) {
        return `₹${(amount / 100000).toFixed(2)} L`;
    }

    if (Math.abs(amount) >= 1000) {
        return `₹${(amount / 1000).toFixed(1)}K`;
    }

    return formatCurrency(amount);
}

function formatDateTime(value) {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default Dashboard;
