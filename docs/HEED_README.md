<div align="center">

<br />

```
██╗  ██╗███████╗███████╗██████╗
██║  ██║██╔════╝██╔════╝██╔══██╗
███████║█████╗  █████╗  ██║  ██║
██╔══██║██╔══╝  ██╔══╝  ██║  ██║
██║  ██║███████╗███████╗██████╔╝
╚═╝  ╚═╝╚══════╝╚══════╝╚═════╝
```

**A real-time, multi-user project management platform built to survive concurrent writes, not just demo them.**  
Kanban boards, sprints, and issue tracking — with transaction-safe writes and horizontally scalable real-time sync.

<br />

[![License: MIT](https://img.shields.io/badge/License-MIT-zinc.svg?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=flat-square&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-red?style=flat-square&logo=redis)](https://redis.io)
[![Socket.io](https://img.shields.io/badge/Socket.io-4-black?style=flat-square&logo=socket.io)](https://socket.io)

<br />

[**Live Demo**](https://heed.yourdomain.com) · [**Architecture**](#architecture) · [**Concurrency Model**](#concurrency--consistency) · [**Self-Hosting**](#self-hosting)

<br />

</div>

---

## What Is This

HEED is a Jira-style project management tool — teams, projects, issue hierarchies (epics → stories → sub-tasks), a drag-and-drop Kanban board, threaded comments, and live presence — built to understand what it actually takes to make a multi-user collaborative board *correct* under concurrent writes, not just fast on a single laptop demo.

The first version worked. It also had a real, provable lost-update bug: two users completing tasks in the same project within milliseconds of each other could silently corrupt the project's progress percentage, because the update wasn't atomic. This version exists because I found that bug, understood exactly which Postgres isolation-level guarantee was missing, and rebuilt the write path — plus the real-time layer, the ordering model, and the caching layer — around it.

This is not a tutorial CRUD board with sockets bolted on. It handles the problems tutorials skip: optimistic concurrency control on every task mutation, atomic progress recomputation inside a single transaction, conflict-free drag-and-drop reordering under concurrent moves, and a real-time layer that stays correct when you run more than one server process.

---

## Architecture

```
                         ┌───────────────────────────────────────────┐
                         │                 Client                     │
                         │   React 19 + Redux Toolkit + dnd-kit       │
                         │   optimistic UI, rolled back on 409        │
                         └──────────────┬──────────────────┬─────────┘
                                        │                  │
                             HTTPS (REST)          WebSocket (Socket.io)
                                        │                  │
                         ┌──────────────▼──────┐  ┌────────▼─────────────┐
                         │   Express API        │  │   Socket.io Server    │
                         │   (N instances,      │  │   (N instances)       │
                         │   behind LB)          │  │                       │
                         └──────────┬───────────┘  └───────────┬──────────┘
                                    │                           │
                                    │              @socket.io/redis-adapter
                                    │              rooms + presence fan out
                                    │              across every instance
                                    │                           │
                         ┌──────────▼───────────────────────────▼──────────┐
                         │                    Redis                        │
                         │   • board-view cache (TTL + write-through purge) │
                         │   • Socket.io adapter (pub/sub)                  │
                         │   • presence set per project room                │
                         └──────────────────────┬────────────────────────────┘
                                                │
                         ┌──────────────────────▼────────────────────────────┐
                         │                  PostgreSQL                        │
                         │   Prisma + PgBouncer (transaction pooling)         │
                         │                                                    │
                         │   tasks.version         → optimistic concurrency  │
                         │   tasks.order (LexoRank) → conflict-free reorder  │
                         │   projects.progress      → written inside one     │
                         │                            atomic transaction     │
                         │                            with the task write    │
                         │   comments.body_tsv (GIN) → full-text search      │
                         └────────────────────────────────────────────────────┘


  Task Update Flow (the write path that actually matters):

  PATCH /tasks/:id   { status: "DONE", version: 4 }
           │
           ▼
  ┌────────────────────────────────────────────────────────────┐
  │  prisma.$transaction(async (tx) => {                        │
  │    UPDATE tasks SET status=$1, version=version+1             │
  │      WHERE id=$2 AND version=$3                              │
  │      ── 0 rows affected → stale write → abort, return 409   │
  │                                                                │
  │    UPDATE projects SET progress = (                          │
  │      SELECT round(100.0 * count(*) FILTER (WHERE status=     │
  │      'DONE') / GREATEST(count(*),1)) FROM tasks WHERE        │
  │      project_id = $4                                         │
  │    ) WHERE id = $4                                            │
  │    ── single atomic statement, no read-then-write race        │
  │  })                                                            │
  └───────────────────────┬──────────────────────────────────────┘
                          │
              200 + new version, or 409 + latest server state
                          │
                          ▼
              io.to(`project:${projectId}`).emit("task:updated", task)
              → every connected client re-renders the board,
                including instances other than the one that
                accepted the write (via the Redis adapter)


  Drag-and-Drop Reorder (concurrent-move-safe):

  Card dropped between order "a3" and "a5"
           │
           ▼
  fractional-indexing.generateKeyBetween("a3", "a5") → "a4"
           │
           ▼
  UPDATE tasks SET order="a4", status=$col, version=version+1
    WHERE id=$id AND version=$expected
  ── touches exactly ONE row, regardless of how many other
     cards moved in the same column at the same instant
```

---

## Stack

| Layer | Technology | Why |
|---|---|---|
| **API Server** | Node.js, Express 5 | Simple, well-understood request/response model for a REST-first board |
| **Real-time** | Socket.io 4 + `@socket.io/redis-adapter` | Bi-directional push for board state and presence, correct across horizontally scaled instances |
| **Database** | PostgreSQL 16 + Prisma 7 | ACID transactions where the write actually needs them; relational model matches the project→task→comment hierarchy naturally |
| **Connection Pooling** | PgBouncer (transaction mode) | Prevents connection exhaustion under concurrent request bursts |
| **Cache / Pub-Sub** | Redis (ioredis) | Board-view read cache, Socket.io room fan-out, distributed presence set |
| **Concurrency Control** | `version` column (OCC) + single-statement atomic updates | Conflicting edits surface as a `409` instead of silently vanishing |
| **Ordering** | Fractional indexing (LexoRank-style keys) | Reordering one card never requires rewriting every other card's position |
| **Search** | PostgreSQL full-text search (`tsvector` + GIN) | Fast fuzzy search across tasks/comments without standing up a separate search cluster |
| **Frontend** | React 19, Redux Toolkit, MUI, dnd-kit, Tailwind | Optimistic UI updates with a clean rollback path on server conflict |
| **Auth** | JWT (httpOnly cookie) | Standard session handling, validated per socket connection too |
| **Logging** | Pino (structured JSON) | Consistent fields across REST and socket event logs |
| **Load Testing** | k6 | Concurrency and conflict-rate claims are measured, not assumed |

---

## Concurrency & Consistency

This is the part of the project actually worth discussing in depth, so it gets its own section instead of being buried in a features list.

**The problem the first version had:** task completion recomputed project progress across four separate database round-trips (read task count, read done count, compute percentage, write). Under Postgres's default `READ COMMITTED` isolation level, two users completing different tasks in the same project at nearly the same time could each read a stale count and each write a now-incorrect percentage — a textbook lost update, and it happened silently with no error, no log line, nothing to indicate data had been corrupted.

**The fix, in two parts:**
1. **Atomicity** — the task mutation and the progress recompute now happen inside one `prisma.$transaction`. If either half fails, both roll back.
2. **The race itself** — rather than reading counts in application code and writing them back (read-then-write, which is exactly where the race lived), the progress percentage is now computed with a single `UPDATE ... SET progress = (SELECT ...)` statement. Postgres's own MVCC guarantees this is race-free without needing to reason about isolation levels at the application layer at all.

**Optimistic concurrency control on every task write.** Every `Task` row carries a `version` integer. Every update is conditioned on `WHERE id = $1 AND version = $2`; if the row was already changed by someone else, zero rows match, and the API returns `409 Conflict` with the current server-side state. The client shows *"This task changed — here's what's there now"* instead of one user's edit disappearing without a trace. This was chosen over row-level pessimistic locking (`SELECT ... FOR UPDATE`) deliberately: a task can sit open in someone's edit form for tens of seconds, and blocking every other writer for that whole window would tank throughput for no real benefit — conflicts on the same task at the same second are rare enough that "detect and ask" beats "block and wait."

**Reordering is conflict-free by construction.** Task position uses fractional indexing instead of integer positions. Moving a card assigns it a rank string that sorts between its new neighbors (`"a3"` and `"a5"` → `"a4"`), so a reorder is always a single-row write. The old integer-`order` scheme required renumbering every card below the drop point, which is exactly the kind of operation that produces duplicate or out-of-order positions when two people reorder the same column at once.

**Measured, not assumed.** A k6 script drives N concurrent clients issuing simultaneous `PATCH /tasks/:id` requests against the same task and against different tasks in the same project, and asserts: zero lost updates on progress, a bounded and expected `409` rate on genuinely simultaneous same-task edits, and p95 latency under the target threshold as instance count and cache hit rate change. The numbers from that run are in [`/loadtest/results`](#).

---

## Features

### Real-Time Board
- Kanban board with drag-and-drop across `BACKLOG → TODO → IN_PROGRESS → IN_REVIEW → DONE`, backed by conflict-free fractional-index reordering.
- Optimistic UI — the card moves instantly client-side; a `409` from the server rolls it back and pulls the authoritative state.
- Presence indicators per project room (who's currently viewing/editing), correct across multiple server instances via the Redis-backed Socket.io adapter.

### Consistency & Conflict Handling
- Optimistic concurrency control on tasks — simultaneous edits return `409` with the latest state instead of silently overwriting.
- Project progress recomputed atomically inside the same transaction as the triggering task write — no stale reads, no lost updates.
- Idempotent activity log — every task/comment mutation writes an immutable `ActivityLog` row inside the same transaction as the mutation itself, so the audit trail can never drift from what actually happened.

### Collaboration
- Threaded comments with mentions and notifications.
- Team and project note pads / chat, scoped per team and per project.
- Invite flow with expiring tokens and role-agnostic team membership.

### Search & Filtering
- Full-text search across task titles, descriptions, and comments via PostgreSQL `tsvector` + GIN index — fuzzy, fast, no separate search infrastructure to operate.
- Filter by assignee, label, priority, and type without falling back to full table scans (composite index on `(project_id, status, order)` covers the board's actual query pattern).

### Platform
- Board-view reads served from Redis with a short TTL, invalidated on write via pub/sub — the common "open the board" request doesn't hit Postgres on every load.
- PgBouncer in transaction-pooling mode in front of Postgres, so connection count stays bounded under concurrent request bursts regardless of how many API instances are running.
- Structured JSON logging (Pino) across REST and socket handlers, with a request/event ID threaded through both so a single user action can be traced end-to-end.

---

## Project Structure

```
heed/
├── server/
│   ├── src/
│   │   ├── controllers/       # REST handlers — task/project/team/comment logic
│   │   ├── routes/
│   │   ├── lib/
│   │   │   ├── socket.js      # Socket.io server, Redis adapter wiring
│   │   │   └── redis.js       # cache + pub/sub client
│   │   ├── services/          # activityService, presenceService
│   │   └── middlewares/
│   ├── prisma/
│   │   ├── schema.prisma      # version column, order as text (LexoRank), tsvector column
│   │   └── migrations/
│   └── loadtest/               # k6 scripts + recorded results
├── client/
│   ├── src/
│   │   ├── features/           # Redux Toolkit slices (board, tasks, presence)
│   │   ├── components/         # dnd-kit board, task detail, comment thread
│   │   └── lib/
│   │       └── socket.js       # client socket handling, optimistic update + rollback
│   └── public/
└── docs/
    └── concurrency.md          # before/after benchmark numbers, isolation-level notes
```

---

## Self-Hosting

### Prerequisites

- Node.js 20+, Docker, pnpm/npm
- PostgreSQL 16, Redis 7 (via Docker Compose for local dev)

### 1. Clone and install

```bash
git clone https://github.com/SamanPandey-in/heed.git
cd heed
npm install --prefix server
npm install --prefix client
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Set `DATABASE_URL` (through PgBouncer if running it locally), `REDIS_URL`, `JWT_SECRET`, and mail provider credentials for verification/reset emails.

### 3. Start Postgres + Redis

```bash
docker compose up -d
```

### 4. Run migrations

```bash
cd server
npx prisma migrate deploy
npx prisma generate
```

### 5. Run

```bash
# Terminal 1 — API + Socket.io server
cd server && npm run dev

# Terminal 2 — client
cd client && npm run dev
```

### 6. (Optional) Load test

```bash
cd server/loadtest
k6 run concurrent-task-update.js
```

---

## API Reference

### Tasks (concurrency-aware)

```http
GET /projects/:projectId/tasks
Authorization: Bearer <token>
```

```http
PATCH /tasks/:taskId
Authorization: Bearer <token>
Content-Type: application/json

{ "status": "DONE", "version": 4 }

# 200 OK
# { "task": { ..., "version": 5 } }

# 409 Conflict (someone else wrote first)
# { "message": "Task was updated by another user", "task": { ...latest server state... } }
```

```http
PATCH /tasks/:taskId/reorder
Authorization: Bearer <token>
Content-Type: application/json

{ "status": "IN_PROGRESS", "beforeOrder": "a3", "afterOrder": "a5", "version": 2 }

# 200 OK
# { "task": { "order": "a4", "version": 3 } }
```

### Real-Time Events (Socket.io)

```
join            → { projectId }              subscribe to a project's room
task:updated    ← { task }                    broadcast after any successful task write
task:conflict   ← { taskId, latestVersion }    sent to the client whose write was rejected
presence:update ← { projectId, users[] }       who's currently active in this project
```

---

## Design Decisions

**Why optimistic concurrency control instead of row-level locking?** A task can be open in someone's edit form for a long time relative to how often two people touch the *same* task at the *same* second. Pessimistic locking would serialize every editor of a project behind the slowest open form. OCC lets writes proceed freely and only pays a cost — a `409` and a retry — in the rare case of a genuine collision.

**Why fix the progress race with a single atomic `UPDATE ... SET x = (SELECT ...)` instead of `SERIALIZABLE` isolation + retry logic?** Both are correct. The single-statement version doesn't require the application to detect and retry serialization failures (Postgres error `40001`), which is strictly less code and fewer failure modes for a computation this simple. `SERIALIZABLE` + retry is the right tool when the transaction spans logic too complex to express as one statement — noted in `docs/concurrency.md` as the fallback if this computation ever grows more complex.

**Why fractional indexing instead of renumbering on every reorder?** Renumbering means a single drag-and-drop can turn into N row writes (everything below the drop point shifts), which is both slower and a wider surface for conflicts under concurrent reorders. Fractional indexing makes a reorder a one-row write, matching how Trello and Jira actually implement this.

**Why Postgres full-text search instead of Elasticsearch?** At this project's actual scale, a GIN-indexed `tsvector` column gives fast fuzzy search without a second service to operate, deploy, and keep in sync via CDC. The load test numbers in `docs/concurrency.md` are what would justify (or not) reaching for Elasticsearch later — that decision should follow measured need, not be made up front.

**Why the Redis adapter for Socket.io instead of sticky sessions on the load balancer?** Sticky sessions solve "which instance does this client's socket connect to" but not "how does instance A know to broadcast an event that instance B's client caused." The Redis adapter solves the actual problem — cross-instance pub/sub — rather than working around it.

---

## What I Learned Hardening This

**A bug you can't see in a demo is still a bug.** The original progress-calculation race never showed up while testing solo. It only exists when two people act within the same tens-of-milliseconds window — which is exactly the situation a single-user demo can never surface, and exactly the situation a real team of five people editing a shared board hits constantly.

**Optimistic concurrency control is a UX decision as much as a database one.** Returning a `409` is easy. Deciding what the client does with it — silently reload? show a merge prompt? — took more thought than the backend change did. I landed on showing the user exactly what changed and letting them choose to reapply their edit, rather than either discarding their input or blindly overwriting the other user's.

**Fractional indexing has a subtle edge case.** If enough reorders happen between the same two neighbors, the generated keys can grow long (e.g. `"a4"` → `"a44"` → `"a444"`). A periodic rebalance job that renumbers a column during low-traffic windows keeps key length bounded — worth knowing about before assuming fractional indexing is a forever-free lunch.

**Redis solves two unrelated problems and it's tempting to conflate them.** The board-view cache and the Socket.io adapter both live in the same Redis instance but serve completely different purposes (read-through cache vs. pub/sub transport) — worth being precise about this distinction when explaining the architecture, since "we use Redis" undersells what's actually happening.

---

## Task Status Reference

| Status | Meaning | Typical Next States |
|---|---|---|
| `BACKLOG` | Created, not yet scheduled | `TODO`, deleted |
| `TODO` | Scheduled for current work | `IN_PROGRESS`, `BACKLOG` |
| `IN_PROGRESS` | Actively being worked | `IN_REVIEW`, `TODO` |
| `IN_REVIEW` | Awaiting review/QA | `DONE`, `IN_PROGRESS` |
| `DONE` | Complete | reopened → any prior state |

---

## Roadmap

- [ ] Periodic rebalance job for fractional-index keys to bound key length
- [ ] Read replica for board-view queries once cache miss rate under load is measured
- [ ] Sprint planning view with burndown charts
- [ ] Role-based permissions (currently team-membership-only access)
- [ ] Webhook events for task transitions (Slack/Discord integration)
- [ ] Offline-first client with write queue and replay-on-reconnect

---

## Local Development

```bash
# Install dependencies
npm install --prefix server && npm install --prefix client

# Start Postgres + Redis
docker compose up -d

# Run migrations
cd server && npx prisma migrate dev

# Start both services
npm run dev --prefix server
npm run dev --prefix client

# Run the concurrency load test
cd server/loadtest && k6 run concurrent-task-update.js
```

---

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">

Built by [Saman Pandey](https://github.com/SamanPandey-in)  
Computer Science, VESIT Mumbai

*If you're reading this as a recruiter: the interesting parts are the optimistic-concurrency-control write path on tasks, the atomic single-statement progress recompute that replaced a real lost-update bug, and the fractional-index reorder model. Happy to walk through any of it, including the k6 numbers.*

</div>
