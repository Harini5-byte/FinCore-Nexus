# FinCore Nexus — Enterprise Digital Banking Platform

FinCore Nexus is a full-stack digital banking platform built as a set of Spring Boot microservices with a React frontend. It covers the core things a bank needs to do day-to-day — opening accounts, moving money, giving out loans, and verifying customer identity — all wired together through an event-driven backend.

This project was built as part of the Infosys Springboard program, across four milestones, by a small team.

---

## What it does

- **Accounts & Customers** — create accounts, manage customer profiles, track balances in real time
- **Loans** — loan origination, EMI calculation, disbursement, and repayment tracking
- **Payments & Transfers** — IMPS/NEFT/RTGS/UPI transfers with fraud detection and risk scoring
- **KYC & Compliance** — document OCR, face match, and liveness detection for digital customer onboarding, with audit logging

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Java, Spring Boot (multiple microservices) |
| Database | MySQL |
| Service Discovery | Eureka |
| API Gateway | Spring Cloud Gateway |
| Computer Vision (KYC) | Tesseract OCR, OpenCV |
| Email | Gmail SMTP (App Password) |

---

## Project Structure

```
FinCore-Nexus/
├── Backend/
│   ├── eurekaserver/              # Service registry
│   ├── apigateway/                 # API Gateway / routing
│   ├── accountservice/             # Accounts & balances
│   ├── customerservice/            # Customer profiles
│   ├── loanservice/                # Loan origination & EMI
│   ├── paymentservice/             # Payments, transfers, fraud checks
│   ├── transactionservice/         # Transaction processing
│   ├── kyc-service/                # KYC orchestration (port 8086)
│   └── kyc-verification-service/   # OCR, face match, liveness (port 8090)
└── Frontend/
    └── src/                         # React application
```

Each backend service is an independent Spring Boot application with its own `application.properties` and its own database schema.

---

## Before You Start

Make sure these are installed on your machine:

- **Java 17+** and **Maven**
- **Node.js** (includes npm)
- **MySQL** (running locally, or update the connection details to point to your own instance)
- **IntelliJ IDEA** (recommended, for running the backend services)
- **Tesseract OCR** — required by `kyc-verification-service` for document scanning. [Install guide](https://github.com/UB-Mannheim/tesseract/wiki) (Windows)

---

## Getting the Project

Clone the repository:

```
git clone https://github.com/SHREEMADHUMITHA/FinCore-Nexus-Complete-New.git
```

Or download it as a ZIP from GitHub (**Code → Download ZIP**) and extract it.

---

## Setting Up the Backend

Each service under `Backend/` needs its own `application.properties` filled in with real values — the versions in this repo have placeholders instead of real secrets, for security.

For **every** service, open its `src/main/resources/application.properties` and replace:

- `spring.datasource.password` → your local MySQL password
- `spring.mail.password` → a Gmail **App Password** (not your normal Gmail password) — only needed in `paymentservice`
- `admin.api.key` → any secret string of your choice — only needed in `kyc-service`

Also update `Frontend/src/pages/KycManagement.jsx`, where `ADMIN_API_KEY` must match the value you set in `kyc-service`.

### Running the services

Open each service as a project in IntelliJ (or open the whole `Backend` folder as a multi-module Maven project), and run them in this order:

1. `eurekaserver` — start first, it's the service registry
2. `apigateway`
3. All other services (`accountservice`, `customerservice`, `loanservice`, `paymentservice`, `transactionservice`, `kyc-service`, `kyc-verification-service`) — can be started in any order after Eureka is up

Each service will create its own MySQL database automatically on first run (`createDatabaseIfNotExist=true`).

---

## Setting Up the Frontend

```
cd Frontend
npm install
npm run dev
```

This installs all dependencies and starts the React app in development mode. The terminal will show the local URL to open (usually `http://localhost:5173`).

---

## Notes on Security

- Real credentials (database passwords, API keys, mail passwords) are **never** committed to this repo — only placeholders like `YOUR_PASSWORD_HERE`.
- Each contributor should set up their own local `application.properties` values and never commit real secrets back to GitHub.

---

## Team

This is a group project — each teammate owns and maintains specific services. See individual service folders for details.
