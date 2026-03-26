# Heed — Team-Centric Project & Task Operations

> **"Plan faster, collaborate clearly, and ship with confidence across teams and projects."**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?style=flat&logo=node.js)](https://nodejs.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat&logo=prisma)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20Ready-336791?style=flat&logo=postgresql)](https://www.postgresql.org)
[![MUI](https://img.shields.io/badge/MUI-7-007FFF?style=flat&logo=mui)](https://mui.com)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2-764ABC?style=flat&logo=redux)](https://redux-toolkit.js.org)
[![License](https://img.shields.io/badge/License-ISC-yellow?style=flat)](./server/package.json)

---

## What is Heed?

Heed is a full-stack collaboration platform for teams managing projects, tasks, and delivery workflows.

It combines:
- a React 19 dashboard frontend,
- an Express 5 backend API,
- Prisma + PostgreSQL data access,
- and secure auth with a 7-day JWT session cookie.

The result is a practical workspace where members can create teams, run projects, manage tasks, and collaborate through task comments.

---

## Core Capabilities

### 🔐 Session-Based Authentication
- Register, login, logout, refresh, profile bootstrap, forgot/reset password, and authenticated password change.
- Single JWT session stored in an HttpOnly cookie with a 7-day expiry.

### 👥 Team Collaboration
- Create teams, update team metadata, join by invite code.
- Add/remove members with permission checks.

### 📁 Project Operations
- Team-scoped projects with status/result handling.
- Member management per project.

### ✅ Task Lifecycle Management
- Create/update/delete tasks, fetch by project, and fetch single task details.
- Priority/type/status-driven workflows.

### 💬 Task Comments
- Load, add, and delete comments per task.
- Access-controlled by project/team membership.

### 🎨 Production UI Foundations
- Route guards, app-level ErrorBoundary, global theme support, loading states, and improved null-safe date rendering.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│ React 19 · Vite 7 · Redux Toolkit · RTK Query · MUI ·      │
│ Tailwind v4 · React Router v7 · Axios + cookie sessions     │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST / JSON + cookies
┌──────────────────────────▼──────────────────────────────────┐
│                         SERVER                              │
│ Express 5 · JWT · bcrypt · cookie-parser · CORS · helmet    │
│ Rate limiting · Brevo Transactional Email · Prisma adapter (pg) │
└──────────────────────────┬──────────────────────────────────┘
                           │ Prisma Client
┌──────────────────────────▼──────────────────────────────────┐
│                       DATABASE                              │
│ PostgreSQL (Neon-ready)                                     │
│ Teams · Projects · Tasks · Comments · Invites · Notifications│
└─────────────────────────────────────────────────────────────┘
```

---

## Monorepo Structure

```
Heed/
├── client/                         # React frontend
│   ├── src/
│   │   ├── components/             # Layout, dashboards, project/team/task UI
│   │   ├── context/                # AuthContext
│   │   ├── hooks/                  # App initialization + helpers
│   │   ├── lib/                    # Axios client with cookie-session handling
│   │   ├── pages/                  # Auth + app pages
│   │   ├── store/                  # Redux slices, selectors, thunks, RTK Query
│   │   └── theme/                  # Theme tokens/provider
│   └── package.json
│
├── server/                         # Express backend
│   ├── app.js                      # Middleware + route mounting
│   ├── index.js                    # Boot + graceful shutdown
│   ├── prisma.config.ts            # Prisma datasource config
│   ├── prisma/
│   │   ├── schema.prisma           # Full data model
│   │   └── migrations/
│   ├── src/
│   │   ├── controllers/            # auth, users, teams, projects, tasks, comments
│   │   ├── routes/                 # API route definitions
│   │   ├── middlewares/            # auth middleware
│   │   ├── prisma/                 # Prisma client singleton
│   │   └── utils/                  # email service
│   └── package.json
│
└── docs/
    ├── DATA_FETCHING_API.md
    └── project-build-flow/
```

---

## API Overview

Base URL: `http://localhost:5000/api`

| Domain | Method | Endpoint |
|---|---|---|
| Health | `GET` | `/health` |
| Auth | `POST` | `/auth/register` |
| Auth | `POST` | `/auth/login` |
| Auth | `POST` | `/auth/logout` |
| Auth | `POST` | `/auth/refresh` |
| Auth | `GET` | `/auth/me` |
| Auth | `POST` | `/auth/forgot-password` |
| Auth | `POST` | `/auth/reset-password` |
| Auth | `POST` | `/auth/change-password` |
| Users | `GET` | `/users/me` |
| Users | `PATCH` | `/users/me` |
| Teams | `GET` | `/teams` |
| Teams | `GET` | `/teams/:teamId` |
| Teams | `POST` | `/teams` |
| Teams | `PATCH` | `/teams/:teamId` |
| Teams | `POST` | `/teams/join` |
| Teams | `POST` | `/teams/:teamId/members` |
| Teams | `DELETE` | `/teams/:teamId/members/:userId` |
| Teams | `DELETE` | `/teams/:teamId` |
| Projects | `GET` | `/projects` |
| Projects | `GET` | `/projects/:projectId` |
| Projects | `POST` | `/projects` |
| Projects | `PATCH` | `/projects/:projectId` |
| Projects | `POST` | `/projects/:projectId/members` |
| Projects | `DELETE` | `/projects/:projectId/members/:userId` |
| Projects | `DELETE` | `/projects/:projectId` |
| Tasks | `GET` | `/tasks` |
| Tasks | `GET` | `/tasks/:taskId` |
| Tasks | `GET` | `/tasks/project/:projectId` |
| Tasks | `POST` | `/tasks` |
| Tasks | `PUT` | `/tasks/:taskId` |
| Tasks | `DELETE` | `/tasks/:taskId` |
| Comments | `GET` | `/tasks/:taskId/comments` |
| Comments | `POST` | `/tasks/:taskId/comments` |
| Comments | `DELETE` | `/tasks/comments/:commentId` |

---

## Local Setup

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| PostgreSQL / Neon | Active connection |

### 1) Clone

```bash
git clone <your-repo-url>
cd Heed
```

### 2) Backend Setup

```bash
cd server
npm install
npx prisma generate
npm run dev
```

Create `server/.env` with values similar to:

```env
# Server
PORT=5000
HOST=localhost
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Auth
JWT_SECRET=change_me_session_secret

# Email (required for verification + reset flows)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your-verified-sender@example.com
BREVO_SENDER_NAME=Heed
```

Production notes:
- Use a Brevo sender email/domain that is verified in your Brevo account.
- Keep `BREVO_API_KEY` in secret manager / environment settings (never commit it).
- On server boot, the backend logs whether Brevo config is complete.

### 3) Frontend Setup

```bash
cd client
npm install
npm run dev
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4) Optional Prisma Migration Flow

If you need to apply migrations on a fresh database:

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

---

## Frontend Highlights

- Protected and public route guards in `App.jsx`.
- Global app initialization hook for profile/team/project/task bootstrap.
- Redux store slices for users, teams, projects, tasks, settings, and theme.
- RTK Query API slice for normalized network access.
- Axios interceptor for auth expiry detection and session revalidation.
- ErrorBoundary wrapping app shell.

---

## Data Model Snapshot

Primary relational entities in Prisma:
- `User`
- `Team`, `TeamMember`, `TeamInvite`
- `Project`, `ProjectMember`
- `Task`, `TaskLabel`, `Label`
- `Comment` (threaded via parent/replies)
- `ActivityLog`, `Notification`

---

## Scripts

### Client

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Server

```bash
npm run dev
npm start
```

---

## License

MIT © 2026 Heed
