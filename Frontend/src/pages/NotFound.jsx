import { Link } from "react-router-dom";
import { Home, ArrowLeft, ShieldAlert } from "lucide-react";
import "./NotFound.css";

function NotFound() {
    return (
        <div className="not-found-page">

            <div className="not-found-card">

                <div className="not-found-icon">
                    <ShieldAlert size={32} />
                </div>

                <span className="not-found-eyebrow">
                    FINCORE NEXUS / ERROR 404
                </span>

                <h1>404</h1>

                <h2>Page Not Found</h2>

                <p>
                    The page you're looking for doesn't exist or may have
                    been moved to another location.
                </p>

                <div className="not-found-actions">

                    <Link
                        to="/dashboard"
                        className="not-found-primary"
                    >
                        <Home size={17} />
                        Back to Dashboard
                    </Link>

                    <button
                        className="not-found-secondary"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft size={17} />
                        Go Back
                    </button>

                </div>

            </div>

            <div className="not-found-footer">
                FinCore Nexus • Enterprise Digital Banking Platform
            </div>

        </div>
    );
}

export default NotFound;