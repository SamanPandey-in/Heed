# Heed Data Fetching API

Date: 2026-03-26

## Purpose

This document explains how authenticated workspace data is loaded after a user signs in.

The current auth model is cookie-based:

- login sets an HttpOnly `sessionToken` cookie
- app startup validates the cookie with `GET /api/auth/me`
- protected API calls rely on the browser sending the cookie automatically

For the full auth architecture, see `docs/AUTH_SYSTEM.md`.

## Startup Flow

```text
App loads
  -> AuthProvider validates session with GET /api/auth/me
  -> Route guards wait for authChecked/loading to settle
  -> AppInitializer runs after authentication succeeds
  -> Redux thunks fetch teams, projects, and tasks
  -> Dashboard and workspace pages render from Redux state
```

## Auth Bootstrap

### Session restore

`GET /api/auth/me`

- Auth: Required via HttpOnly session cookie
- Returns: `{ user }`
- Purpose: validate the current session without extending it

### Compatibility session validation

`POST /api/auth/refresh`

- Auth: Required via HttpOnly session cookie
- Returns: `{ user }`
- Purpose: compatibility endpoint for session revalidation
- Note: this does not mint a new JWT

## Workspace APIs

### Teams

`GET /api/teams`

- Auth: Required via HttpOnly session cookie
- Returns: `{ teams }`
- Scope: teams where the authenticated user is a member

`GET /api/teams/:teamId`

- Auth: Required
- Returns: `{ team }`

`POST /api/teams`

- Auth: Required
- Body: `{ name, description }`

`DELETE /api/teams/:teamId`

- Auth: Required
- Restriction: team owner only

### Projects

`GET /api/projects`

- Auth: Required
- Returns: `{ projects }`
- Scope: projects in the authenticated user's teams

`GET /api/projects/:projectId`

- Auth: Required
- Returns: `{ project }`

`POST /api/projects`

- Auth: Required
- Body: `{ name, description, teamId, status }`

`DELETE /api/projects/:projectId`

- Auth: Required
- Restriction: project creator only

### Tasks

`GET /api/tasks`

- Auth: Required
- Returns: `{ tasks }`
- Scope: tasks in the authenticated user's accessible projects

`GET /api/tasks/project/:projectId`

- Auth: Required
- Returns: `{ tasks }`

`POST /api/tasks`

- Auth: Required
- Body: `{ title, description, projectId, assigneeId, priority, dueDate }`

`PUT /api/tasks/:taskId`

- Auth: Required
- Body: `{ title, description, status, priority, assigneeId, dueDate }`

`DELETE /api/tasks/:taskId`

- Auth: Required
- Restriction: task creator only

## Data Flow Example

```text
1. Login form submits credentials
   -> POST /api/auth/login
   -> backend sets HttpOnly sessionToken cookie
   -> AuthContext stores authenticated user state

2. AppInitializer sees isAuthenticated = true
   -> useInitializeAppData starts

3. Parallel workspace requests run
   -> GET /api/teams
   -> GET /api/projects
   -> GET /api/tasks

4. Redux is hydrated
   -> teams slice updated
   -> projects slice updated
   -> tasks slice updated

5. Dashboard and workspace pages render from Redux selectors
```

## Failure Behavior

- If `/api/auth/me` returns `401`, the app treats the user as signed out.
- If a protected workspace request returns `401`, the frontend revalidates the current session.
- If revalidation fails, auth state is cleared and the user is redirected to login.

## Notes

- SSE and socket clients still use cookies and compatible token extraction helpers.
- The frontend does not read JWTs directly.
- No `localStorage` token persistence is used in the current auth system.
