import {
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

// =====================================================
// AUTH
// =====================================================

import Login from "./pages/Login";
import Register from "./pages/Register";


// =====================================================
// ADMIN PAGES
// =====================================================

import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import Loans from "./pages/Loans";
import Payments from "./pages/Payments";
import KycManagement from "./pages/KycManagement";


// =====================================================
// CUSTOMER PAGES
// =====================================================

import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerAccounts from "./pages/customer/CustomerAccounts";
import CustomerTransactions from "./pages/customer/CustomerTransactions";
import CustomerLoans from "./pages/customer/CustomerLoans";
import CustomerPayments from "./pages/customer/CustomerPayments";
import CustomerKyc from "./pages/customer/CustomerKyc";
import CustomerProfile from "./pages/customer/CustomerProfile";


// =====================================================
// APP
// =====================================================

function App() {

    return (

        <Routes>

            {/* =================================================
                DEFAULT
            ================================================= */}

            <Route
                path="/"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />


            {/* =================================================
                AUTH
            ================================================= */}

            <Route
                path="/login"
                element={
                    <Login />
                }
            />

            <Route
                path="/register"
                element={
                    <Register />
                }
            />


            {/* =================================================
                ADMIN
            ================================================= */}

            <Route
                path="/dashboard"
                element={
                    <Dashboard />
                }
            />

            <Route
                path="/customers"
                element={
                    <Customers />
                }
            />

            <Route
                path="/accounts"
                element={
                    <Accounts />
                }
            />

            <Route
                path="/transactions"
                element={
                    <Transactions />
                }
            />

            <Route
                path="/loans"
                element={
                    <Loans />
                }
            />

            <Route
                path="/payments"
                element={
                    <Payments />
                }
            />

            <Route
                path="/kyc-management"
                element={
                    <KycManagement />
                }
            />


            {/* =================================================
                CUSTOMER
            ================================================= */}

            <Route
                path="/customer-dashboard"
                element={
                    <CustomerDashboard />
                }
            />

            <Route
                path="/customer-accounts"
                element={
                    <CustomerAccounts />
                }
            />

            <Route
                path="/customer-transactions"
                element={
                    <CustomerTransactions />
                }
            />

            <Route
                path="/customer-loans"
                element={
                    <CustomerLoans />
                }
            />

            <Route
                path="/customer-payments"
                element={
                    <CustomerPayments />
                }
            />

            <Route
                path="/customer-kyc"
                element={
                    <CustomerKyc />
                }
            />

            <Route
                path="/customer-profile"
                element={
                    <CustomerProfile />
                }
            />


            {/* =================================================
                UNKNOWN ROUTE
            ================================================= */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />

        </Routes>

    );
}

export default App;