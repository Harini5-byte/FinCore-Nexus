import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        "Content-Type": "application/json",
    },
});


/* ================= CUSTOMER ================= */

export const customerApi = {
    getAll: () => API.get("/api/customers"),

    getById: (id) =>
        API.get(`/api/customers/${id}`),

    create: (data) =>
        API.post("/api/customers", data),

    update: (id, data) =>
        API.put(`/api/customers/${id}`, data),

    delete: (id) =>
        API.delete(`/api/customers/${id}`),
};


/* ================= ACCOUNT ================= */

export const accountApi = {

    getAll: () =>
        API.get("/api/accounts"),

    getById: (id) =>
        API.get(`/api/accounts/${id}`),

    getByNumber: (accountNumber) =>
        API.get(`/api/accounts/number/${accountNumber}`),

    getByCustomer: (customerId) =>
        API.get(`/api/accounts/customer/${customerId}`),

    create: (data) =>
        API.post("/api/accounts", data),

    deposit: (id, amount) =>
        API.put(`/api/accounts/${id}/deposit`, null, {
            params: { amount },
        }),

    withdraw: (id, amount) =>
        API.put(`/api/accounts/${id}/withdraw`, null, {
            params: { amount },
        }),

    activate: (id) =>
        API.put(`/api/accounts/${id}/activate`),

    deactivate: (id) =>
        API.put(`/api/accounts/${id}/deactivate`),

    delete: (id) =>
        API.delete(`/api/accounts/${id}`),
};


/* ================= TRANSACTION ================= */

export const transactionApi = {

    getAll: () =>
        API.get("/api/transactions"),

    getById: (id) =>
        API.get(`/api/transactions/${id}`),

    create: (data) =>
        API.post("/api/transactions", data),
};


/* ================= LOAN ================= */

export const loanApi = {

    getAll: () =>
        API.get("/api/loans"),

    getById: (id) =>
        API.get(`/api/loans/${id}`),

    getByNumber: (loanNumber) =>
        API.get(`/api/loans/number/${loanNumber}`),

    getByCustomer: (customerId) =>
        API.get(`/api/loans/customer/${customerId}`),

    getByStatus: (status) =>
        API.get(`/api/loans/status/${status}`),

    create: (data) =>
        API.post("/api/loans", data),

    approve: (id) =>
        API.put(`/api/loans/${id}/approve`),

    reject: (id) =>
        API.put(`/api/loans/${id}/reject`),

    close: (id) =>
        API.put(`/api/loans/${id}/close`),

    repay: (id, amount) =>
        API.put(`/api/loans/${id}/repay`, null, {
            params: { amount },
        }),

    delete: (id) =>
        API.delete(`/api/loans/${id}`),
};


/* ================= PAYMENT ================= */

export const paymentApi = {

    getAll: () =>
        API.get("/api/payments"),

    getById: (id) =>
        API.get(`/api/payments/${id}`),

    create: (data) =>
        API.post("/api/payments", data),

    process: (id) =>
        API.put(`/api/payments/${id}/process`),
};


export default API;