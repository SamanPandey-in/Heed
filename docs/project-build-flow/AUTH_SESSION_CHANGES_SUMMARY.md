# Heed - Auth Session Change Summary

Latest note: the current production auth model is documented in `docs/AUTH_SYSTEM.md`.
This older summary captures the earlier migration work; the new doc is the source of truth for the single-cookie 7-day JWT session system.

Date: 2026-03-17  
Scope: Authentication migration completion, backend data APIs, Redux initialization, profile persistence, avatar sync

## 1) High-Level Outcome

This session converted key flows from placeholder/mock behavior to backend-driven behavior and connected profile state across app surfaces.

### What now works end-to-end
- Auth session restore and route guards are backend-driven.
- Forgot/reset password flow is implemented with backend token + email sending.
- Core workspace data (user profile, teams, projects, tasks) initializes from backend and is dispatched into Redux.
- Profile edits (name, username, bio, avatar) persist via API and are reflected immediately in Redux/UI.
- Navbar avatar now reflects the persisted user avatar.

---

## 2) Frontend Changes

## 2.1 Auth Context and Session Restore

File: `client/src/context/AuthContext.jsx`

- Auth operations centralized in context:
  - `login(email, password)`
  - `signup({ fullName, username, email, password })`
  - `logout()`
  - `forgotPassword(payload)`
  - `resetPassword({ token, newPassword })`
  - `revalidateSession()`
- `forgotPassword` supports both call styles:
  - string email
  - object payload `{ email }`
- Session restore on mount via `GET /auth/me` (cookie-based session).
- Added StrictMode-safe guard using `useRef` to prevent duplicate restore requests in dev.

## 2.2 Routing and App Initialization

File: `client/src/App.jsx`

- Uses `AuthProvider` route guards (`ProtectedRoute`, `PublicRoute`).
- Added `AppInitializer` wrapper to trigger Redux bootstrap after authentication.
- Added route for password reset page:
  - `/reset-password`

File: `client/src/pages/index.js`
- Exported `ResetPassword` page.

## 2.3 App Data Bootstrap Hook

File: `client/src/hooks/useInitializeAppData.js`

- Added/updated bootstrapping hook to fetch and dispatch backend data after auth:
  - `GET /auth/me` -> `setUser(...)`
  - `GET /teams` -> `setTeams(...)`
  - `GET /projects` -> `setProjects(...)`
  - `GET /tasks` -> `setTasks(...)`
- Uses `Promise.allSettled` to tolerate partial failures.
- Updates user/tasks loading and error states in Redux.

## 2.4 Auth Pages

Files:
- `client/src/pages/Auth/Login.jsx`
- `client/src/pages/Auth/Signup.jsx`
- `client/src/pages/Auth/ForgotPassword.jsx`
- `client/src/pages/Auth/ResetPassword.jsx`

Changes:
- Unified auth actions to `useAuth` context (no direct Firebase auth calls in these pages).
- Added submit behavior reliability:
  - Auth CTA buttons now use `type="submit"`.
- Added complete reset-password UI:
  - Reads token from query params
  - Validates password/confirm password
  - Calls `resetPassword(...)`

## 2.5 Profile Page: No Mock User Data + Persistent Updates

File: `client/src/pages/Profile.jsx`

- Removed dependency on `dummyUsers`.
- Reads current user from Redux (`state.users`).
- Displays backend-backed profile fields (`fullName`, `username`, `email`, `bio`, `avatarUrl`, `createdAt`).
- Added save handlers that persist to backend:
  - Name -> `PATCH /users/me` with `{ fullName }`
  - Username -> `PATCH /users/me` with `{ username }`
  - About -> `PATCH /users/me` with `{ bio }`
  - Avatar -> `PATCH /users/me` with `{ avatarUrl }`
- Avatar editor includes:
  - URL input
  - image file picker (`image/*`, max 2MB)
  - data URL conversion for local upload source
  - save/remove/cancel actions
- On successful save, dispatches Redux user update immediately.

## 2.6 Navbar Avatar Sync

File: `client/src/components/layout/Navbar.jsx`

- Removed hardcoded avatar asset usage.
- Avatar now reads from Redux current user:
  - `avatarUrl` (or `image` fallback)
  - initials fallback when no image exists
- Result: profile avatar updates are reflected in navbar immediately.

## 2.7 User Slice Enhancements

File: `client/src/store/slices/userSlice.js`

- `setUser` now accepts/stores richer profile payload:
  - `id`, `email`, `username`, `fullName`, `avatarUrl`, `bio`, `isEmailVerified`
  - `createdAt`, `updatedAt`, `lastLoginAt`, `teamIds`
- Added compatibility aliases for UI (`name`, `image`, `about`).
- Added `updateCurrentUser` reducer for patch/merge updates after profile save.

---

## 3) Backend Changes

## 3.1 Auth Controller Enhancements

File: `server/src/controllers/auth.controller.js`

- `safeUser` payload expanded to include:
  - `createdAt`, `updatedAt`, `lastLoginAt`, `teamIds`
- `forgotPassword` now sends real reset email via `sendPasswordResetEmail(...)`.
- Uses secure reset token flow:
  - random token generation
  - SHA-256 hash stored in DB
  - expiry validation
- Existing auth routes retained:
  - register/login/logout/refresh/me/forgot-password/reset-password

## 3.2 Email Service

File: `server/src/utils/emailService.js`

- Added Nodemailer transporter and SMTP verification.
- Added `sendPasswordResetEmail(...)` with HTML email template.
- Added `sendWelcomeEmail(...)` utility.

## 3.3 New Users API (Profile)

Files:
- `server/src/controllers/users.controller.js`
- `server/src/routes/users.route.js`

Added endpoints:
- `GET /api/users/me` -> returns authenticated user profile
- `PATCH /api/users/me` -> updates profile fields

Supported PATCH fields:
- `fullName`
- `username` (with uniqueness check)
- `bio`
- `avatarUrl`

Validation/behavior:
- Requires authentication (`authenticate` middleware).
- Rejects empty full name / username.
- Returns `409` if username is already in use.
- Returns normalized safe user payload.

## 3.4 New Teams/Projects/Tasks APIs

Files:
- Controllers:
  - `server/src/controllers/teams.controller.js`
  - `server/src/controllers/projects.controller.js`
  - `server/src/controllers/tasks.controller.js`
- Routes:
  - `server/src/routes/teams.route.js`
  - `server/src/routes/projects.route.js`
  - `server/src/routes/tasks.route.js`

Added route groups:
- `/api/teams`
- `/api/projects`
- `/api/tasks`

These endpoints are auth-protected and enforce membership/ownership checks before access or destructive actions.

## 3.5 Express Route Registration

File: `server/app.js`

Registered route modules:
- `/api/auth`
- `/api/users`
- `/api/teams`
- `/api/projects`
- `/api/tasks`

---

## 4) Environment and Config Updates

File: `server/.env.example`

Added SMTP variables:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

Used by Nodemailer email delivery for password reset.

---

## 5) Known Notes

- A 401 on `/api/auth/me` is expected when no valid session cookie exists.
- In development, StrictMode can trigger duplicate effects; this is guarded in auth session restore.
- Some UI lint suggestions remain for Tailwind utility aliases (non-functional, cosmetic only).

---

## 6) Existing Related Docs

- `docs/DATA_FETCHING_API.md` documents the data bootstrapping/API flow in detail.

---

## 7) Quick Verification Checklist

- Login works and redirects to dashboard.
- Signup button submits and creates account.
- Forgot password sends success response and email path is active.
- Reset password page works with token query parameter.
- After auth, user + teams + projects + tasks populate Redux from backend.
- Profile updates persist and survive refresh.
- Navbar avatar updates after profile avatar save.
