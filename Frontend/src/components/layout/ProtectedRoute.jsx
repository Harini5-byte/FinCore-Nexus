import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn, getRole } from "../../utils/auth";

function ProtectedRoute({
                            children,
                            allowedRoles = [],
                        }) {

    const location = useLocation();

    const loggedIn = isLoggedIn();
    const role = getRole();


    // ==========================================
    // NOT LOGGED IN
    // ==========================================

    if (!loggedIn) {

        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname,
                }}
            />
        );
    }


    // ==========================================
    // ROLE CHECK
    // ==========================================

    if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(role)
    ) {

        // CUSTOMER → CUSTOMER AREA

        if (role === "CUSTOMER") {

            return (
                <Navigate
                    to="/customer-dashboard"
                    replace
                />
            );
        }


        // ADMIN → ADMIN AREA

        if (role === "ADMIN") {

            return (
                <Navigate
                    to="/dashboard"
                    replace
                />
            );
        }


        // UNKNOWN ROLE

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    // ==========================================
    // AUTHORIZED
    // ==========================================

    return children;
}

export default ProtectedRoute;