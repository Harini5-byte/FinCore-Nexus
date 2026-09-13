import {
    useEffect,
    useState,
} from "react";

import axios from "axios";

import {
    UserCircle,
    Mail,
    Phone,
    MapPin,
    Hash,
    RefreshCw,
    ShieldCheck,
} from "lucide-react";

import CustomerLayout from "../../components/layout/CustomerLayout";

import "./CustomerProfile.css";

const CUSTOMER_API =
    "http://localhost:8080/api/customers";


function getLoggedInUser() {

    const keys = [
        "user",
        "fincore_user",
        "loggedInUser",
        "customer",
    ];

    for (const key of keys) {

        const value =
            localStorage.getItem(key);

        if (!value) {
            continue;
        }

        try {

            const parsed =
                JSON.parse(value);

            if (
                parsed &&
                typeof parsed === "object"
            ) {
                return parsed;
            }

        } catch (error) {

            console.error(
                `Invalid ${key} data`,
                error
            );

        }
    }

    return null;
}


function CustomerProfile() {

    const [customer, setCustomer] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const loadCustomer = async () => {

        try {

            setLoading(true);
            setError("");

            const user =
                getLoggedInUser();

            console.log(
                "PROFILE USER:",
                user
            );

            if (!user) {

                setError(
                    "No logged-in customer found."
                );

                return;
            }


            const customerId =
                user.customerId ||
                user.customerNumber ||
                user.id;


            /*
             * If the login object already contains
             * customer details, use them first.
             */

            if (
                user.firstName ||
                user.lastName ||
                user.email
            ) {

                setCustomer({
                    ...user,
                    id:
                        user.id ||
                        user.customerId,
                    customerId:
                        user.customerId ||
                        user.id,
                });

            }


            /*
             * Try loading from Customer Service.
             */

            try {

                if (customerId) {

                    const response =
                        await axios.get(
                            `${CUSTOMER_API}/${customerId}`
                        );

                    if (
                        response.data &&
                        typeof response.data ===
                        "object"
                    ) {

                        setCustomer(
                            response.data
                        );

                        return;
                    }
                }

            } catch (specificError) {

                console.warn(
                    "Specific customer endpoint unavailable:",
                    specificError
                );

            }


            /*
             * Fallback: get all customers.
             */

            try {

                const response =
                    await axios.get(
                        CUSTOMER_API
                    );

                const data =
                    Array.isArray(
                        response.data
                    )
                        ? response.data
                        : response.data?.content ||
                        response.data?.customers ||
                        [];


                if (customerId) {

                    const matched =
                        data.find(
                            (item) =>
                                String(
                                    item.id ??
                                    item.customerId ??
                                    item.customerNumber
                                ) ===
                                String(
                                    customerId
                                )
                        );

                    if (matched) {

                        setCustomer(
                            matched
                        );

                        return;
                    }
                }


                /*
                 * If the backend doesn't expose
                 * customer ID in login data,
                 * display the login profile itself.
                 */

                if (user.email) {

                    const emailMatched =
                        data.find(
                            (item) =>
                                String(
                                    item.email ||
                                    ""
                                ).toLowerCase() ===
                                String(
                                    user.email
                                ).toLowerCase()
                        );

                    if (emailMatched) {

                        setCustomer(
                            emailMatched
                        );

                        return;
                    }
                }

            } catch (allCustomerError) {

                console.warn(
                    "Unable to load customer list:",
                    allCustomerError
                );

            }


            /*
             * If we already have user information,
             * don't show a false error.
             */

            if (
                user.firstName ||
                user.lastName ||
                user.email
            ) {

                setCustomer(user);

            } else {

                setError(
                    "Customer profile could not be found."
                );

            }

        } catch (err) {

            console.error(
                "Profile error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load customer profile."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadCustomer();

    }, []);


    if (loading) {

        return (
            <CustomerLayout>

                <div className="customer-profile-page">

                    <div className="profile-loading">

                        <div className="profile-spinner"></div>

                        <span>
                            Loading your profile...
                        </span>

                    </div>

                </div>

            </CustomerLayout>
        );
    }


    if (error) {

        return (
            <CustomerLayout>

                <div className="customer-profile-page">

                    <div className="profile-page-header">

                        <div>

                            <span className="profile-eyebrow">
                                FINCORE NEXUS / CUSTOMER
                            </span>

                            <h1>
                                My Profile
                            </h1>

                            <p>
                                Your customer profile information.
                            </p>

                        </div>

                        <button
                            className="profile-refresh-button"
                            onClick={loadCustomer}
                        >
                            <RefreshCw size={17} />

                            Refresh
                        </button>

                    </div>


                    <div className="profile-error">

                        <ShieldCheck size={42} />

                        <h2>
                            Unable to load profile
                        </h2>

                        <p>
                            {error}
                        </p>

                        <button
                            className="profile-refresh-button"
                            onClick={loadCustomer}
                        >
                            <RefreshCw size={17} />

                            Try Again
                        </button>

                    </div>

                </div>

            </CustomerLayout>
        );
    }


    const firstName =
        customer?.firstName ||
        customer?.name ||
        "Customer";

    const lastName =
        customer?.lastName ||
        "";

    const email =
        customer?.email ||
        "-";

    const phone =
        customer?.phone ||
        customer?.phoneNumber ||
        "-";

    const id =
        customer?.id ||
        customer?.customerId ||
        "-";

    const customerNumber =
        customer?.customerNumber ||
        "-";

    const status =
        customer?.status ||
        "ACTIVE";


    return (
        <CustomerLayout>

            <div className="customer-profile-page">

                {/* HEADER */}

                <div className="profile-page-header">

                    <div>

                        <span className="profile-eyebrow">
                            FINCORE NEXUS / CUSTOMER
                        </span>

                        <h1>
                            My Profile
                        </h1>

                        <p>
                            View your personal and banking
                            customer information.
                        </p>

                    </div>

                    <button
                        className="profile-refresh-button"
                        onClick={loadCustomer}
                    >
                        <RefreshCw size={17} />

                        Refresh
                    </button>

                </div>


                {/* HERO */}

                <div className="profile-hero">

                    <div className="profile-avatar">
                        <UserCircle size={58} />
                    </div>

                    <div className="profile-hero-info">

                        <span>
                            CUSTOMER PROFILE
                        </span>

                        <h2>
                            {firstName} {lastName}
                        </h2>

                        <p>
                            {email}
                        </p>

                    </div>

                    <div className="profile-status">

                        <span></span>

                        {status}

                    </div>

                </div>


                {/* PERSONAL INFORMATION */}

                <div className="profile-section">

                    <div className="profile-section-header">

                        <div>

                            <span>
                                PERSONAL INFORMATION
                            </span>

                            <h2>
                                Customer details
                            </h2>

                        </div>

                    </div>


                    <div className="profile-info-grid">

                        <div className="profile-info-card">

                            <div className="profile-info-icon">
                                <UserCircle size={20} />
                            </div>

                            <div>
                                <span>
                                    First Name
                                </span>

                                <strong>
                                    {firstName}
                                </strong>
                            </div>

                        </div>


                        <div className="profile-info-card">

                            <div className="profile-info-icon">
                                <UserCircle size={20} />
                            </div>

                            <div>
                                <span>
                                    Last Name
                                </span>

                                <strong>
                                    {lastName || "-"}
                                </strong>
                            </div>

                        </div>


                        <div className="profile-info-card">

                            <div className="profile-info-icon">
                                <Mail size={20} />
                            </div>

                            <div>
                                <span>
                                    Email Address
                                </span>

                                <strong>
                                    {email}
                                </strong>
                            </div>

                        </div>


                        <div className="profile-info-card">

                            <div className="profile-info-icon">
                                <Phone size={20} />
                            </div>

                            <div>
                                <span>
                                    Phone Number
                                </span>

                                <strong>
                                    {phone}
                                </strong>
                            </div>

                        </div>


                        <div className="profile-info-card">

                            <div className="profile-info-icon">
                                <Hash size={20} />
                            </div>

                            <div>
                                <span>
                                    Customer ID
                                </span>

                                <strong>
                                    {id}
                                </strong>
                            </div>

                        </div>


                        <div className="profile-info-card">

                            <div className="profile-info-icon">
                                <Hash size={20} />
                            </div>

                            <div>
                                <span>
                                    Customer Number
                                </span>

                                <strong>
                                    {customerNumber}
                                </strong>
                            </div>

                        </div>

                    </div>

                </div>


                {/* ADDRESS */}

                <div className="profile-section">

                    <div className="profile-section-header">

                        <div>

                            <span>
                                ADDRESS INFORMATION
                            </span>

                            <h2>
                                Residential address
                            </h2>

                        </div>

                    </div>


                    <div className="profile-address-card">

                        <div className="profile-address-icon">
                            <MapPin size={25} />
                        </div>

                        <div>

                            <span>
                                Address
                            </span>

                            <strong>
                                {customer?.address || "-"}
                            </strong>

                        </div>

                    </div>


                    <div className="profile-info-grid address-grid">

                        <div className="profile-info-card">

                            <div className="profile-info-icon">
                                <MapPin size={20} />
                            </div>

                            <div>
                                <span>
                                    City
                                </span>

                                <strong>
                                    {customer?.city || "-"}
                                </strong>
                            </div>

                        </div>


                        <div className="profile-info-card">

                            <div className="profile-info-icon">
                                <MapPin size={20} />
                            </div>

                            <div>
                                <span>
                                    State
                                </span>

                                <strong>
                                    {customer?.state || "-"}
                                </strong>
                            </div>

                        </div>


                        <div className="profile-info-card">

                            <div className="profile-info-icon">
                                <Hash size={20} />
                            </div>

                            <div>
                                <span>
                                    Postal Code
                                </span>

                                <strong>
                                    {customer?.postalCode || "-"}
                                </strong>
                            </div>

                        </div>

                    </div>

                </div>


                {/* STATUS */}

                <div className="profile-security-card">

                    <div className="profile-security-icon">
                        <ShieldCheck size={25} />
                    </div>

                    <div>

                        <strong>
                            Customer account status
                        </strong>

                        <p>
                            Your FinCore Nexus customer
                            profile is currently{" "}
                            <b>
                                {status}
                            </b>.
                        </p>

                    </div>

                </div>

            </div>

        </CustomerLayout>
    );
}

export default CustomerProfile;