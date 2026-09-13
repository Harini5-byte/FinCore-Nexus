import { useEffect, useState } from "react";
import { Menu, Search, Bell, Mail, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";

function Navbar({ onMenuClick }) {
    const navigate = useNavigate();

    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const [customers, setCustomers] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loans, setLoans] = useState([]);

    const [showMessages, setShowMessages] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // Load real data from backend
    useEffect(() => {
        const loadSearchData = async () => {
            try {
                const [customerRes, accountRes, loanRes] =
                    await Promise.allSettled([
                        axios.get("http://localhost:8080/api/customers"),
                        axios.get("http://localhost:8080/api/accounts"),
                        axios.get("http://localhost:8080/api/loans"),
                    ]);

                if (customerRes.status === "fulfilled") {
                    const data = customerRes.value.data;

                    setCustomers(
                        Array.isArray(data)
                            ? data
                            : data.content || data.customers || []
                    );
                }

                if (accountRes.status === "fulfilled") {
                    const data = accountRes.value.data;

                    setAccounts(
                        Array.isArray(data)
                            ? data
                            : data.content || data.accounts || []
                    );
                }

                if (loanRes.status === "fulfilled") {
                    const data = loanRes.value.data;

                    setLoans(
                        Array.isArray(data)
                            ? data
                            : data.content || data.loans || []
                    );
                }
            } catch (error) {
                console.error("Navbar search data error:", error);
            }
        };

        loadSearchData();
    }, []);

    // Search real data
    useEffect(() => {
        const keyword = searchText.trim().toLowerCase();

        if (!keyword) {
            setSearchResults([]);
            return;
        }

        const results = [];

        // Customers
        customers.forEach((customer) => {
            const name = [
                customer.firstName,
                customer.lastName,
            ]
                .filter(Boolean)
                .join(" ");

            const email = customer.email || "";
            const phone = customer.phone || "";
            const id = customer.id || customer.customerId || "";

            if (
                `${name} ${email} ${phone} ${id}`
                    .toLowerCase()
                    .includes(keyword)
            ) {
                results.push({
                    type: "Customer",
                    title: name || "Unnamed Customer",
                    subtitle: email || `Customer ID: ${id}`,
                    path: "/customers",
                });
            }
        });

        // Accounts
        accounts.forEach((account) => {
            const accountNumber = account.accountNumber || "";
            const customerId = account.customerId || "";
            const type = account.accountType || "";

            if (
                `${accountNumber} ${customerId} ${type}`
                    .toLowerCase()
                    .includes(keyword)
            ) {
                results.push({
                    type: "Account",
                    title: accountNumber
                        ? `Account ${accountNumber}`
                        : `Account ${account.id || ""}`,
                    subtitle: `Customer ID: ${customerId || "N/A"}`,
                    path: "/accounts",
                });
            }
        });

        // Loans
        loans.forEach((loan) => {
            const loanNumber = loan.loanNumber || "";
            const customerId = loan.customerId || "";
            const type = loan.loanType || "";
            const status = loan.status || "";

            if (
                `${loanNumber} ${customerId} ${type} ${status}`
                    .toLowerCase()
                    .includes(keyword)
            ) {
                results.push({
                    type: "Loan",
                    title: loanNumber
                        ? `Loan ${loanNumber}`
                        : `Loan ${loan.id || ""}`,
                    subtitle: `Customer ID: ${customerId || "N/A"}`,
                    path: "/loans",
                });
            }
        });

        setSearchResults(results.slice(0, 8));
    }, [searchText, customers, accounts, loans]);

    const handleResultClick = (result) => {
        setSearchText("");
        setSearchResults([]);
        navigate(result.path);
    };

    return (
        <header className="top-navbar">

            {/* Mobile Menu */}
            <button
                type="button"
                className="mobile-menu"
                onClick={onMenuClick}
            >
                <Menu size={21} />
            </button>

            {/* Search */}
            <div className="navbar-search-wrapper">

                <div className="navbar-search">
                    <Search size={15} />

                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search customers, accounts, loans..."
                    />

                    {searchText && (
                        <button
                            type="button"
                            className="navbar-search-clear"
                            onClick={() => setSearchText("")}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Search Results */}
                {searchText.trim() && (
                    <div className="navbar-search-results">

                        {searchResults.length > 0 ? (
                            searchResults.map((result, index) => (
                                <button
                                    type="button"
                                    key={`${result.type}-${index}`}
                                    className="navbar-search-result"
                                    onClick={() =>
                                        handleResultClick(result)
                                    }
                                >
                                    <div className="search-result-icon">
                                        <Search size={14} />
                                    </div>

                                    <div className="search-result-text">
                                        <strong>
                                            {result.title}
                                        </strong>

                                        <span>
                                            {result.type} ·{" "}
                                            {result.subtitle}
                                        </span>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="navbar-no-results">
                                No matching customers, accounts or loans
                            </div>
                        )}

                    </div>
                )}

            </div>

            {/* Right Section */}
            <div className="navbar-right">

                {/* Mail */}
                <button
                    type="button"
                    className="navbar-icon-btn"
                    onClick={() => {
                        setShowMessages(!showMessages);
                        setShowNotifications(false);
                    }}
                    title="Messages"
                >
                    <Mail size={18} />
                </button>

                {/* Notifications */}
                <button
                    type="button"
                    className="navbar-icon-btn"
                    onClick={() => {
                        setShowNotifications(!showNotifications);
                        setShowMessages(false);
                    }}
                    title="Notifications"
                >
                    <Bell size={18} />
                    <span className="badge-dot"></span>
                </button>

                {/* Profile */}
                <div className="navbar-profile">

                    <div className="navbar-avatar">
                        AD
                    </div>

                    <div className="navbar-profile-info">
                        <strong>Admin</strong>
                        <span>Bank Teller</span>
                    </div>

                </div>

                {/* Messages */}
                {showMessages && (
                    <div className="navbar-popup">
                        <div className="navbar-popup-title">
                            Messages
                        </div>

                        <div className="navbar-popup-empty">
                            No new messages
                        </div>
                    </div>
                )}

                {/* Notifications */}
                {showNotifications && (
                    <div className="navbar-popup">
                        <div className="navbar-popup-title">
                            Notifications
                        </div>

                        <div className="navbar-popup-empty">
                            No new notifications
                        </div>
                    </div>
                )}

            </div>

        </header>
    );
}

export default Navbar;