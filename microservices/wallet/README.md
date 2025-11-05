# 🏦 Ília Digital Challenge - Basic Financial Application (Wallet & Users)

This project implements a modular backend solution consisting of two Microservices (Wallet and Users), developed in **TypeScript/NestJS**. The architecture strictly adheres to the principles of **Domain-Driven Design (DDD)**, **Clean Architecture**, and **Ports & Adapters**, with internal communication via **gRPC** and security handled by **JWT**.

## 1. Project Setup and Initialization

### Prerequisites

- **Node.js** (v20+)
- **Docker** & **Docker Compose** (Required to run the DB environment and Microservices).

### Initialization Steps

1.  **Configure Environment:** The file `.env.development` must be renamed to **`.env`** at the project root. This file contains all required secret keys (`ILIACHALLENGE`, `ILIACHALLENGE_INTERNAL`) and DB configurations.

2.  **Install Dependencies:** Install dependencies separately within each microservice.

    ```bash
    # From the /ilia-financial-challenge root
    npm install --prefix microservices/wallet
    npm install --prefix microservices/users
    ```

3.  **Build and Start:** Execute the command to build the code and start all containers.

    ```bash
    # Use --build the first time to compile and create images
    docker-compose up --build
    ```

    _Expected Result:_ Four containers will start: **`wallet_db`**, **`users_db`**, **`wallet_app`** (Port 3001), and **`users_app`** (Port 3002).

---

## 2. Architecture and Design Patterns

The project adopts the **Modular Monolith** concept in its code design but is deployed as separate **Microservices**.

### A. Core Architecture and Patterns

| Pattern               | Application                                                                                                                                  |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| **Architecture**      | **DDD** and **Ports & Adapters (Hexagonal)**. Domain/Application logic is isolated from Infrastructure (HTTP, DB).                           |
| **Error Management**  | Use of the **`Either<L, R>`** Pattern in the Application Layer (Use Cases) for explicit failure handling (e.g., `InsufficientBalanceError`). |
| **Response Wrapping** | A **Global Interceptor** (`ApiWrapperInterceptor`) standardizes all successful HTTP responses (2xx) by wrapping the data with `metadata`.    |
| **Authentication**    | **Global JWT Guard** (`ILIACHALLENGE`) protects all necessary routes in both services.                                                       |

### B. Microservices and Communication

| Service             | HTTP Port | Primary Database | Internal Communication |
| :------------------ | :-------- | :--------------- | :--------------------- |
| **Wallet (Part 1)** | `3001`    | **PostgreSQL**   | Client **gRPC**        |
| **Users (Part 2)**  | `3002`    | **PostgreSQL**   | Server **gRPC**        |

#### Internal Communication Details

- The communication channel is established via **gRPC** on the internal port `50051`.
- **Security:** The channel is protected by a dedicated internal JWT (key `ILIACHALLENGE_INTERNAL`).
- **Function:** The Wallet App calls the Users App via gRPC to **validate the user's existence** before executing transactions.

---

## 🌐 3. Endpoints and Testing Flow

To test the flow, you must obtain a JWT from the Users Microservice and use it for Wallet access.

### Step 1: Authentication (Users Microservice - Port 3002)

| Method | Route    | Description                                                         |
| :----- | :------- | :------------------------------------------------------------------ |
| `POST` | `/users` | **Registration** of a new user. Returns the initial `access_token`. |
| `POST` | `/auth`  | **Login** (Issues a new valid JWT).                                 |

### Step 2: Financial Operations (Wallet Microservice - Port 3001)

| Method | Route                  | Requirement                                                          |
| :----- | :--------------------- | :------------------------------------------------------------------- |
| `POST` | `/wallet/transactions` | Creates Credit/Debit. **(Requires `Authorization: Bearer <JWT>`)**   |
| `GET`  | `/wallet/balance`      | Returns the consolidated balance (via SQL query). **(Requires JWT)** |

---

## 4. 🧑‍💻 Workflow (Gitflow and Code Review)

The project history demonstrates the required **Gitflow** process to simulate a team environment, including **Code Review** at each major implementation step.

### Process Applied

1.  Development was segmented into descriptive **`feature/`** branches (e.g., `feature/wallet-transactions`).
2.  Each feature was submitted and merged into the **`main`** branch via a **Pull Request (PR)**, fulfilling the mandatory code review requirement.
3.  To simplify the process, only one branch was left in draft mode for the main branch.

**The complete commit and merge history confirms the application of the mandatory workflow.**
