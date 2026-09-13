import { useState } from "react";
import Modal from "./Modal";

// Small reusable dialog for actions that just need one numeric amount
// (deposit, withdraw, loan repayment).
function PromptAmountDialog({ title, subtitle, confirmLabel = "Submit", onConfirm, onCancel, loading }) {
    const [amount, setAmount] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = () => {
        const value = Number(amount);
        if (!amount || isNaN(value) || value <= 0) {
            setError("Enter an amount greater than 0");
            return;
        }
        setError("");
        onConfirm(value);
    };

    return (
        <Modal title={title} subtitle={subtitle} onClose={onCancel}>
            <div className="form-group">
                <label>Amount (₹)</label>
                <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    autoFocus
                />
                {error && <div className="field-error">{error}</div>}
            </div>
            <div className="modal-actions">
                <button className="btn-secondary" onClick={onCancel} disabled={loading}>
                    Cancel
                </button>
                <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Please wait..." : confirmLabel}
                </button>
            </div>
        </Modal>
    );
}

export default PromptAmountDialog;
