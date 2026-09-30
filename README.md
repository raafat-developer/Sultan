# FAST MAN 🛵⚡

### Commercial Motorcycle Delivery Management Platform
**React Native (Expo + Expo Router) Mobile Application + Independent Production NestJS Backend + PostgreSQL + Redis**

---

## 1. Project Overview

**FAST MAN** is a production-grade express motorcycle delivery management platform built to orchestrate couriers, dispatchers, customers, and operations in real-time.

### Key Capabilities
* **Role-Based Access Control (RBAC):** `SUPER_ADMIN`, `ADMIN`, `DISPATCHER`, `COURIER`, `CUSTOMER`.
* **Server-Side Order Lifecycle State Machine:** Enforces strict sequential transitions (`NEW` → `ASSIGNED` → `COURIER_ACCEPTED` → `GOING_TO_PICKUP` → `ARRIVED_AT_PICKUP` → `PICKED_UP` → `OUT_FOR_DELIVERY` → `ARRIVED_AT_CUSTOMER` → `DELIVERED`).
* **Delivery Confirmation & Security:** 4-digit customer OTP hash verification, Cash on Delivery (COD) collection reconciliation, and Proof of Delivery (Photo/Signature).
* **Live Courier Telemetry Tracking:** Real-time GPS location updates (15–30s interval), battery level monitoring, and live Dispatcher fleet map.
* **Courier Earnings Engine:** Automatic distance and tier-based commission calculations.
* **Bilingual UI & RTL Support:** Full Arabic (default) and English support with dynamic RTL layout switching.
* **Fast Man Design System:** High-contrast, premium dark mode palette (`#0B0B0E` Pitch Black, `#E50914` Racing Crimson Red, Pure White, Dark Charcoal).

---

## 2. System Architecture

```text
                     FAST MAN PLATFORM
                             │
              ┌──────────────┴──────────────┐
              │                             │
    React Native Mobile App         Future Web Admin
    (Expo / Expo Router / TS)      (Next.js / Vite / TS)
              │                             │
              └──────────────┬──────────────┘
                             │
                      HTTPS / WebSocket
                             │
                             ▼
              Independent NestJS REST API
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
       ▼                     ▼                     ▼
 PostgreSQL (Prisma)     Redis Cache           Object Storage
       │               (Location/Session)     (Proofs/Photos)
       │                     │
       └─────────────────────┤
                             ▼
                    Core Business Logic
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
 Orders Machine        Courier Fleet        Payments & COD
        │                    │                    │
        └────────────────────┼────────────────────┘
                             ▼
                     Events & Push Hub
                             │
                      Socket.IO / FCM
```

---

## 3. Directory Structure

```text
fast-man/
├── backend/                        # Independent NestJS Backend
│   ├── prisma/
│   │   ├── schema.prisma           # Complete PostgreSQL Prisma schema
│   │   ├── migrations/             # Generated database migrations
│   │   └── seed.ts                 # Dev seed (Super Admin, Admins, Couriers, Customers, Orders)
│   ├── src/
│   │   ├── audit/                  # Audit trail logging
│   │   ├── auth/                   # JWT Auth, Argon2, Refresh tokens, RBAC guards
│   │   ├── common/                 # Prisma, Redis, Storage, Filters, Interceptors
│   │   ├── couriers/               # Fleet management, status toggle, GPS tracking
│   │   ├── customers/              # Customer CRUD, address book, metrics
│   │   ├── earnings/               # Courier payouts & commission settlement
│   │   ├── events/                 # Socket.IO Gateway for real-time events
│   │   ├── health/                 # Production deployment health check (/health)
│   │   ├── notifications/          # FCM Push & in-app alerts
│   │   ├── orders/                 # State machine, assignment, OTP verification
│   │   ├── payments/               # COD reconciliation & discrepancy logs
│   │   ├── reports/                # Executive analytics (Volume, Revenue, Profits)
│   │   ├── settings/               # Distance pricing rules & operational settings
│   │   ├── users/                  # User management & account lifecycle
│   │   ├── app.module.ts           # Root module
│   │   └── main.ts                 # Bootstrap with Swagger at /api/docs
│   ├── test/                       # Unit and integration test suites
│   ├── Dockerfile                  # Multi-stage production container build
│   ├── fastman-api-collection.json # Postman / API test collection
│   └── .env.example
│
├── mobile/                         # React Native / Expo Application
│   ├── app/                        # Expo Router screen tree
│   │   ├── _layout.tsx             # Root layout with QueryClientProvider & Safe Areas
│   │   ├── index.tsx               # Intelligent role-based dispatch router
│   │   ├── (auth)/
│   │   │   └── login.tsx           # Courier Phone & Staff Email login + 1-Tap Demo
│   │   ├── (courier)/
│   │   │   ├── _layout.tsx         # Bottom tabs (Home, Orders, Earnings, Profile)
│   │   │   ├── home.tsx            # Big Online toggle, stats, current delivery card
│   │   │   ├── orders.tsx          # Active & completed orders filter list
│   │   │   ├── delivery/[id].tsx   # Step-by-step wizard (Accept, Navigate, OTP, COD)
│   │   │   ├── earnings.tsx        # Financial earnings & payout history
│   │   │   └── profile.tsx         # Courier profile, vehicle info, language switch
│   │   ├── (admin)/
│   │   │   ├── _layout.tsx         # Admin tabs (Dashboard, Orders, Couriers, Fleet)
│   │   │   ├── dashboard.tsx       # Live KPIs, today's revenue, active deliveries
│   │   │   ├── orders/             # Order list, filters, and 1-tap assign modal
│   │   │   ├── orders/create.tsx   # Order placement form with fee calculation
│   │   │   ├── tracking.tsx        # Live fleet GPS map & status telemetry
│   │   │   ├── couriers.tsx        # Fleet list with direct phone call
│   │   │   ├── reports.tsx         # Executive turnover & net profit metrics
│   │   │   └── settings.tsx        # Dynamic pricing rules & system toggles
│   │   └── order/[id].tsx          # Comprehensive order timeline & audit log
│   ├── src/
│   │   ├── components/             # Reusable UI (Logo, Buttons, Cards, Badges)
│   │   ├── constants/theme.ts      # Fast Man color tokens & typography
│   │   ├── i18n/                   # Arabic (default) & English translations + RTL
│   │   ├── services/               # Central API client, Socket.IO, GPS location
│   │   ├── store/                  # Zustand stores (auth, courier, settings)
│   │   └── types/                  # TypeScript interfaces & status enums
│   ├── app.json                    # Expo config with GPS & notification permissions
│   └── .env.example
│
├── docker-compose.yml              # PostgreSQL, Redis & Backend container orchestration
├── .gitignore
└── README.md
```

---

## 4. Quick Start (Local Development)

### Prerequisites
* **Node.js:** v18+ (tested on Node v20/v24)
* **PostgreSQL:** v14+ or Docker
* **Redis:** v7+ (Optional locally — backend includes automatic in-memory fallback)

---

### Step 1: Start Databases via Docker Compose
To run PostgreSQL and Redis with a single command:
```bash
docker compose up postgres redis -d
```
*(If running on a server without Docker, simply supply a standard PostgreSQL `DATABASE_URL` in `backend/.env`)*.

---

### Step 2: Configure and Start the Independent Backend

```bash
cd backend

# 1. Copy environment template
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Generate Prisma client & apply database migrations
npx prisma generate
npx prisma migrate dev --name init

# 4. Seed development database (creates Super Admin, Admins, Couriers, Customers, Orders)
npm run prisma:seed

# 5. Start backend development server
npm run start:dev
```

The backend starts at:
* **API Base:** `http://localhost:4000/api/v1`
* **Swagger OpenAPI Docs:** `http://localhost:4000/api/docs`
* **Health Check Probe:** `http://localhost:4000/health`
* **WebSocket Gateway:** `ws://localhost:4000`

---

### Step 3: Run the Test Suite
Verify state machine transitions and business constraints:
```bash
cd backend
npm test
```

---

### Step 4: Start the React Native Mobile Application

```bash
cd ../mobile

# 1. Copy environment template
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Start Expo development server
npm run start
```

Press:
* `w` to open in Web Browser for immediate interactive preview
* `a` to open on an Android Emulator / Device
* `i` to open on an iOS Simulator

---

## 5. Seed Accounts & Credentials

The seed script creates ready-to-test commercial accounts with realistic Cairo coordinates and active delivery orders:

| Role | Login Identifier | Password | Description |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@fastman.com` | `Password123!` | Full fleet & system privileges |
| **Admin** | `admin@fastman.com` | `Password123!` | Order dispatch, fleet management, reports |
| **Dispatcher** | `dispatcher@fastman.com` | `Password123!` | Order creation & courier assignment |
| **Courier 1 (Ahmed)** | `+201000000011` | `Courier123!` | Status: **AVAILABLE** (Downtown Cairo) |
| **Courier 2 (Mohamed)** | `+201000000012` | `Courier123!` | Status: **BUSY** (Nasr City) |
| **Courier 3 (Mostafa)** | `+201000000013` | `Courier123!` | Status: **OFFLINE** (Maadi) |

> 💡 *The mobile Login screen includes 1-tap "Quick Demo" buttons that instantly fill credentials for rapid testing!*

---

## 6. Courier Delivery Workflow

```text
1. Assignment Received
   └── Courier receives assignment notification (real-time Socket.IO / Push).
       └── Courier taps [ ACCEPT ] or [ REJECT ].

2. Heading to Pickup
   └── Status moves to GOING_TO_PICKUP.
       └── Courier taps [ NAVIGATE ] to launch GPS directions to merchant.

3. Arrival & Collection
   └── Courier taps [ ARRIVED AT PICKUP ].
   └── Verifies package and taps [ CONFIRM PICKUP ] (Status: PICKED_UP).

4. Out for Delivery
   └── Courier advances to [ OUT FOR DELIVERY ].
   └── Live GPS location streams to Dispatcher live map.
   └── Courier taps [ ARRIVED AT CUSTOMER ].

5. Verification & Completion
   ├── Customer provides 4-digit OTP.
   ├── Courier enters OTP (validated server-side against argon2 hash).
   ├── Confirms Cash on Delivery (COD) amount collected.
   │   └── If amount differs, an explanation is required for audit reconciliation.
   ├── Attaches Proof of Delivery photo.
   └── Taps [ COMPLETE DELIVERY ] ──> Status: DELIVERED.
       ├── Order marked DELIVERED.
       ├── Courier freed to AVAILABLE.
       └── Courier commission credited to earnings ledger.
```

---

## 7. Production Deployment Guide

The backend is fully decoupled from the mobile app and is containerized for seamless cloud deployment on **Docker, AWS ECS/EC2, DigitalOcean, Hetzner, Render, or Railway**.

### Deploying Full Stack with Docker Compose
```bash
# 1. Build and run all services in production mode
docker compose up --build -d

# 2. Check health probe
curl http://localhost:4000/health

# Expected response:
# {"status":"ok","database":"connected","timestamp":"...","uptimeSeconds":15,"version":"1.0.0"}
```

### Production Environment Variables Reference
Ensure the following variables are configured in production:
* `DATABASE_URL`: PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/fastman`)
* `REDIS_URL`: Redis connection string (e.g. `redis://default:pass@host:6379`)
* `JWT_ACCESS_SECRET`: High-entropy 64-character secret
* `JWT_REFRESH_SECRET`: High-entropy 64-character secret
* `CORS_ORIGINS`: Comma-separated allowed origins (e.g. `https://admin.fastman.com`)
* `STORAGE_DRIVER`: `s3`, `r2`, or `local`
* `STORAGE_BUCKET`: S3 / R2 bucket name
* `FIREBASE_PROJECT_ID` & `FIREBASE_PRIVATE_KEY`: Service account credentials for FCM push
* `GOOGLE_MAPS_API_KEY`: Directions and distance calculation key

---

## 8. API Collection

A complete Postman / Insomnia API test collection is available at:
📁 `backend/fastman-api-collection.json`

Import this file into Postman or Insomnia to immediately run requests for:
* Health check
* Admin / Dispatcher Login
* Courier Login & Token Refresh
* Orders CRUD, Assignment, Operational Status Updates, Delivery OTP Verification
* Courier Availability Toggle & GPS Telemetry Submission
* Real-time Fleet Tracking
* Executive Financial Reports

---

## 9. License & Commercial Rights
FAST MAN Delivery Management Platform. All rights reserved.
