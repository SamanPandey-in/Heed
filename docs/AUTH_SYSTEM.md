# Heed Auth System

Date: 2026-03-26

## Overview

Heed now uses a single JWT-based session model.

- The backend issues one JWT with a 7-day expiry.
- The JWT is stored in an HttpOnly cookie named `sessionToken`.
- The frontend never stores auth tokens in `localStorage` or `sessionStorage`.
- Protected API requests rely on the browser sending the cookie automatically.

This replaces the earlier access-token + refresh-token documentation that no longer matched the running code.

## What Changed

The auth system was hardened to fix login bounce/session persistence issues and remove legacy refresh-token drift.

- Frontend startup now validates the current session with `GET /api/auth/me`.
- `POST /api/auth/refresh` still exists, but now only validates the current cookie-backed session and does not extend it.
- The session is no longer a sliding session. A JWT issued at login expires after 7 days.
- Invalid or expired cookies are cleared consistently.
- Login/logout state is synchronized across browser tabs.
- The unused `refresh_token` database column was removed from the Prisma schema and a migration was added.

## Backend Flow

### Login

`POST /api/auth/login`

- Verifies email/password.
- Rejects unverified email addresses.
- Signs a JWT with a 7-day expiry.
- Sets the `sessionToken` cookie with `HttpOnly`, `Secure`, `SameSite`, and `path=/`.
- Returns the safe user payload.

### Auth Validation

Protected routes use `authenticate` middleware.

- Reads JWT from the `sessionToken` cookie.
- Also supports `Authorization: Bearer ...` and `?token=` for compatibility with sockets/SSE helpers.
- Verifies JWT signature and expiry.
- Confirms the user still exists in Postgres.
- Attaches `req.userId`, `req.user`, and `req.auth` to the request.

### Session Restore

`GET /api/auth/me`

- Validates the existing session cookie through auth middleware.
- Returns the authenticated user payload.
- Does not rotate or extend the session.

### Session Revalidation

`POST /api/auth/refresh`

- Kept for compatibility with older callers.
- Now behaves as a session validation endpoint only.
- Returns the current user if the cookie is still valid.
- Does not mint a new JWT.

### Logout and Forced Re-Login

These flows clear the session cookie and require a new login:

- `POST /api/auth/logout`
- `POST /api/auth/reset-password`
- `POST /api/auth/change-password`
- Expired or invalid JWT validation failures

## Frontend Flow

### Auth Bootstrap

`AuthProvider` performs one session check on app startup.

- Calls `GET /api/auth/me`.
- Sets `loading` and `authChecked` so routes do not render too early.
- Prevents redirect flicker between `/login` and protected routes.

### Route Guards

- `ProtectedRoute` waits for auth bootstrap before rendering app routes.
- `PublicRoute` waits for auth bootstrap before deciding whether to show `/login` or redirect to `/dashboard`.

### Unauthorized Handling

- Axios listens for non-auth endpoint `401` responses.
- The app revalidates the current session.
- If validation fails, local auth state is cleared and the user is returned to login.

### Multi-Tab Behavior

- Login broadcasts a cross-tab auth sync event.
- Logout broadcasts a cross-tab auth sync event.
- Other tabs revalidate or clear state accordingly.

## Cookie and CORS Expectations

The current setup expects:

- `withCredentials: true` on Axios and socket clients
- `credentials: true` in Express CORS
- `cookie-parser` enabled on the backend
- `COOKIE_SECURE` and `COOKIE_SAME_SITE` aligned with the deployment topology

Recommended environment variables:

```env
JWT_SECRET=change_me_session_secret
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
CORS_ORIGIN=https://your-frontend-origin.example
```

For local development on the same site/proxy, `COOKIE_SECURE=false` and `COOKIE_SAME_SITE=lax` are acceptable.

## Database Notes

The `User` table stores:

- password hash
- email verification state
- password reset token + expiry
- verification token + expiry
- last login timestamp

The old `refresh_token` column is no longer part of the active auth model.

Migration added:

- `server/prisma/migrations/20260326153000_drop_legacy_refresh_token`

## Edge Cases Covered

- Refresh after login keeps the user signed in if the cookie is still valid.
- Expired sessions return `401`, clear the invalid cookie, and send the user back to login.
- Multiple tabs stay in sync after login/logout.
- Protected routes wait for auth bootstrap before rendering.
- Socket and SSE requests can still authenticate when cookies are present.

## Current Non-Goals

These are not implemented in the current auth system:

- separate refresh tokens
- silent refresh token rotation
- server-side session blacklist/revocation table
- automated auth integration tests

If those are added later, this document should be updated rather than reintroducing access-token/refresh-token terminology by accident.
