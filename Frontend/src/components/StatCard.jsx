import { TrendingUp, TrendingDown } from "lucide-react";

// Reusable version of the StatCard already defined locally inside Dashboard.jsx.
// Same props/classNames, so it drops into any page without new CSS.
function StatCard({ icon, title, value, change, positive, subtitle, iconClass }) {
    return (
        <div className="stat-card">
            <div className="stat-card-top">
                <div className={`stat-icon ${iconClass}`}>{icon}</div>

                {change && (
                    <span className={positive ? "positive" : "negative"}>
                        {positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        {change}
                    </span>
                )}
            </div>

            <span className="stat-title">{title}</span>
            <strong className="stat-value">{value}</strong>
            {subtitle && <span className="stat-subtitle">{subtitle}</span>}
        </div>
    );
}

export default StatCard;
