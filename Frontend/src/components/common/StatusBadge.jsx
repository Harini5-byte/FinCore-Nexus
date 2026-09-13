// Maps arbitrary backend status strings (ACTIVE, PENDING, APPROVED, FAILED, etc.)
// to a consistent badge color without needing a hardcoded enum per service.
const COLOR_MAP = {
    ACTIVE: "green",
    APPROVED: "green",
    PROCESSED: "green",
    COMPLETED: "green",
    SUCCESS: "green",

    PENDING: "amber",
    PROCESSING: "amber",

    INACTIVE: "slate",
    CLOSED: "slate",
    CANCELLED: "slate",

    REJECTED: "red",
    FAILED: "red",
    DEFAULTED: "red",
};

function StatusBadge({ status }) {
    const color = COLOR_MAP[status?.toUpperCase()] || "blue";
    return <span className={`badge badge-${color}`}>{status}</span>;
}

export default StatusBadge;
