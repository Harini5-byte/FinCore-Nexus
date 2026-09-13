import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import {
    ShieldCheck,
    UserRound,
    Eye,
    EyeOff,
    ArrowRight,
} from "lucide-react";

import { saveUser } from "../utils/auth";

import "./Auth.css";

const CUSTOMER_API = "http://localhost:8080/api/customers";

function Register() {
    const navigate = useNavigate();

    const [role, setRole] = useState("CUSTOMER");
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // =====================================================
    // HANDLE INPUT
    // =====================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =====================================================
    // GET LOCAL USERS
    // =====================================================

    const getLocalUsers = () => {
        try {
            const users = JSON.parse(
                localStorage.getItem("fincore_users") || "[]"
            );

            return Array.isArray(users) ? users : [];
        } catch (error) {
            console.error(
                "Unable to read fincore_users:",
                error
            );

            return [];
        }
    };

    // =====================================================
    // SAVE LOCAL USERS
    // =====================================================

    const saveLocalUsers = (users) => {
        localStorage.setItem(
            "fincore_users",
            JSON.stringify(users)
        );
    };

    // =====================================================
    // REGISTER
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // =================================================
        // NORMALIZED VALUES
        // =================================================

        const firstName =
            form.firstName.trim();

        const lastName =
            form.lastName.trim();

        const email =
            form.email.trim().toLowerCase();

        const phone =
            form.phone.trim();

        const address =
            form.address.trim();

        const city =
            form.city.trim();

        const state =
            form.state.trim();

        const postalCode =
            form.postalCode.trim();

        // =================================================
        // VALIDATION
        // =================================================

        if (
            !firstName ||
            !lastName ||
            !email ||
            !phone ||
            !address ||
            !city ||
            !state ||
            !postalCode ||
            !form.password ||
            !form.confirmPassword
        ) {
            setError(
                "Please fill all required fields."
            );

            return;
        }

        // =================================================
        // EMAIL VALIDATION
        // =================================================

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            setError(
                "Please enter a valid email address."
            );

            return;
        }

        // =================================================
        // PASSWORD VALIDATION
        // =================================================

        if (form.password.length < 6) {
            setError(
                "Password must contain at least 6 characters."
            );

            return;
        }

        if (
            form.password !==
            form.confirmPassword
        ) {
            setError(
                "Passwords do not match."
            );

            return;
        }

        // =================================================
        // PHONE VALIDATION
        // =================================================

        if (!/^[0-9]{10,15}$/.test(phone)) {
            setError(
                "Phone number must contain 10 to 15 digits."
            );

            return;
        }

        // =================================================
        // GET EXISTING LOCAL USERS
        // =================================================

        const users = getLocalUsers();

        // =================================================
        // CHECK DUPLICATE EMAIL LOCALLY
        // =================================================

        const emailExists = users.some(
            (user) =>
                String(user?.email || "")
                    .trim()
                    .toLowerCase() === email
        );

        if (emailExists) {
            setError(
                "An account with this email already exists. Please login instead."
            );

            return;
        }

        setLoading(true);

        try {
            // =================================================
            // ADMIN REGISTRATION
            // =================================================

            if (role === "ADMIN") {
                const adminUser = {
                    id: `ADMIN-${Date.now()}`,

                    name:
                        `${firstName} ${lastName}`,

                    firstName,

                    lastName,

                    email,

                    password:
                    form.password,

                    role: "ADMIN",

                    status: "ACTIVE",

                    createdAt:
                        new Date().toISOString(),
                };

                users.push(adminUser);

                saveLocalUsers(users);

                saveUser(adminUser);

                setSuccess(
                    "Admin registration successful! Redirecting to login..."
                );

                setTimeout(() => {
                    navigate("/login");
                }, 1500);

                return;
            }

            // =================================================
            // CUSTOMER REGISTRATION
            // =================================================

            const customerRequest = {
                firstName,

                lastName,

                email,

                phone,

                address,

                city,

                state,

                postalCode,
            };

            console.log(
                "Creating customer:",
                customerRequest
            );

            // =================================================
            // CREATE CUSTOMER IN BACKEND
            // =================================================

            const response =
                await axios.post(
                    CUSTOMER_API,
                    customerRequest,
                    {
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                    }
                );

            const customer =
                response.data;

            console.log(
                "Customer created:",
                customer
            );

            // =================================================
            // VERIFY BACKEND RESPONSE
            // =================================================

            if (
                !customer ||
                !customer.id
            ) {
                throw new Error(
                    "Customer Service did not return a valid Customer ID."
                );
            }

            // =================================================
            // MAKE SURE EMAIL IS NORMALIZED
            // =================================================

            const customerEmail =
                String(
                    customer.email ||
                    email
                )
                    .trim()
                    .toLowerCase();

            // =================================================
            // CREATE CUSTOMER LOGIN USER
            // =================================================

            const customerUser = {
                // =============================================
                // REAL BACKEND CUSTOMER ID
                // =============================================

                id: customer.id,

                customerId:
                customer.id,

                // =============================================
                // CUSTOMER NUMBER
                // =============================================

                customerNumber:
                    customer.customerNumber ||
                    "",

                // =============================================
                // PERSONAL INFORMATION
                // =============================================

                name:
                    `${customer.firstName || firstName} ${
                        customer.lastName || lastName
                    }`.trim(),

                firstName:
                    customer.firstName ||
                    firstName,

                lastName:
                    customer.lastName ||
                    lastName,

                email:
                customerEmail,

                phone:
                    customer.phone ||
                    phone,

                address:
                    customer.address ||
                    address,

                city:
                    customer.city ||
                    city,

                state:
                    customer.state ||
                    state,

                postalCode:
                    customer.postalCode ||
                    postalCode,

                // =============================================
                // LOGIN CREDENTIAL
                // =============================================

                password:
                form.password,

                // =============================================
                // ROLE
                // =============================================

                role: "CUSTOMER",

                // =============================================
                // STATUS
                // =============================================

                status:
                    customer.status ||
                    "ACTIVE",

                // =============================================
                // COMPLETE BACKEND PROFILE
                // =============================================

                customerProfile:
                customer,

                // =============================================
                // CREATED TIME
                // =============================================

                createdAt:
                    new Date().toISOString(),
            };

            console.log(
                "Saving customer login user:",
                customerUser
            );

            // =================================================
            // SAVE CUSTOMER TO fincore_users
            // =================================================

            users.push(customerUser);

            saveLocalUsers(users);

            // =================================================
            // SAVE CUSTOMER PROFILE
            // =================================================

            localStorage.setItem(
                "fincore_customer",
                JSON.stringify(customer)
            );

            // =================================================
            // DO NOT MAKE CUSTOMER AUTOMATICALLY LOGGED IN
            // =================================================
            //
            // Registration only creates the account.
            // User must login using email/password.
            //

            localStorage.removeItem(
                "user"
            );

            localStorage.removeItem(
                "customer"
            );

            // =================================================
            // SUCCESS MESSAGE
            // =================================================

            setSuccess(
                `Customer created successfully! Customer ID: ${
                    customer.customerNumber ||
                    customer.id
                }. Redirecting to login...`
            );

            // =================================================
            // REDIRECT TO LOGIN
            // =================================================

            setTimeout(() => {
                navigate("/login");
            }, 1800);

        } catch (err) {
            console.error(
                "Customer registration error:",
                err
            );

            // =================================================
            // BACKEND ERROR
            // =================================================

            if (err.response) {
                const backendData =
                    err.response.data;

                console.error(
                    "Backend registration error:",
                    backendData
                );

                if (
                    typeof backendData ===
                    "object" &&
                    backendData !== null
                ) {
                    // =========================================
                    // VALIDATION ERRORS
                    // =========================================

                    if (
                        backendData.errors
                    ) {
                        const validationErrors =
                            Object.entries(
                                backendData.errors
                            )
                                .map(
                                    ([field, message]) =>
                                        `${field}: ${message}`
                                )
                                .join(", ");

                        setError(
                            validationErrors ||
                            "Customer validation failed."
                        );
                    }

                        // =========================================
                        // NORMAL ERROR MESSAGE
                    // =========================================

                    else {
                        setError(
                            backendData.message ||
                            backendData.error ||
                            "Customer creation failed."
                        );
                    }
                } else {
                    setError(
                        backendData ||
                        "Customer creation failed."
                    );
                }
            }

                // =================================================
                // NETWORK ERROR
            // =================================================

            else if (
                err.request
            ) {
                setError(
                    "Customer Service could not be reached. Make sure API Gateway and Customer Service are running."
                );
            }

                // =================================================
                // OTHER ERROR
            // =================================================

            else {
                setError(
                    err.message ||
                    "Customer registration failed."
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
                    LEFT BRAND
                ================================================= */}

                <div className="auth-brand">

                    <div className="auth-logo">
                        FN
                    </div>

                    <h1>
                        FinCore
                        <span>NEXUS</span>
                    </h1>

                    <p>
                        Enterprise Digital Banking Platform
                    </p>

                    <div className="auth-feature">

                        <ShieldCheck
                            size={20}
                        />

                        <div>
                            <strong>
                                Secure banking
                            </strong>

                            <span>
                                Role-based access for
                                customers and administrators.
                            </span>
                        </div>

                    </div>

                    <div className="auth-feature">

                        <UserRound
                            size={20}
                        />

                        <div>
                            <strong>
                                One platform
                            </strong>

                            <span>
                                Accounts, transactions,
                                loans and payments.
                            </span>
                        </div>

                    </div>

                </div>

                {/* =================================================
                    REGISTER CARD
                ================================================= */}

                <div className="auth-card">

                    <div className="auth-heading">

                        <span>
                            CREATE ACCOUNT
                        </span>

                        <h2>
                            Register
                        </h2>

                        <p>
                            Create your FinCore Nexus account.
                        </p>

                    </div>

                    {/* =================================================
                        ACCOUNT TYPE
                    ================================================= */}

                    <label>
                        Account Type
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
                                setRole(
                                    "CUSTOMER"
                                );

                                setError("");
                                setSuccess("");
                            }}
                        >

                            <UserRound
                                size={22}
                            />

                            <div>
                                <strong>
                                    Customer
                                </strong>

                                <span>
                                    Personal banking
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
                                setRole(
                                    "ADMIN"
                                );

                                setError("");
                                setSuccess("");
                            }}
                        >

                            <ShieldCheck
                                size={22}
                            />

                            <div>
                                <strong>
                                    Admin
                                </strong>

                                <span>
                                    Banking management
                                </span>
                            </div>

                        </button>

                    </div>

                    {/* =================================================
                        FORM
                    ================================================= */}

                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >

                        {/* FIRST / LAST NAME */}

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "1fr 1fr",
                                gap: "12px",
                            }}
                        >

                            <div>

                                <label>
                                    First Name
                                </label>

                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="First name"
                                    value={
                                        form.firstName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>

                            <div>

                                <label>
                                    Last Name
                                </label>

                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Last name"
                                    value={
                                        form.lastName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>

                        </div>

                        {/* EMAIL */}

                        <label>
                            Email Address
                        </label>

                        <input
                            type="email"
                            name="email"
                            placeholder="customer@example.com"
                            value={
                                form.email
                            }
                            onChange={
                                handleChange
                            }
                            required
                        />

                        {/* PHONE */}

                        <label>
                            Phone Number
                        </label>

                        <input
                            type="tel"
                            name="phone"
                            placeholder="9876543210"
                            value={
                                form.phone
                            }
                            onChange={
                                handleChange
                            }
                            maxLength={15}
                            required
                        />

                        {/* ADDRESS */}

                        <label>
                            Address
                        </label>

                        <textarea
                            name="address"
                            placeholder="Enter your street address"
                            value={
                                form.address
                            }
                            onChange={
                                handleChange
                            }
                            rows="3"
                            required
                            style={{
                                width: "100%",
                                boxSizing:
                                    "border-box",
                                resize: "vertical",
                                padding:
                                    "11px 12px",
                                border:
                                    "1px solid #d0d5dd",
                                borderRadius:
                                    "8px",
                                fontFamily:
                                    "inherit",
                                fontSize:
                                    "12px",
                            }}
                        />

                        {/* CITY / STATE */}

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "1fr 1fr",
                                gap: "12px",
                            }}
                        >

                            <div>

                                <label>
                                    City
                                </label>

                                <input
                                    type="text"
                                    name="city"
                                    placeholder="Hyderabad"
                                    value={
                                        form.city
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>

                            <div>

                                <label>
                                    State
                                </label>

                                <input
                                    type="text"
                                    name="state"
                                    placeholder="Andhra Pradesh"
                                    value={
                                        form.state
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>

                        </div>

                        {/* POSTAL CODE */}

                        <label>
                            Postal Code
                        </label>

                        <input
                            type="text"
                            name="postalCode"
                            placeholder="515411"
                            value={
                                form.postalCode
                            }
                            onChange={
                                handleChange
                            }
                            required
                        />

                        {/* PASSWORD */}

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
                                name="password"
                                placeholder="Create a password"
                                value={
                                    form.password
                                }
                                onChange={
                                    handleChange
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
                                    <EyeOff
                                        size={18}
                                    />
                                ) : (
                                    <Eye
                                        size={18}
                                    />
                                )}
                            </button>

                        </div>

                        {/* CONFIRM PASSWORD */}

                        <label>
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={
                                form.confirmPassword
                            }
                            onChange={
                                handleChange
                            }
                            required
                        />

                        {/* ERROR */}

                        {error && (
                            <div className="auth-error">
                                {error}
                            </div>
                        )}

                        {/* SUCCESS */}

                        {success && (
                            <div className="auth-success">
                                {success}
                            </div>
                        )}

                        {/* SUBMIT */}

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={
                                loading
                            }
                        >

                            {loading
                                ? "Creating account..."
                                : `Create ${
                                    role ===
                                    "ADMIN"
                                        ? "Admin"
                                        : "Customer"
                                } Account`}

                            {!loading && (
                                <ArrowRight
                                    size={18}
                                />
                            )}

                        </button>

                    </form>

                    {/* =================================================
                        LOGIN
                    ================================================= */}

                    <p className="auth-switch">

                        Already have an account?

                        <Link to="/login">
                            Login
                        </Link>

                    </p>

                </div>

            </div>

        </div>
    );
}

export default Register;