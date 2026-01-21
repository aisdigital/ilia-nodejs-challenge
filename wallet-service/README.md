# Wallet Service

The **Wallet Service** is responsible for all financial operations.

It owns the Wallet database and enforces strict consistency rules.

---

## 🧱 Responsibilities

* Manage wallet balances
* Handle credit and debit transactions
* Prevent overdrafts
* Guarantee transactional consistency

---

## 🔐 Authentication

* All routes are protected by JWT authentication
* User identity is extracted from the JWT
* Controllers validate authentication before calling services

---

## 📌 Endpoints

### `POST /transactions`

Creates a wallet transaction.

**Rules:**

* CREDIT increases balance
* DEBIT decreases balance
* DEBIT is rejected if balance is insufficient
* Uses SQL transaction + pessimistic lock

---

### `GET /balance`

Returns the current wallet balance of the authenticated user.

**Behavior:**

* UserId extracted from JWT
* Only returns the balance of the calling user

---

## ▶️ Running the service

### Environment variables

```env
DATABASE_URL=postgresql://postgres:pass@localhost:5434/wallet
JWT_SECRET=ILIACHALLENGE
PORT=3001
```

### Install dependencies

```bash
npm install
```

### Start the service

```bash
npm run start:dev
```


---

## 🧠 Notes

* All Prisma access is isolated in repositories
* Services contain only business rules
* Controllers validate request preconditions
* Designed to be safe under concurrent access
