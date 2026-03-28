# AdlTrack — نظام إدارة الإجراءات القضائية

A comprehensive judicial procedures management system for tracking **Rehabilitation Requests (طلبات رد الاعتبار)** and the **Alternative Penalties Registry (سجل العقوبات البديلة)**. The application provides tools for recording, tracking, and analyzing various judicial requests and enforcement measures.

> UI language: **Arabic (RTL)**

---

## Features

### Core Modules
- **Rehabilitation Requests (طلبات رد الاعتبار)** — Create, view, update, and track requests with status workflow (Pending → Approved/Rejected).
- **Rehabilitation Request Reports (محاضر رد الاعتبار)** — Linked reports per request, including full case details and court information.
- **Alternative Penalties Registry (سجل العقوبات البديلة)** — Full registry covering original penalties, alternative penalty details, supervising institutions, follow-up orders, disputes, and final decisions.
- **Deposits & Refunds** — Manage financial deposits and refund operations.
- **Seizures** — Multi-step form for recording seizure cases.
- **Private Deposit Accounts** — Track private deposit account records.

### System Modules
- **User Management** — Role-based access control (`ADMIN` / `CLERK`). Admins can create and manage user accounts.
- **Audit Logs** — Every create/update/delete operation is logged with old/new data and the acting user.
- **Notifications** — In-app notification system per user.
- **Dashboard Statistics** — Overview cards with counts and charts for all modules.
- **Settings & Profile** — User profile management and application settings.

### Technical Highlights
- Full Arabic RTL interface
- JWT-based authentication with secure HTTP-only cookies
- Password hashing with bcryptjs
- Debounced search + server-side pagination on all list views
- DOCX document generation via `docxtemplater`
- Animated UI with Framer Motion
- Dark/light theme support via `next-themes`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| Database | MySQL |
| ORM | Prisma 6 |
| Styling | Tailwind CSS v4 |
| Component Library | Shadcn UI (Radix UI primitives) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Icons | Lucide React |
| Auth | JWT + bcryptjs |
| Document Export | docxtemplater + pizzip |

---

## Project Structure

```
AdlTrack/
├── prisma/
│   ├── schema.prisma             # Database schema (all models)
│   ├── seed.ts                   # Initial seed data (default users)
│   └── adltrack_db.sql           # Full DB dump (phpMyAdmin export)
├── public/                       # Static assets
├── src/
│   ├── app/
│   │   ├── (dashboard)/          # Authenticated routes (sidebar layout)
│   │   │   ├── alternative-penalties/
│   │   │   ├── audit-logs/
│   │   │   ├── deposits/
│   │   │   ├── list/
│   │   │   ├── new/
│   │   │   ├── private-depo-acc/
│   │   │   ├── profile/
│   │   │   ├── refunds/
│   │   │   ├── rehabilitation-requests/
│   │   │   ├── rehabilitation-requests-rapport/
│   │   │   ├── settings/
│   │   │   ├── users/
│   │   │   └── layout.tsx        # Dashboard shell with sidebar
│   │   ├── api/                  # REST API route handlers
│   │   │   ├── auth/login/       # POST /api/auth/login
│   │   │   ├── auth/logout/      # POST /api/auth/logout
│   │   │   ├── alternative-penalties/
│   │   │   ├── audit-logs/
│   │   │   ├── deposits/
│   │   │   ├── notifications/
│   │   │   ├── private-depo-acc/
│   │   │   ├── refunds/
│   │   │   ├── rehabilitation-requests/
│   │   │   ├── rehabilitation-requests-rapport/
│   │   │   ├── seizures/
│   │   │   ├── stats/
│   │   │   └── users/
│   │   ├── login/                # Public login page
│   │   ├── globals.css
│   │   └── layout.tsx            # Root layout (Cairo font, AuthProvider, Toaster)
│   ├── components/
│   │   ├── layout/               # Sidebar, Header, DashboardLayout
│   │   ├── ui/                   # Shadcn UI primitives (button, table, dialog …)
│   │   ├── AdminLayout.tsx
│   │   ├── AlternativePenaltiesList.tsx
│   │   ├── AlternativePenaltyForm.tsx
│   │   ├── CorrespondenceList.tsx
│   │   ├── DashboardCharts.tsx
│   │   ├── DepositsList.tsx
│   │   ├── ErrorReporter.tsx
│   │   ├── PrivateDepoAccList.tsx
│   │   ├── RegistrationForm.tsx
│   │   ├── RehabilitationRequestForm.tsx
│   │   ├── RehabilitationRequestRapportForm.tsx
│   │   ├── RehabilitationRequestRapportList.tsx
│   │   ├── RehabilitationRequestsList.tsx
│   │   └── UsersTable.tsx
│   ├── context/
│   │   └── AuthContext.tsx       # JWT auth context + useAuth hook
│   ├── hooks/
│   │   ├── use-debounce.ts
│   │   └── use-mobile.ts
│   ├── lib/
│   │   ├── prisma.ts             # Prisma client singleton
│   │   ├── audit.ts              # Audit log helpers
│   │   ├── notifications.ts      # Notification helpers
│   │   ├── seizures.ts           # Seizures logic
│   │   ├── users.ts              # User helpers
│   │   └── utils.ts              # Shared utilities (cn, formatters)
│   ├── middleware.ts             # JWT auth middleware (route protection)
│   └── types/
│       └── index.ts              # Shared TypeScript interfaces
├── .env                          # Environment variables (not committed)
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Database Schema

| Model | Table | Description |
|---|---|---|
| `User` | `user` | Application users with roles |
| `RehabilitationRequest` | `rehabilitation_requests` | Rehabilitation request records |
| `RehabilitationRequestRapport` | `rehabilitation_requests_rapport` | Reports linked to requests |
| `AlternativePenalty` | `alternative_penalties_registry` | Alternative penalties registry |
| `AuditLog` | `auditlog` | System-wide audit trail |
| `Notification` | `notification` | Per-user notifications |

---

## Prerequisites

- **Node.js** v20+
- **Bun** v1.3+ (recommended) or npm/yarn
- **MySQL** 8.0+ running locally or remotely

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd <project-folder>
```

### 2. Install dependencies

```bash
bun install
# or
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="mysql://root:<password>@localhost:3306/AdlTrack_db"
JWT_SECRET="your-super-secret-key-change-it"
```

Replace `<password>` with your MySQL root password. Leave it empty if there is no password: `mysql://root:@localhost:3306/AdlTrack_db`.

### 4. Set up the database

Create the database in MySQL:

```sql
CREATE DATABASE AdlTrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then run Prisma migrations to create all tables:

```bash
npx prisma migrate dev
```

Or, if you have the provided SQL dump (`prisma/adltrack_db.sql`):

```bash
mysql -u root -p AdlTrack_db < prisma/adltrack_db.sql
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Seed the database (optional)

```bash
npx prisma db seed
```

### 7. Run the development server

```bash
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `bun dev` | Start development server with Turbopack |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma Studio (database GUI) |
| `npx prisma migrate dev` | Run pending migrations |
| `npx prisma generate` | Regenerate Prisma client |

---

## Authentication

- Navigate to `/login` to sign in.
- Default roles: `ADMIN` (full access) and `CLERK` (read/write, no user management).
- Sessions are managed via JWT tokens stored in HTTP-only cookies.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | MySQL connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens |
