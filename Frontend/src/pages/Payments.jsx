import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { paymentApi, transactionApi } from "../services/api";
import { X, Plus } from "lucide-react";
import "./Payments.css";

function Payments() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const EMPTY_FORM = {
        customerId: "",
        accountId: "",
        loanId: "",
        amount: "",
        paymentType: "EMI",
        paymentMethod: "UPI",
        description: "",
    };

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);

    const openCreateModal = () => {
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setForm(EMPTY_FORM);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const createPayment = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                customerId: Number(form.customerId),
                accountId: form.accountId ? Number(form.accountId) : null,
                loanId: form.loanId ? Number(form.loanId) : null,
                amount: Number(form.amount),
                paymentType: form.paymentType,
                paymentMethod: form.paymentMethod,
                description: form.description || null,
            };

            const created = await paymentApi.create(payload);
            const paymentId = created.data?.id;

            if (paymentId) {
                try {
                    await paymentApi.process(paymentId);
                } catch (processError) {
                    console.error(
                        "Payment created but could not be marked successful:",
                        processError
                    );
                }
            }

            try {
                await transactionApi.create({
                    accountId: payload.accountId,
                    customerId: payload.customerId,
                    amount: payload.amount,
                    transactionType: payload.paymentType,
                    description:
                        payload.description ||
                        `Payment via ${form.paymentMethod}`,
                });
            } catch (txnError) {
                console.error(
                    "Payment succeeded but transaction record failed:",
                    txnError
                );
            }

            alert("Payment created successfully.");

            closeModal();

            await loadPayments();
        } catch (error) {
            console.error("Create payment error:", error);

            alert(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Unable to create payment."
            );
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            const response = await paymentApi.getAll();

            setPayments(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (error) {
            console.error("Payment service error:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatus = (payment) =>
        payment.status ||
        payment.paymentStatus ||
        "PENDING";

    return (
        <div className="app-layout">

            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="main-area">

                <Navbar
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="dashboard payments-page">

                    <div className="page-heading">

                        <div>
                            <span className="eyebrow">
                                PAYMENT SERVICE
                            </span>

                            <h1>Payments</h1>

                            <p>
                                Monitor payment processing and
                                payment operations across FinCore Nexus.
                            </p>
                        </div>

                        <button
                            className="primary-btn"
                            onClick={openCreateModal}
                        >
                            + Create Payment
                        </button>

                    </div>


                    {/* SUMMARY */}

                    <div className="payment-summary-grid">

                        <div className="payment-summary-card">

                            <div className="payment-summary-icon purple">
                                ₹
                            </div>

                            <div>
                                <span>Total Payments</span>

                                <strong>
                                    {payments.length}
                                </strong>

                                <small>
                                    All payment records
                                </small>
                            </div>

                        </div>


                        <div className="payment-summary-card">

                            <div className="payment-summary-icon green">
                                ✓
                            </div>

                            <div>
                                <span>Successful</span>

                                <strong>
                                    {
                                        payments.filter(
                                            (payment) =>
                                                getStatus(payment)
                                                    .toLowerCase() ===
                                                "completed" ||
                                                getStatus(payment)
                                                    .toLowerCase() ===
                                                "success" ||
                                                getStatus(payment)
                                                    .toLowerCase() ===
                                                "successful"
                                        ).length
                                    }
                                </strong>

                                <small>
                                    Successfully processed
                                </small>
                            </div>

                        </div>


                        <div className="payment-summary-card">

                            <div className="payment-summary-icon orange">
                                ◷
                            </div>

                            <div>
                                <span>Pending</span>

                                <strong>
                                    {
                                        payments.filter(
                                            (payment) =>
                                                getStatus(payment)
                                                    .toLowerCase() ===
                                                "pending"
                                        ).length
                                    }
                                </strong>

                                <small>
                                    Awaiting processing
                                </small>
                            </div>

                        </div>


                        <div className="payment-summary-card">

                            <div className="payment-summary-icon blue">
                                ↗
                            </div>

                            <div>
                                <span>Total Volume</span>

                                <strong>
                                    ₹
                                    {payments
                                        .reduce(
                                            (total, payment) =>
                                                total +
                                                Number(
                                                    payment.amount ||
                                                    payment.paymentAmount ||
                                                    0
                                                ),
                                            0
                                        )
                                        .toLocaleString(
                                            "en-IN"
                                        )}
                                </strong>

                                <small>
                                    Payment transaction value
                                </small>
                            </div>

                        </div>

                    </div>


                    {/* TABLE */}

                    <div className="table-card">

                        <div className="table-header">

                            <div>
                                <h3>
                                    Payment Directory
                                </h3>

                                <span>
                                    {payments.length} payment records
                                </span>
                            </div>

                            <button
                                className="primary-btn secondary-btn"
                                onClick={loadPayments}
                            >
                                Refresh
                            </button>

                        </div>


                        {loading ? (

                            <div className="empty-state">
                                Loading payments...
                            </div>

                        ) : payments.length === 0 ? (

                            <div className="empty-state">
                                No payments found.
                            </div>

                        ) : (

                            <div className="table-wrapper">

                                <table>

                                    <thead>

                                    <tr>
                                        <th>ID</th>
                                        <th>Payment ID</th>
                                        <th>Customer ID</th>
                                        <th>Account ID</th>
                                        <th>Payment Type</th>
                                        <th>Payment Method</th>
                                        <th>Amount</th>
                                        <th>Fraud Status</th>
                                        <th>Status</th>
                                    </tr>

                                    </thead>


                                    <tbody>

                                    {payments.map(
                                        (payment, index) => {

                                            const status =
                                                getStatus(payment);

                                            return (

                                                <tr
                                                    key={
                                                        payment.id ||
                                                        payment.paymentId ||
                                                        index
                                                    }
                                                >

                                                    <td>
                                                        #
                                                        {
                                                            payment.id ||
                                                            index + 1
                                                        }
                                                    </td>


                                                    <td>

                                                        <strong>
                                                            {
                                                                payment.paymentId ||
                                                                payment.id ||
                                                                "N/A"
                                                            }
                                                        </strong>

                                                    </td>


                                                    <td>
                                                        {
                                                            payment.customerId ||
                                                            "N/A"
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            payment.accountId ||
                                                            "N/A"
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            payment.paymentType ||
                                                            payment.type ||
                                                            "Bank Transfer"
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            payment.paymentMethod ||
                                                            "N/A"
                                                        }
                                                    </td>


                                                    <td className="payment-amount">

                                                        ₹{" "}

                                                        {Number(
                                                            payment.amount ||
                                                            payment.paymentAmount ||
                                                            0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}

                                                    </td>


                                                    <td>

                                                        {payment.fraudStatus ? (

                                                            <span
                                                                className={`payment-status ${
                                                                    payment.fraudStatus
                                                                        .toLowerCase()
                                                                        .replace(
                                                                            /\s+/g,
                                                                            "-"
                                                                        )
                                                                }`}
                                                            >
                                                                {payment.fraudStatus}
                                                                {payment.riskScore != null
                                                                    ? ` (${payment.riskScore})`
                                                                    : ""}
                                                            </span>

                                                        ) : (

                                                            "N/A"

                                                        )}

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={`payment-status ${
                                                                status
                                                                    .toLowerCase()
                                                                    .replace(
                                                                        /\s+/g,
                                                                        "-"
                                                                    )
                                                            }`}
                                                        >
                                                            {status}
                                                        </span>

                                                    </td>

                                                </tr>

                                            );
                                        }
                                    )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                    {/* CREATE PAYMENT MODAL */}

                    {showModal && (
                        <div className="modal-overlay">

                            <div className="payment-modal">

                                <div className="modal-header">

                                    <div>
                                        <span>PAYMENT SERVICE</span>

                                        <h2>Create Payment</h2>

                                        <p>
                                            Record a new payment for a customer.
                                        </p>
                                    </div>

                                    <button
                                        className="modal-close"
                                        onClick={closeModal}
                                    >
                                        <X size={20} />
                                    </button>

                                </div>

                                <form onSubmit={createPayment}>

                                    <div className="form-group">
                                        <label>Customer ID</label>

                                        <input
                                            name="customerId"
                                            type="number"
                                            value={form.customerId}
                                            onChange={handleChange}
                                            placeholder="Example: 1"
                                            required
                                        />
                                    </div>

                                    <div className="form-row">

                                        <div className="form-group">
                                            <label>Account ID</label>

                                            <input
                                                name="accountId"
                                                type="number"
                                                value={form.accountId}
                                                onChange={handleChange}
                                                placeholder="Example: 1"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Loan ID (optional)</label>

                                            <input
                                                name="loanId"
                                                type="number"
                                                value={form.loanId}
                                                onChange={handleChange}
                                                placeholder="Example: 1"
                                            />
                                        </div>

                                    </div>

                                    <div className="form-group">
                                        <label>Amount</label>

                                        <input
                                            name="amount"
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={form.amount}
                                            onChange={handleChange}
                                            placeholder="5000"
                                            required
                                        />
                                    </div>

                                    <div className="form-row">

                                        <div className="form-group">
                                            <label>Payment Type</label>

                                            <select
                                                name="paymentType"
                                                value={form.paymentType}
                                                onChange={handleChange}
                                            >
                                                <option value="EMI">EMI</option>
                                                <option value="DEPOSIT">DEPOSIT</option>
                                                <option value="WITHDRAWAL">WITHDRAWAL</option>
                                                <option value="TRANSFER">TRANSFER</option>
                                                <option value="BILL">BILL</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Payment Method</label>

                                            <select
                                                name="paymentMethod"
                                                value={form.paymentMethod}
                                                onChange={handleChange}
                                            >
                                                <option value="UPI">UPI</option>
                                                <option value="CARD">CARD</option>
                                                <option value="NET_BANKING">NET_BANKING</option>
                                                <option value="CASH">CASH</option>
                                                <option value="CHEQUE">CHEQUE</option>
                                            </select>
                                        </div>

                                    </div>

                                    <div className="form-group">
                                        <label>Description (optional)</label>

                                        <input
                                            name="description"
                                            value={form.description}
                                            onChange={handleChange}
                                            placeholder="Enter a short note"
                                        />
                                    </div>

                                    <div className="form-actions">

                                        <button
                                            type="button"
                                            className="secondary-button"
                                            onClick={closeModal}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="primary-button"
                                            disabled={submitting}
                                        >
                                            <Plus size={17} />
                                            {submitting ? "Creating..." : "Create Payment"}
                                        </button>

                                    </div>

                                </form>

                            </div>

                        </div>
                    )}

                </main>

            </div>

        </div>
    );
}

export default Payments;