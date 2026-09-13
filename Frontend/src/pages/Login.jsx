import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    ShieldCheck,
    UserRound,
    Eye,
    EyeOff,
    ArrowRight,
} from "lucide-react";

import axios from "axios";
import { saveUser } from "../utils/auth";

import "./Auth.css";

// =====================================================
// CUSTOMER SERVICE API
// =====================================================

const CUSTOMER_API =
    "http://localhost:8080/api/customers";

function Login() {

    const navigate = useNavigate();

    // =====================================================
    // STATE
    // =====================================================

    const [role, setRole] = useState("CUSTOMER");

    const [showPassword, setShowPassword] =
        useState(false);

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    // =====================================================
    // GET LOCAL CUSTOMER USER
    // =====================================================

    const getStoredCustomerUser = () => {

        try {

            const users = JSON.parse(
                localStorage.getItem("fincore_users") || "[]"
            );

            if (!Array.isArray(users)) {
                return null;
            }

            const normalizedEmail =
                email.trim().toLowerCase();

            const customerUser = users.find(
                (user) =>
                    String(user?.email || "")
                        .trim()
                        .toLowerCase() === normalizedEmail &&
                    String(user?.role || "")
                        .trim()
                        .toUpperCase() === "CUSTOMER"
            );

            console.log(
                "Stored customer user:",
                customerUser
            );

            return customerUser || null;

        } catch (err) {

            console.error(
                "Error reading fincore_users:",
                err
            );

            return null;
        }
    };


    // =====================================================
    // NORMALIZE CUSTOMER RESPONSE
    // =====================================================

    const normalizeCustomers = (data) => {

        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.content)) {
            return data.content;
        }

        if (Array.isArray(data?.customers)) {
            return data.customers;
        }

        if (Array.isArray(data?.data)) {
            return data.data;
        }

        return [];
    };


    // =====================================================
    // SAVE / UPDATE CUSTOMER LOGIN CREDENTIAL
    // =====================================================

    const saveCustomerCredential = (customer) => {

        try {

            const users = JSON.parse(
                localStorage.getItem("fincore_users") || "[]"
            );

            const customerUser = {

                id: customer.id,

                customerId: customer.id,

                customerNumber:
                    customer.customerNumber || "",

                firstName:
                    customer.firstName || "",

                lastName:
                    customer.lastName || "",

                name:
                    `${customer.firstName || ""} ${
                        customer.lastName || ""
                    }`.trim(),

                email:
                    customer.email || email.trim(),

                phone:
                    customer.phone || "",

                address:
                    customer.address || "",

                city:
                    customer.city || "",

                state:
                    customer.state || "",

                postalCode:
                    customer.postalCode || "",

                password: password,

                role: "CUSTOMER",

                status:
                    customer.status || "ACTIVE",

                createdAt:
                    customer.createdAt ||
                    new Date().toISOString(),

                customerProfile:
                    customer,
            };


            const filteredUsers =
                users.filter(
                    (user) =>
                        !(
                            String(user?.email || "")
                                .trim()
                                .toLowerCase() ===
                            customerUser.email
                                .trim()
                                .toLowerCase() &&
                            String(user?.role || "")
                                .trim()
                                .toUpperCase() ===
                            "CUSTOMER"
                        )
                );


            filteredUsers.push(customerUser);


            localStorage.setItem(
                "fincore_users",
                JSON.stringify(filteredUsers)
            );


            console.log(
                "Customer login credentials saved:",
                customerUser
            );


            return customerUser;

        } catch (err) {

            console.error(
                "Unable to save customer credentials:",
                err
            );

            return null;
        }
    };


    // =====================================================
    // HANDLE LOGIN
    // =====================================================

    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);


        try {

            // =================================================
            // ADMIN LOGIN
            // =================================================

            if (role === "ADMIN") {

                const adminEmail =
                    "admin@fincore.com";

                const adminPassword =
                    "admin123";


                if (
                    email.trim().toLowerCase() !==
                    adminEmail ||
                    password !== adminPassword
                ) {

                    setError(
                        "Invalid admin email or password."
                    );

                    setLoading(false);

                    return;
                }


                const adminUser = {

                    id: "ADMIN-001",

                    customerId: null,

                    customerNumber: null,

                    firstName: "FinCore",

                    lastName: "Admin",

                    name: "FinCore Admin",

                    email: adminEmail,

                    password: adminPassword,

                    role: "ADMIN",

                    status: "ACTIVE",

                    createdAt:
                        new Date().toISOString(),
                };


                console.log(
                    "ADMIN LOGIN SUCCESS:",
                    adminUser
                );


                saveUser(adminUser);


                localStorage.setItem(
                    "admin",
                    JSON.stringify(adminUser)
                );

                localStorage.setItem(
                    "fincore_admin",
                    JSON.stringify(adminUser)
                );


                console.log(
                    "Saved admin user:",
                    JSON.parse(
                        localStorage.getItem("user")
                    )
                );


                navigate(
                    "/dashboard",
                    {
                        replace: true,
                    }
                );

                return;
            }


            // =================================================
            // CUSTOMER LOGIN
            // =================================================

            const normalizedEmail =
                email.trim().toLowerCase();


            if (!normalizedEmail || !password) {

                setError(
                    "Please enter email and password."
                );

                setLoading(false);

                return;
            }


            // =================================================
            // GET CUSTOMER FROM BACKEND
            // =================================================

            console.log(
                "Looking for customer:",
                normalizedEmail
            );


            const response =
                await axios.get(
                    CUSTOMER_API
                );


            console.log(
                "Customer Service response:",
                response.data
            );


            const customers =
                normalizeCustomers(
                    response.data
                );


            const customer =
                customers.find(
                    (item) =>
                        String(item?.email || "")
                            .trim()
                            .toLowerCase() ===
                        normalizedEmail
                );


            console.log(
                "Matched customer:",
                customer
            );


            // =================================================
            // CUSTOMER DOES NOT EXIST
            // =================================================

            if (!customer) {

                setError(
                    "Customer account was not found. Please register first."
                );

                setLoading(false);

                return;
            }


            // =================================================
            // CUSTOMER ID
            // =================================================

            if (!customer.id) {

                setError(
                    "Customer profile exists, but Customer ID is missing."
                );

                setLoading(false);

                return;
            }


            const customerId =
                customer.id;


            console.log(
                "REAL CUSTOMER ID:",
                customerId
            );


            // =================================================
            // CHECK LOCAL CUSTOMER CREDENTIALS
            // =================================================

            let user =
                getStoredCustomerUser();


            // =================================================
            // FIRST LOGIN / MISSING LOCAL CREDENTIAL
            // =================================================

            if (!user) {

                console.log(
                    "No local customer credential found."
                );

                console.log(
                    "Creating customer login record..."
                );


                user =
                    saveCustomerCredential(
                        customer
                    );


                if (!user) {

                    setError(
                        "Unable to create customer login credentials."
                    );

                    setLoading(false);

                    return;
                }
            }


            // =================================================
            // PASSWORD CHECK
            // =================================================

            if (
                user.password &&
                user.password !== password
            ) {

                setError(
                    "Invalid customer password."
                );

                setLoading(false);

                return;
            }


            // =================================================
            // CREATE COMPLETE LOGGED-IN CUSTOMER
            // =================================================

            const loggedInCustomer = {

                ...user,

                role: "CUSTOMER",

                id:
                    customer.id,

                customerId:
                    customer.id,

                customerNumber:
                    customer.customerNumber ||
                    user.customerNumber ||
                    "",

                firstName:
                    customer.firstName ||
                    user.firstName ||
                    "",

                lastName:
                    customer.lastName ||
                    user.lastName ||
                    "",

                name:
                    `${customer.firstName || user.firstName || ""} ${
                        customer.lastName || user.lastName || ""
                    }`.trim(),

                email:
                    customer.email ||
                    user.email,

                phone:
                    customer.phone ||
                    user.phone ||
                    "",

                address:
                    customer.address ||
                    user.address ||
                    "",

                city:
                    customer.city ||
                    user.city ||
                    "",

                state:
                    customer.state ||
                    user.state ||
                    "",

                postalCode:
                    customer.postalCode ||
                    user.postalCode ||
                    "",

                status:
                    customer.status ||
                    user.status ||
                    "ACTIVE",

                createdAt:
                    customer.createdAt ||
                    user.createdAt ||
                    null,

                updatedAt:
                    customer.updatedAt ||
                    null,

                customerProfile:
                    customer,
            };


            console.log(
                "FINAL LOGGED-IN CUSTOMER:",
                loggedInCustomer
            );


            // =================================================
            // SAVE CURRENT USER
            // =================================================

            saveUser(
                loggedInCustomer
            );


            // =================================================
            // SAVE CUSTOMER PROFILE
            // =================================================

            localStorage.setItem(
                "customer",
                JSON.stringify(
                    customer
                )
            );


            localStorage.setItem(
                "fincore_customer",
                JSON.stringify(
                    customer
                )
            );


            // =================================================
            // UPDATE FINCORE_USERS WITH COMPLETE DATA
            // =================================================

            try {

                const users =
                    JSON.parse(
                        localStorage.getItem(
                            "fincore_users"
                        ) || "[]"
                    );


                const updatedUsers =
                    users.filter(
                        (u) =>
                            !(
                                String(u?.email || "")
                                    .trim()
                                    .toLowerCase() ===
                                normalizedEmail &&
                                String(u?.role || "")
                                    .trim()
                                    .toUpperCase() ===
                                "CUSTOMER"
                            )
                    );


                updatedUsers.push(
                    loggedInCustomer
                );


                localStorage.setItem(
                    "fincore_users",
                    JSON.stringify(
                        updatedUsers
                    )
                );


            } catch (storageError) {

                console.error(
                    "Could not update fincore_users:",
                    storageError
                );
            }


            // =================================================
            // REMOVE ADMIN SESSION
            // =================================================

            localStorage.removeItem(
                "admin"
            );

            localStorage.removeItem(
                "fincore_admin"
            );


            // =================================================
            // VERIFY
            // =================================================

            console.log(
                "Saved user:",
                JSON.parse(
                    localStorage.getItem("user")
                )
            );


            console.log(
                "Saved customer ID:",
                JSON.parse(
                    localStorage.getItem("user")
                )?.customerId
            );


            console.log(
                "Customer login successful."
            );


            // =================================================
            // CUSTOMER DASHBOARD
            // =================================================

            navigate(
                "/customer-dashboard",
                {
                    replace: true,
                }
            );


        } catch (err) {

            console.error(
                "Login error:",
                err
            );


            if (err.response) {

                setError(
                    err.response.data?.message ||
                    err.response.data?.error ||
                    `Server returned ${err.response.status}.`
                );

            } else {

                setError(
                    "Unable to connect to Customer Service. Make sure API Gateway and Customer Service are running."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="auth-page">

            <div className="auth-container">

                {/* =================================================
                    BRAND
                ================================================= */}

                <div className="auth-brand">

                    <div className="auth-logo">
                        FN
                    </div>

                    <h1>
                        FinCore
                        <span>
                            NEXUS
                        </span>
                    </h1>

                    <p>
                        Enterprise Digital Banking Platform
                    </p>


                    <div className="auth-feature">

                        <ShieldCheck size={20} />

                        <div>

                            <strong>
                                Secure access
                            </strong>

                            <span>
                                Sign in according to
                                your banking role.
                            </span>

                        </div>

                    </div>


                    <div className="auth-feature">

                        <UserRound size={20} />

                        <div>

                            <strong>
                                Digital banking
                            </strong>

                            <span>
                                Manage your banking
                                activities from one place.
                            </span>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    LOGIN CARD
                ================================================= */}

                <div className="auth-card">

                    <div className="auth-heading">

                        <span>
                            FINCORE NEXUS
                        </span>

                        <h2>
                            Welcome back
                        </h2>

                        <p>
                            Login to continue to your
                            banking dashboard.
                        </p>

                    </div>


                    <label>
                        Login as
                    </label>


                    <div className="role-selection">

                        {/* CUSTOMER */}

                        <button
                            type="button"
                            className={
                                role === "CUSTOMER"
                                    ? "role-card selected"
                                    : "role-card"
                            }
                            onClick={() => {
                                setRole("CUSTOMER");
                                setError("");
                            }}
                        >

                            <UserRound size={22} />

                            <div>

                                <strong>
                                    Customer
                                </strong>

                                <span>
                                    My banking
                                </span>

                            </div>

                        </button>


                        {/* ADMIN */}

                        <button
                            type="button"
                            className={
                                role === "ADMIN"
                                    ? "role-card selected"
                                    : "role-card"
                            }
                            onClick={() => {
                                setRole("ADMIN");
                                setError("");
                            }}
                        >

                            <ShieldCheck size={22} />

                            <div>

                                <strong>
                                    Admin
                                </strong>

                                <span>
                                    Management
                                </span>

                            </div>

                        </button>

                    </div>


                    {/* =================================================
                        LOGIN FORM
                    ================================================= */}

                    <form onSubmit={handleLogin}>

                        <label>
                            Email Address
                        </label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                        />


                        <label>
                            Password
                        </label>


                        <div className="password-box">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                                required
                            />


                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >

                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}

                            </button>

                        </div>


                        {/* ERROR */}

                        {error && (

                            <div className="auth-error">
                                {error}
                            </div>

                        )}


                        {/* LOGIN BUTTON */}

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >

                            {loading
                                ? "Logging in..."
                                : `Login as ${
                                    role === "ADMIN"
                                        ? "Admin"
                                        : "Customer"
                                }`
                            }

                            {!loading && (
                                <ArrowRight size={18} />
                            )}

                        </button>

                    </form>


                    {/* REGISTER */}

                    <p className="auth-switch">

                        Don't have an account?

                        <Link to="/register">
                            Register
                        </Link>

                    </p>

                </div>

            </div>

        </div>
    );
}

export default Login;