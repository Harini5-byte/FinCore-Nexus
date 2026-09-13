import { useEffect } from "react";

function Modal({ title, subtitle, onClose, children }) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <h2>{title}</h2>
                {subtitle && <p className="modal-subtitle">{subtitle}</p>}
                {children}
            </div>
        </div>
    );
}

export default Modal;
