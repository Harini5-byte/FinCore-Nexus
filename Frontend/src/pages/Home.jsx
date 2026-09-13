import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
    return (
        <div className="home-page">

            {/* NAVBAR */}
            <nav className="navbar navbar-expand-lg navbar-dark fin-navbar">
                <div className="container">
                    <Link className="navbar-brand fin-brand" to="/">
                        <span className="brand-icon">FN</span>
                        <span>FinCore <b>Nexus</b></span>
                    </Link>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarContent"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarContent">
                        <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
                            <li className="nav-item">
                                <Link className="nav-link active" to="/">Home</Link>
                            </li>

                            <li className="nav-item">
                                <Link className="nav-link" to="/customers">Customers</Link>
                            </li>

                            <li className="nav-item">
                                <Link className="nav-link" to="/accounts">Accounts</Link>
                            </li>

                            <li className="nav-item">
                                <Link className="nav-link" to="/transactions">
                                    Transactions
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link className="nav-link" to="/loans">Loans</Link>
                            </li>

                            <li className="nav-item">
                                <Link className="nav-link" to="/payments">Payments</Link>
                            </li>

                            <li className="nav-item">
                                <Link className="btn fin-login-btn" to="/dashboard">
                                    Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section className="hero-section">
                <div className="container">
                    <div className="row align-items-center min-vh-75">

                        <div className="col-lg-7">
                            <div className="hero-badge">
                                <span className="pulse-dot"></span>
                                Enterprise Digital Banking Platform
                            </div>

                            <h1 className="hero-title">
                                Banking built for
                                <span> the digital future.</span>
                            </h1>

                            <p className="hero-description">
                                FinCore Nexus is a modern digital banking platform connecting
                                customers, accounts, transactions, loans and payments through
                                a scalable microservices architecture.
                            </p>

                            <div className="hero-buttons">
                                <Link to="/dashboard" className="btn btn-primary hero-btn">
                                    Open Dashboard
                                    <span> →</span>
                                </Link>

                                <Link to="/customers" className="btn hero-outline-btn">
                                    Explore Platform
                                </Link>
                            </div>

                            <div className="trust-row">
                                <div>
                                    <strong>2.4M+</strong>
                                    <small>Active Accounts</small>
                                </div>

                                <div>
                                    <strong>12.4M</strong>
                                    <small>Daily Transactions</small>
                                </div>

                                <div>
                                    <strong>99.99%</strong>
                                    <small>Platform Uptime</small>
                                </div>
                            </div>
                        </div>

                        {/* BANKING CARD */}
                        <div className="col-lg-5">
                            <div className="banking-visual">

                                <div className="glow-circle"></div>

                                <div className="bank-card">
                                    <div className="card-top">
                                        <span>FinCore</span>
                                        <span>◉</span>
                                    </div>

                                    <div className="chip">
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                    </div>

                                    <div className="card-number">
                                        4582&nbsp;&nbsp; 7219&nbsp;&nbsp; 3048&nbsp;&nbsp; 6217
                                    </div>

                                    <div className="card-bottom">
                                        <div>
                                            <small>CARD HOLDER</small>
                                            <p>FINCORE USER</p>
                                        </div>

                                        <div>
                                            <small>VALID THRU</small>
                                            <p>12/29</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="floating-card transaction-card">
                                    <div className="float-icon">↗</div>
                                    <div>
                                        <small>Transaction</small>
                                        <strong>₹48,250</strong>
                                    </div>
                                    <span className="success">+2.8%</span>
                                </div>

                                <div className="floating-card secure-card">
                                    <div className="shield">✓</div>
                                    <div>
                                        <strong>Secure Banking</strong>
                                        <small>Protected 24/7</small>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* SERVICES */}
            <section className="services-section">
                <div className="container">

                    <div className="section-heading">
                        <span>ONE PLATFORM</span>
                        <h2>Everything your bank needs</h2>
                        <p>
                            Connected banking services powered by independent,
                            scalable microservices.
                        </p>
                    </div>

                    <div className="row g-4">

                        <ServiceCard
                            icon="◉"
                            title="Customer Service"
                            description="Manage customer profiles, registration and banking relationships."
                            link="/customers"
                        />

                        <ServiceCard
                            icon="▣"
                            title="Account Service"
                            description="Create and manage accounts, balances and account information."
                            link="/accounts"
                        />

                        <ServiceCard
                            icon="↗"
                            title="Transaction Service"
                            description="Process and monitor secure banking transactions in real time."
                            link="/transactions"
                        />

                        <ServiceCard
                            icon="▤"
                            title="Loan Service"
                            description="Handle loan applications, approvals, repayment and tracking."
                            link="/loans"
                        />

                        <ServiceCard
                            icon="₹"
                            title="Payment Service"
                            description="Manage secure payments and payment processing workflows."
                            link="/payments"
                        />

                        <ServiceCard
                            icon="⚡"
                            title="API Gateway"
                            description="Unified entry point connecting the complete banking ecosystem."
                            link="/dashboard"
                        />

                    </div>
                </div>
            </section>

            {/* ARCHITECTURE */}
            <section className="architecture-section">
                <div className="container">
                    <div className="architecture-box">

                        <div>
              <span className="architecture-label">
                MICROSERVICES ARCHITECTURE
              </span>

                            <h2>
                                One ecosystem.
                                <br />
                                <span>Multiple intelligent services.</span>
                            </h2>

                            <p>
                                FinCore Nexus separates banking capabilities into independent
                                services while keeping the customer experience unified.
                            </p>
                        </div>

                        <div className="architecture-flow">
                            <div className="architecture-node main-node">
                                React
                                <small>Frontend</small>
                            </div>

                            <div className="flow-line">→</div>

                            <div className="architecture-node">
                                API Gateway
                                <small>8080</small>
                            </div>

                            <div className="flow-line">→</div>

                            <div className="service-stack">
                                <div>Customer</div>
                                <div>Account</div>
                                <div>Transaction</div>
                                <div>Loan</div>
                                <div>Payment</div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="fin-footer">
                <div className="container">
                    <div className="footer-content">

                        <div>
                            <div className="footer-brand">
                                <span className="brand-icon">FN</span>
                                FinCore Nexus
                            </div>

                            <p>
                                Enterprise Digital Banking Platform
                            </p>
                        </div>

                        <div className="footer-right">
                            <span>Secure</span>
                            <span>Scalable</span>
                            <span>Reliable</span>
                            <span>© 2026 FinCore Nexus</span>
                        </div>

                    </div>
                </div>
            </footer>

        </div>
    );
}

function ServiceCard({ icon, title, description, link }) {
    return (
        <div className="col-md-6 col-xl-4">
            <Link to={link} className="service-card">

                <div className="service-icon">
                    {icon}
                </div>

                <h3>{title}</h3>

                <p>{description}</p>

                <span className="service-link">
          Explore service →
        </span>

            </Link>
        </div>
    );
}

export default Home;