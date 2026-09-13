import Sidebar from "../Sidebar";
import Navbar from "../Navbar";
import { useState } from "react";
import "./BankingLayout.css";

function BankingLayout({ children }) {

    const [sidebarOpen, setSidebarOpen] = useState(false);

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

                <main className="page-content">
                    {children}
                </main>

            </div>

        </div>
    );
}

export default BankingLayout;