import Modal from "./Modal";

function ConfirmDialog({ title, message, confirmLabel = "Confirm", danger, onConfirm, onCancel, loading }) {
    return (
        <Modal title={title} onClose={onCancel}>
            <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 4px" }}>{message}</p>
            <div className="modal-actions">
                <button className="btn-secondary" onClick={onCancel} disabled={loading}>
                    Cancel
                </button>
                <button
                    className="btn-primary"
                    style={danger ? { background: "#ef4444" } : undefined}
                    onClick={onConfirm}
                    disabled={loading}
                >
                    {loading ? "Please wait..." : confirmLabel}
                </button>
            </div>
        </Modal>
    );
}

export default ConfirmDialog;
