import { useEffect, useState } from "react";
import {
    Search,
    Plus,
    Users,
    UserCheck,
    UserX,
    RefreshCw,
    Eye,
    Edit3,
    Trash2,
    Mail,
    Phone,
    MapPin,
    ArrowUpRight,
    X,
} from "lucide-react";

import BankingLayout from "../components/layout/BankingLayout";
import "./Customers.css";

const API_URL = "http://localhost:8080/api/customers";

const EMPTY_FORM = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
};

function Customers() {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [showModal, setShowModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [error, setError] = useState("");
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        let result = [...customers];

        if (search.trim()) {
            const keyword = search.toLowerCase();

            result = result.filter((customer) =>
                [
                    fullName(customer),
                    customer.email,
                    customer.phone,
                    customer.customerNumber,
                    customer.customerId,
                    customer.id,
                ]
                    .filter(Boolean)
                    .some((value) =>
                        String(value).toLowerCase().includes(keyword)
                    )
            );
        }

        if (statusFilter !== "ALL") {
            result = result.filter(
                (customer) =>
                    String(customer.status || "ACTIVE").toUpperCase() ===
                    statusFilter
            );
        }

        setFilteredCustomers(result);
    }, [customers, search, statusFilter]);

    async function fetchCustomers() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Unable to fetch customers");
            }

            const data = await response.json();

            const list = Array.isArray(data)
                ? data
                : data.content || data.customers || [];

            setCustomers(list);
        } catch (err) {
            console.error(err);
            setError(
                "Customer Service could not be reached. Make sure Customer Service and API Gateway are running."
            );
        } finally {
            setLoading(false);
        }
    }

    function fullName(customer) {
        return (
            [customer.firstName, customer.lastName]
                .filter(Boolean)
                .join(" ") ||
            customer.name ||
            "Unnamed Customer"
        );
    }

    function getCustomerId(customer, index = 0) {
        return (
            customer.customerNumber ||
            customer.customerId ||
            customer.id ||
            `CUS-${String(index + 1).padStart(5, "0")}`
        );
    }

    function getInitials(name) {
        return (
            name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((word) => word[0])
                .join("")
                .toUpperCase() || "CU"
        );
    }

    function openCreateModal() {
        setSelectedCustomer(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    }

    function openEditModal(customer) {
        setSelectedCustomer(customer);

        setForm({
            firstName: customer.firstName || "",
            lastName: customer.lastName || "",
            email: customer.email || "",
            phone: customer.phone || "",
            address: customer.address || "",
            city: customer.city || "",
            state: customer.state || "",
            postalCode: customer.postalCode || "",
        });

        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
    }

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const isEdit = Boolean(selectedCustomer);

            const id =
                selectedCustomer?.id ||
                selectedCustomer?.customerId;

            const url = isEdit
                ? `${API_URL}/${id}`
                : API_URL;

            const response = await fetch(url, {
                method: isEdit ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            if (!response.ok) {
                let message = "Customer operation failed.";

                try {
                    const data = await response.json();

                    message =
                        data.message ||
                        data.error ||
                        (data.errors
                            ? Object.entries(data.errors)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(", ")
                            : message);
                } catch {
                    // Ignore non-JSON response.
                }

                throw new Error(message);
            }

            closeModal();
            setForm(EMPTY_FORM);
            setSelectedCustomer(null);

            await fetchCustomers();
        } catch (err) {
            console.error(err);
            alert(err.message || "Unable to save customer.");
        }
    }

    async function deleteCustomer(customer) {
        const id =
            customer.id ||
            customer.customerId;

        if (!id) {
            alert("Customer ID not available.");
            return;
        }

        const confirmed = window.confirm(
            `Delete customer ${fullName(customer)}?`
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error("Delete failed");
            }

            await fetchCustomers();
        } catch (err) {
            console.error(err);
            alert("Unable to delete customer.");
        }
    }

    const activeCount = customers.filter(
        (customer) =>
            String(customer.status || "ACTIVE").toUpperCase() ===
            "ACTIVE"
    ).length;

    const inactiveCount = customers.filter(
        (customer) =>
            String(customer.status || "").toUpperCase() ===
            "INACTIVE"
    ).length;

    return (
        <BankingLayout>
            <div className="customers-page">

                {/* HEADER */}

                <div className="customers-header">
                    <div>
            <span className="customers-eyebrow">
              FINCORE NEXUS / CUSTOMER SERVICE
            </span>

                        <h1>Customers</h1>

                        <p>
                            Manage customer profiles, contact information
                            and account relationships.
                        </p>
                    </div>

                    <div className="customers-header-actions">
                        <button
                            className="refresh-button"
                            onClick={fetchCustomers}
                        >
                            <RefreshCw size={17} />
                            Refresh
                        </button>

                        <button
                            className="add-customer-button"
                            onClick={openCreateModal}
                        >
                            <Plus size={18} />
                            Add Customer
                        </button>
                    </div>
                </div>

                {/* SERVICE STATUS */}

                <div className="customer-service-banner">
                    <div className="service-banner-left">
                        <div className="service-live-dot"></div>

                        <div>
                            <strong>Customer Service</strong>
                            <span>
                Connected through API Gateway · Port 8080
              </span>
                        </div>
                    </div>

                    <div className="service-live">
                        <span></span>
                        OPERATIONAL
                    </div>
                </div>

                {/* STATISTICS */}

                <div className="customer-stats">

                    <div className="customer-stat-card">
                        <div className="customer-stat-icon purple">
                            <Users size={21} />
                        </div>

                        <div>
                            <span>Total Customers</span>
                            <strong>
                                {customers.length.toLocaleString("en-IN")}
                            </strong>
                        </div>

                        <ArrowUpRight size={17} />
                    </div>

                    <div className="customer-stat-card">
                        <div className="customer-stat-icon green">
                            <UserCheck size={21} />
                        </div>

                        <div>
                            <span>Active Customers</span>
                            <strong>
                                {activeCount.toLocaleString("en-IN")}
                            </strong>
                        </div>

                        <ArrowUpRight size={17} />
                    </div>

                    <div className="customer-stat-card">
                        <div className="customer-stat-icon orange">
                            <UserX size={21} />
                        </div>

                        <div>
                            <span>Inactive Customers</span>
                            <strong>
                                {inactiveCount.toLocaleString("en-IN")}
                            </strong>
                        </div>

                        <ArrowUpRight size={17} />
                    </div>

                    <div className="customer-stat-card">
                        <div className="customer-stat-icon blue">
                            <Users size={21} />
                        </div>

                        <div>
                            <span>Service Status</span>
                            <strong className="operational-text">
                                Operational
                            </strong>
                        </div>
                    </div>

                </div>

                {/* CUSTOMER DIRECTORY */}

                <div className="customers-panel">

                    <div className="customers-panel-header">
                        <div>
              <span className="panel-label">
                CUSTOMER DIRECTORY
              </span>

                            <h2>All customers</h2>
                        </div>

                        <div className="customer-count">
                            {filteredCustomers.length} records
                        </div>
                    </div>

                    {/* SEARCH */}

                    <div className="customer-toolbar">

                        <div className="customer-search">
                            <Search size={18} />

                            <input
                                type="text"
                                placeholder="Search by name, email, phone or customer ID..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                            />
                        </div>

                        <div className="customer-filters">

                            <button
                                className={
                                    statusFilter === "ALL"
                                        ? "filter-active"
                                        : ""
                                }
                                onClick={() => setStatusFilter("ALL")}
                            >
                                All
                            </button>

                            <button
                                className={
                                    statusFilter === "ACTIVE"
                                        ? "filter-active"
                                        : ""
                                }
                                onClick={() =>
                                    setStatusFilter("ACTIVE")
                                }
                            >
                                Active
                            </button>

                            <button
                                className={
                                    statusFilter === "INACTIVE"
                                        ? "filter-active"
                                        : ""
                                }
                                onClick={() =>
                                    setStatusFilter("INACTIVE")
                                }
                            >
                                Inactive
                            </button>

                        </div>
                    </div>

                    {/* ERROR */}

                    {error && (
                        <div className="customer-error">
                            <div>
                                <strong>
                                    Customer Service unavailable
                                </strong>

                                <span>{error}</span>
                            </div>

                            <button onClick={fetchCustomers}>
                                Retry
                            </button>
                        </div>
                    )}

                    {/* TABLE */}

                    {loading ? (
                        <div className="customer-loading">
                            <div className="loading-spinner"></div>

                            <strong>
                                Loading customers...
                            </strong>

                            <span>
                Fetching data from Customer Service
              </span>
                        </div>
                    ) : (
                        <div className="customers-table-wrapper">

                            <table className="customers-table">

                                <thead>
                                <tr>
                                    <th>CUSTOMER</th>
                                    <th>CUSTOMER ID</th>
                                    <th>CONTACT</th>
                                    <th>LOCATION</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                </tr>
                                </thead>

                                <tbody>

                                {filteredCustomers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="empty-customers"
                                        >
                                            <Users size={38} />

                                            <strong>
                                                No customers found
                                            </strong>

                                            <span>
                          {search
                              ? "Try a different search term."
                              : "Create your first customer to get started."}
                        </span>

                                            {!search && (
                                                <button
                                                    onClick={openCreateModal}
                                                >
                                                    <Plus size={16} />
                                                    Add Customer
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCustomers.map(
                                        (customer, index) => {

                                            const status = String(
                                                customer.status || "ACTIVE"
                                            ).toUpperCase();

                                            const name =
                                                fullName(customer);

                                            return (
                                                <tr
                                                    key={getCustomerId(
                                                        customer,
                                                        index
                                                    )}
                                                >

                                                    <td>
                                                        <div className="customer-profile">

                                                            <div className="customer-avatar">
                                                                {getInitials(name)}
                                                            </div>

                                                            <div>
                                                                <strong>
                                                                    {name}
                                                                </strong>

                                                                <span>
                                    {customer.email ||
                                        "No email available"}
                                  </span>
                                                            </div>

                                                        </div>
                                                    </td>

                                                    <td>
                              <span className="customer-id">
                                {getCustomerId(
                                    customer,
                                    index
                                )}
                              </span>
                                                    </td>

                                                    <td>
                                                        <div className="contact-info">
                                                            {customer.phone ? (
                                                                <>
                                                                    <Phone size={14} />
                                                                    {customer.phone}
                                                                </>
                                                            ) : (
                                                                "No phone"
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className="location-info">
                                                            <MapPin size={14} />

                                                            <span>
                                  {customer.city
                                      ? `${customer.city}, ${
                                          customer.state || ""
                                      }`
                                      : customer.address ||
                                      "Not provided"}
                                </span>
                                                        </div>
                                                    </td>

                                                    <td>
                              <span
                                  className={`customer-status ${
                                      status === "ACTIVE"
                                          ? "active"
                                          : "inactive"
                                  }`}
                              >
                                <span></span>
                                  {status}
                              </span>
                                                    </td>

                                                    <td>
                                                        <div className="customer-actions">

                                                            <button
                                                                title="View customer"
                                                                onClick={() =>
                                                                    setSelectedCustomer(
                                                                        customer
                                                                    )
                                                                }
                                                            >
                                                                <Eye size={16} />
                                                            </button>

                                                            <button
                                                                title="Edit customer"
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        customer
                                                                    )
                                                                }
                                                            >
                                                                <Edit3 size={16} />
                                                            </button>

                                                            <button
                                                                title="Delete customer"
                                                                className="delete-action"
                                                                onClick={() =>
                                                                    deleteCustomer(
                                                                        customer
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>

                                                        </div>
                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )
                                )}

                                </tbody>

                            </table>

                        </div>
                    )}

                </div>

                {/* DETAILS MODAL */}

                {selectedCustomer && !showModal && (
                    <div className="modal-overlay">

                        <div className="customer-details-modal">

                            <button
                                className="modal-close"
                                onClick={() =>
                                    setSelectedCustomer(null)
                                }
                            >
                                <X size={20} />
                            </button>

                            <div className="details-avatar">
                                {getInitials(
                                    fullName(selectedCustomer)
                                )}
                            </div>

                            <span className="details-label">
                CUSTOMER PROFILE
              </span>

                            <h2>
                                {fullName(selectedCustomer)}
                            </h2>

                            <span className="details-id">
                {getCustomerId(
                    selectedCustomer
                )}
              </span>

                            <div className="details-grid">

                                <DetailItem
                                    icon={<Mail size={17} />}
                                    label="Email"
                                    value={
                                        selectedCustomer.email ||
                                        "Not provided"
                                    }
                                />

                                <DetailItem
                                    icon={<Phone size={17} />}
                                    label="Phone"
                                    value={
                                        selectedCustomer.phone ||
                                        "Not provided"
                                    }
                                />

                                <DetailItem
                                    icon={<MapPin size={17} />}
                                    label="Address"
                                    value={[
                                            selectedCustomer.address,
                                            selectedCustomer.city,
                                            selectedCustomer.state,
                                            selectedCustomer.postalCode,
                                        ]
                                            .filter(Boolean)
                                            .join(", ") ||
                                        "Not provided"}
                                />

                                <DetailItem
                                    icon={<UserCheck size={17} />}
                                    label="Status"
                                    value={
                                        selectedCustomer.status ||
                                        "ACTIVE"
                                    }
                                />

                            </div>

                            <div className="details-footer">

                                <button
                                    className="secondary-button"
                                    onClick={() =>
                                        setSelectedCustomer(null)
                                    }
                                >
                                    Close
                                </button>

                                <button
                                    className="primary-button"
                                    onClick={() =>
                                        openEditModal(
                                            selectedCustomer
                                        )
                                    }
                                >
                                    <Edit3 size={16} />
                                    Edit Customer
                                </button>

                            </div>

                        </div>
                    </div>
                )}

                {/* CREATE / EDIT MODAL */}

                {showModal && (
                    <div className="modal-overlay">

                        <div className="customer-form-modal">

                            <div className="form-modal-header">

                                <div>
                  <span className="details-label">
                    CUSTOMER SERVICE
                  </span>

                                    <h2>
                                        {selectedCustomer
                                            ? "Edit Customer"
                                            : "Create Customer"}
                                    </h2>

                                    <p>
                                        {selectedCustomer
                                            ? "Update customer information."
                                            : "Add a new customer to FinCore Nexus."}
                                    </p>
                                </div>

                                <button
                                    className="modal-close"
                                    onClick={closeModal}
                                >
                                    <X size={20} />
                                </button>

                            </div>

                            <form onSubmit={handleSubmit}>

                                <div className="form-grid">

                                    <div className="form-group">
                                        <label>First Name</label>

                                        <input
                                            name="firstName"
                                            value={form.firstName}
                                            onChange={handleChange}
                                            placeholder="Enter first name"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Last Name</label>

                                        <input
                                            name="lastName"
                                            value={form.lastName}
                                            onChange={handleChange}
                                            placeholder="Enter last name"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Email Address</label>

                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="customer@example.com"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Phone Number</label>

                                        <input
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="9876543210"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>City</label>

                                        <input
                                            name="city"
                                            value={form.city}
                                            onChange={handleChange}
                                            placeholder="Hyderabad"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>State</label>

                                        <input
                                            name="state"
                                            value={form.state}
                                            onChange={handleChange}
                                            placeholder="Telangana"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Postal Code</label>

                                        <input
                                            name="postalCode"
                                            value={form.postalCode}
                                            onChange={handleChange}
                                            placeholder="500001"
                                            required
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Address</label>

                                        <textarea
                                            name="address"
                                            value={form.address}
                                            onChange={handleChange}
                                            placeholder="Enter street address"
                                            rows="3"
                                            required
                                        />
                                    </div>

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
                                    >
                                        <Plus size={17} />

                                        {selectedCustomer
                                            ? "Save Changes"
                                            : "Create Customer"}
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>
                )}

            </div>
        </BankingLayout>
    );
}

function DetailItem({
                        icon,
                        label,
                        value,
                    }) {
    return (
        <div className="detail-item">

            <div className="detail-icon">
                {icon}
            </div>

            <div>
                <span>{label}</span>
                <strong>{value}</strong>
            </div>

        </div>
    );
}

export default Customers;