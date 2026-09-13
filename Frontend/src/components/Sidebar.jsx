import { NavLink, useNavigate } from "react-router-dom";

import {
    LayoutDashboard,
    Users,
    WalletCards,
    ArrowLeftRight,
    HandCoins,
    CreditCard,
    ShieldCheck,
    LogOut,
    X,
} from "lucide-react";

import "./Sidebar.css";


function Sidebar({ open, onClose }) {

    const navigate = useNavigate();


    // =====================================================
    // SIGN OUT
    // =====================================================

    const handleSignOut = () => {

        localStorage.removeItem("fincoreLoggedIn");
        localStorage.removeItem("fincore_user");
        localStorage.removeItem("fincore_users");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        localStorage.removeItem("customer");
        localStorage.removeItem("fincore_customer");

        sessionStorage.clear();

        navigate("/login", {
            replace: true,
        });
    };


    // =====================================================
    // ADMIN NAVIGATION
    // =====================================================

    const navItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: <LayoutDashboard size={20} />,
        },

        {
            name: "Customers",
            path: "/customers",
            icon: <Users size={20} />,
        },

        {
            name: "Accounts",
            path: "/accounts",
            icon: <WalletCards size={20} />,
        },

        {
            name: "Transactions",
            path: "/transactions",
            icon: <ArrowLeftRight size={20} />,
        },

        {
            name: "Loans",
            path: "/loans",
            icon: <HandCoins size={20} />,
        },

        {
            name: "Payments",
            path: "/payments",
            icon: <CreditCard size={20} />,
        },

        {
            name: "KYC Management",
            path: "/kyc-management",
            icon: <ShieldCheck size={20} />,
        },
    ];


    return (
        <>

            {/* =================================================
                MOBILE OVERLAY
            ================================================= */}

            {open && (
                <div
                    className="sidebar-overlay"
                    onClick={onClose}
                />
            )}


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside
                className={`sidebar ${
                    open ? "sidebar-open" : ""
                }`}
            >


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="sidebar-header">

                    <div className="brand">

                        <div className="brand-icon">
                            FN
                        </div>

                        <div>

                            <h2>
                                FinCore
                            </h2>

                            <span>
                                NEXUS
                            </span>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="close-btn"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>

                </div>


                {/* =================================================
                    ENTERPRISE BANKING
                ================================================= */}

                <div className="menu-title">
                    ENTERPRISE BANKING
                </div>


                {/* =================================================
                    NAVIGATION
                ================================================= */}

                <nav>


                    {/* OVERVIEW */}

                    <div className="menu-title">
                        OVERVIEW
                    </div>


                    <NavLink
                        to="/dashboard"
                        onClick={onClose}
                        className={({ isActive }) =>
                            `nav-item ${
                                isActive ? "active" : ""
                            }`
                        }
                    >

                        <LayoutDashboard size={20} />

                        <span>
                            Dashboard
                        </span>

                    </NavLink>


                    {/* BANKING */}

                    <div className="menu-title">
                        BANKING
                    </div>


                    {navItems
                        .slice(1)
                        .map((item) => (

                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `nav-item ${
                                        isActive
                                            ? "active"
                                            : ""
                                    }`
                                }
                            >

                                {item.icon}

                                <span>
                                    {item.name}
                                </span>

                            </NavLink>

                        ))}

                </nav>


                {/* =================================================
                    BOTTOM
                ================================================= */}

                <div className="sidebar-bottom">


                    {/* SYSTEM STATUS */}

                    <div className="system-status">

                        <div className="status-dot"></div>

                        <div>

                            <strong>
                                System Status
                            </strong>

                            <small>
                                All systems operational
                            </small>

                        </div>

                    </div>


                    {/* SIGN OUT */}

                    <button
                        type="button"
                        className="nav-item signout-btn"
                        onClick={handleSignOut}
                    >

                        <LogOut size={19} />

                        <span>
                            Sign out
                        </span>

                    </button>

                </div>

            </aside>

        </>
    );
}


export default Sidebar;