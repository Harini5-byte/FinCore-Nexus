import {
LayoutDashboard,
    WalletCards,
    ArrowLeftRight,
    HandCoins,
    CreditCard,
    ShieldCheck,
    UserCircle,
    LogOut,
    Search,
} from "lucide-react";

import {
    NavLink,
    useNavigate,
} from "react-router-dom";

import {
    logout,
    getUser,
} from "../../utils/auth";

import "./CustomerLayout.css";


function CustomerLayout({ children }) {

    const navigate = useNavigate();

    const user = getUser();


    /* =====================================================
       LOGOUT
    ===================================================== */

    const handleLogout = () => {

        logout();

        navigate(
            "/login",
            { replace: true }
        );
    };


    return (

        <div className="customer-layout">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="customer-sidebar">

                {/* =============================================
                    BRAND
                ============================================= */}

                <div className="customer-brand">

                    <div className="customer-brand-logo">
                        FN
                    </div>

                    <div>

                        <h2>
                            FinCore
                            <span>NEXUS</span>
                        </h2>

                        <p>
                            Digital Banking
                        </p>

                    </div>

                </div>


                {/* =============================================
                    CUSTOMER
                ============================================= */}

                <div className="customer-sidebar-user">

                    <div className="customer-sidebar-avatar">

                        <UserCircle size={28} />

                    </div>

                    <div>

                        <strong>
                            {user?.firstName ||
                                user?.name ||
                                "Customer"}
                        </strong>

                        <span>
                            Customer
                        </span>

                    </div>

                </div>


                {/* =============================================
                    SEARCH
                ============================================= */}

                <div className="customer-sidebar-search">

                    <Search size={17} />

                    <input
                        type="text"
                        placeholder="Search"
                    />

                </div>


                {/* =============================================
                    NAVIGATION
                ============================================= */}

                <nav className="customer-sidebar-nav">

                    <div className="customer-nav-label">
                        MAIN MENU
                    </div>


                    <NavLink
                        to="/customer-dashboard"
                        className={({ isActive }) =>
                            isActive
                                ? "customer-nav-link active"
                                : "customer-nav-link"
                        }
                    >

                        <LayoutDashboard size={19} />

                        <span>
                            Dashboard
                        </span>

                    </NavLink>


                    <NavLink
                        to="/customer-accounts"
                        className={({ isActive }) =>
                            isActive
                                ? "customer-nav-link active"
                                : "customer-nav-link"
                        }
                    >

                        <WalletCards size={19} />

                        <span>
                            My Accounts
                        </span>

                    </NavLink>


                    <NavLink
                        to="/customer-transactions"
                        className={({ isActive }) =>
                            isActive
                                ? "customer-nav-link active"
                                : "customer-nav-link"
                        }
                    >

                        <ArrowLeftRight size={19} />

                        <span>
                            Transactions
                        </span>

                    </NavLink>


                    <NavLink
                        to="/customer-loans"
                        className={({ isActive }) =>
                            isActive
                                ? "customer-nav-link active"
                                : "customer-nav-link"
                        }
                    >

                        <HandCoins size={19} />

                        <span>
                            Loans
                        </span>

                    </NavLink>


                    <NavLink
                        to="/customer-payments"
                        className={({ isActive }) =>
                            isActive
                                ? "customer-nav-link active"
                                : "customer-nav-link"
                        }
                    >

                        <CreditCard size={19} />

                        <span>
                            Payments
                        </span>

                    </NavLink>


                    <NavLink
                        to="/customer-kyc"
                        className={({ isActive }) =>
                            isActive
                                ? "customer-nav-link active"
                                : "customer-nav-link"
                        }
                    >

                        <ShieldCheck size={19} />

                        <span>
                            KYC Verification
                        </span>

                    </NavLink>


                    <div className="customer-nav-label">
                        ACCOUNT
                    </div>


                    <NavLink
                        to="/customer-profile"
                        className={({ isActive }) =>
                            isActive
                                ? "customer-nav-link active"
                                : "customer-nav-link"
                        }
                    >

                        <UserCircle size={19} />

                        <span>
                            My Profile
                        </span>

                    </NavLink>

                </nav>


                {/* =============================================
                    SIDEBAR BOTTOM
                ============================================= */}

                <div className="customer-sidebar-bottom">

                    <button
                        type="button"
                        className="customer-logout-button"
                        onClick={handleLogout}
                    >

                        <LogOut size={19} />

                        <span>
                            Sign Out
                        </span>

                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="customer-main">

                {children}

            </main>

        </div>
    );
}

export default CustomerLayout;