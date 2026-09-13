
# FinCore Nexus — Frontend (Customers, Accounts, Loans, Payments)

Built against your **actual** backend (`com.bank.*`), confirmed against the
real entities/DTOs/controllers you shared — not guessed.

## What's in here

```
src/
├── services/
│   └── api.js                    ← All backend calls, matches your controllers exactly
├── components/
│   ├── Navbar.jsx                 ← PLACEHOLDER — you may already have a real one
│   ├── StatCard.jsx                ← Reusable version of Dashboard.jsx's local StatCard
│   ├── layout/
│   │   ├── BankingLayout.jsx      ← Wraps Sidebar + Navbar + page content
│   │   └── BankingLayout.css      ← Sidebar/Navbar styles (none existed before)
│   └── common/
│       ├── Modal.jsx
│       ├── ConfirmDialog.jsx
│       ├── PromptAmountDialog.jsx ← For deposit/withdraw/repay (amount-only actions)
│       └── StatusBadge.jsx        ← Auto-colors any status string (ACTIVE, PENDING, etc.)
├── pages/
│   ├── Customers.jsx
│   ├── Accounts.jsx
│   ├── Loans.jsx
│   ├── Payments.jsx
│   └── shared/
│       └── PageLayout.css         ← Shared table/modal/badge styles for all 4 pages
└── App.jsx                        ← PLACEHOLDER routing — merge with your real App.jsx if different
```

**Not touched / not replaced:** your `Dashboard.jsx`, `Sidebar.jsx`, `Dashboard.css`.

## How to drop this in

1. Copy `src/services/api.js` into your project (overwrite if you already made one).
2. Copy `src/components/layout/` folder in — this is genuinely new (your project had no `layout` folder or CSS for Sidebar/Navbar before this).
3. Copy `src/components/common/` folder in — new.
4. Copy `src/components/StatCard.jsx` in.
5. **Check `src/components/Navbar.jsx` first** — if you already have a real one, don't overwrite it. Just make sure it accepts an `onMenuClick` prop so mobile sidebar toggling works, or tell me what your real one looks like and I'll adjust `BankingLayout.jsx` to match.
6. Copy the 4 pages + `pages/shared/PageLayout.css` in.
7. **Check `src/App.jsx` before overwriting** — I don't have your real one (you mentioned `ProtectedRoute.jsx` exists in your project, meaning you likely have auth-wrapped routes already). Merge the 4 new `<Route>` entries into your real router instead of replacing the whole file if it's more complex than this placeholder.

## Required: `npm install`

```bash
npm install axios react-router-dom lucide-react
```
(`recharts` should already be installed since Dashboard.jsx uses it.)

## Required: Vite dev server on port 5173

Your gateway's `AccountController`/`LoanController`/`PaymentController` are hardcoded with:
```java
@CrossOrigin(origins = "http://localhost:5173")
```
That's Vite's default port, so just run `npm run dev` normally and it should line up. If you changed Vite's port, update `@CrossOrigin` in all 4 controllers (Customer's isn't shown but check it too) or you'll get CORS errors in the browser console — not a frontend bug if that happens, it's a backend annotation mismatch.

## Required: update your API Gateway routes

Your gateway currently only routes `/api/customers/**`. Add these to `application.properties`:

```properties
spring.cloud.gateway.server.webflux.routes[1].id=account-service
spring.cloud.gateway.server.webflux.routes[1].uri=http://localhost:8082
spring.cloud.gateway.server.webflux.routes[1].predicates[0]=Path=/api/accounts/**

spring.cloud.gateway.server.webflux.routes[2].id=loan-service
spring.cloud.gateway.server.webflux.routes[2].uri=http://localhost:8084
spring.cloud.gateway.server.webflux.routes[2].predicates[0]=Path=/api/loans/**

spring.cloud.gateway.server.webflux.routes[3].id=payment-service
spring.cloud.gateway.server.webflux.routes[3].uri=http://localhost:8085
spring.cloud.gateway.server.webflux.routes[3].predicates[0]=Path=/api/payments/**
```

Without these, Accounts/Loans/Payments pages will get the same 404 you saw
for Customers before the routing fix.

## Known assumptions / things to verify

- **`customerApi` (getAll/getById/update/remove)** — I don't have `CustomerController.java`, so these are assumed to follow the same REST pattern as your other 3 controllers. If any Customer action 404s, send me that controller and I'll fix just that spot.
- **Payment "Process" button does not move money.** Your `PaymentController`/`PaymentService` (as shown) only flips `status` — there's no visible call to Account Service to actually debit/credit a balance. The UI reflects that honestly: creating/processing a payment just records status, it doesn't touch account balances. If `PaymentService.java` internally calls Account Service and I'm wrong about this, tell me and I'll adjust the Accounts page to reflect real-time balance changes after a payment.
- **`accountType`, `loanType`, `paymentType`, `paymentMethod` are plain Strings** in your backend (not enums), so I used reasonable dropdown options (SAVINGS/CURRENT/etc.) — any string is technically accepted by validation. If you have a specific fixed list you want enforced, tell me and I'll lock the dropdowns down.
- **Deposit/withdraw/repay send `amount` as a query parameter**, not JSON body — matches your `@RequestParam BigDecimal amount` controllers exactly.
