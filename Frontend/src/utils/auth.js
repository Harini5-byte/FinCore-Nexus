// =====================================================
// AUTH UTILITIES
// =====================================================


// =====================================================
// SAVE CURRENT LOGGED-IN USER
// =====================================================

export const saveUser = (user) => {

    if (!user) {
        console.error(
            "saveUser: user is missing"
        );

        return;
    }

    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );

    console.log(
        "Current user saved:",
        user
    );
};


// =====================================================
// GET CURRENT LOGGED-IN USER
// =====================================================

export const getUser = () => {

    try {

        const savedUser =
            localStorage.getItem("user");

        if (!savedUser) {
            return null;
        }

        return JSON.parse(savedUser);

    } catch (error) {

        console.error(
            "Error reading logged-in user:",
            error
        );

        return null;
    }
};


// =====================================================
// CHECK LOGIN
// =====================================================

export const isLoggedIn = () => {

    const user =
        localStorage.getItem("user");

    return !!user;
};


// =====================================================
// GET ROLE
// =====================================================

export const getUserRole = () => {

    const user = getUser();

    return String(
        user?.role || ""
    ).toUpperCase();
};


// =====================================================
// GET CUSTOMER ID
// =====================================================

export const getCustomerId = () => {

    const user = getUser();

    if (!user) {
        return null;
    }

    return (
        user.customerId ||
        user.id ||
        null
    );
};


// =====================================================
// GET REGISTERED USERS
// =====================================================
// IMPORTANT:
// This reads fincore_users but NEVER deletes it.
//
// fincore_users contains registered customer
// login credentials and must survive logout.
// =====================================================

export const getRegisteredUsers = () => {

    try {

        const users =
            JSON.parse(
                localStorage.getItem(
                    "fincore_users"
                ) || "[]"
            );

        return Array.isArray(users)
            ? users
            : [];

    } catch (error) {

        console.error(
            "Error reading registered users:",
            error
        );

        return [];
    }
};


// =====================================================
// LOGOUT
// =====================================================
// IMPORTANT:
// Logout removes ONLY the current session.
//
// It DOES NOT remove:
//     fincore_users
//
// Therefore customers can login again after logout.
// =====================================================

export const logout = () => {

    console.log(
        "Logging out current user..."
    );


    // =================================================
    // REMOVE CURRENT LOGIN SESSION
    // =================================================

    localStorage.removeItem(
        "user"
    );


    // =================================================
    // REMOVE CUSTOMER SESSION DATA
    // =================================================

    localStorage.removeItem(
        "customer"
    );

    localStorage.removeItem(
        "fincore_customer"
    );


    // =================================================
    // REMOVE ADMIN SESSION DATA
    // =================================================

    localStorage.removeItem(
        "admin"
    );

    localStorage.removeItem(
        "fincore_admin"
    );


    // =================================================
    // OLD KEY
    // =================================================
    // This is NOT the registered-users database.
    // It is safe to remove if it exists.

    localStorage.removeItem(
        "fincore_user"
    );


    // =================================================
    // DO NOT REMOVE THIS
    // =================================================
    //
    // localStorage.removeItem("fincore_users");
    //
    // NEVER delete fincore_users during logout.
    //
    // It contains:
    //
    // email
    // password
    // role
    // customerId
    // customer profile
    //
    // =================================================


    console.log(
        "Logout completed."
    );


    console.log(
        "Registered users preserved:",
        getRegisteredUsers()
    );
};


// =====================================================
// CLEAR AUTH
// =====================================================
// Used when you intentionally want to clear the
// CURRENT authentication/session.
//
// IMPORTANT:
// It also preserves fincore_users.
// =====================================================

export const clearAuth = () => {

    // Current session
    localStorage.removeItem(
        "user"
    );

    // Customer session
    localStorage.removeItem(
        "customer"
    );

    localStorage.removeItem(
        "fincore_customer"
    );

    // Admin session
    localStorage.removeItem(
        "admin"
    );

    localStorage.removeItem(
        "fincore_admin"
    );

    // Old unused key
    localStorage.removeItem(
        "fincore_user"
    );


    // =================================================
    // DO NOT DELETE:
    //
    // localStorage.removeItem("fincore_users");
    // =================================================


    console.log(
        "Authentication session cleared."
    );
};