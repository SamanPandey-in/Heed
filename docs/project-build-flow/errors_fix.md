# Heed Audit Fix Plan — Executable Tasks

## 🚨 Execution Rules (STRICT)

1. Execute ONLY one task at a time
2. After completing a task:
   - Mark it as ✅ DONE
   - Ask: "Task X completed. Proceed to next task? (yes/no)"
3. WAIT for confirmation
4. If error occurs → STOP and report
5. Follow priority order strictly

---

# 🔴 CRITICAL FIXES (DO FIRST)

## Task C-01 — Fix route order (BLOCKING)
- File: `server/src/routes/tasks.route.js`

❌ Current:
```

router.get('/:taskId', getTaskById);
router.get('/project/:projectId', getProjectTasks);

```id="g2vwdj"

✅ Fix:
```

router.get('/project/:projectId', getProjectTasks);
router.get('/:taskId', getTaskById);

```id="v24j26"

[x] Task C-01

---

## Task C-02 — Remove invalid updateTaskStatus thunk
- File: `client/src/store/slices/tasksSlice.js`

Actions:
- Delete:
  - updateTaskStatus thunk
  - extraReducers related to it
- Remove export from:
  - tasksSlice.js
  - store/index.js

Reason: Calls non-existent API `/tasks/:id/status`

[x] Task C-02

---

## Task C-03 — Fix optimistic update bug
- File: `ProjectTasks.jsx`

❌ Current:
```

dispatch(updateTaskAction(clonedTask))

```id="q3snhr"

✅ Fix:
```

const updated = await updateTask({ id, status }).unwrap();
dispatch(updateTaskAction(updated.task));

```id="f8x3k8"

[x] Task C-03

---

# 🟠 HIGH PRIORITY

## Task H-06 — Fix TeamDetails loading bug
- File: `TeamDetails.jsx`

Add:
```

const teamsLoading = useSelector(selectTeamsLoading);

if (teamsLoading) return <Skeleton />;
if (!team) return <p>Team not found</p>;

```id="38nq5f"

[x] Task H-06

---

## Task H-03 — Add URGENT priority
- File: `CreateTaskDialog.jsx`

Add:
```

<MenuItem value="URGENT">Urgent</MenuItem>
``` id="wkr0op"

[x] Task H-03

---

## Task H-04 — Add missing task statuses

* File: `ProjectTasks.jsx`

Add:

````
{ label: 'Backlog', value: 'BACKLOG' },
{ label: 'In Review', value: 'IN_REVIEW' }
``` id="72kv7i"

[x] Task H-04

---

## Task H-01 — Fix project count on Teams page
- File: `Teams.jsx`

Replace usage of:
````

team.projectIds

```id="x05j3p"

With:
```

const projectsByTeam = useSelector(...group by teamId...)

```

Then:
```

projectsByTeam[team.id] || 0

```id="tn73jv"

[x] Task H-01

---

## Task H-05 — Fix auth rate limiter
- File: `server/app.js`

Change:
- Apply limiter ONLY to:
  - `/login`
  - `/register`

Remove limiter from:
- `/refresh`
- `/me`

[x] Task H-05

---

## Task H-02 — Fix silent failure in data init
- File: `useInitializeAppData.js`

Add:
```

const results = await Promise.allSettled([...]);

const failed = results.filter(r => r.status === 'rejected');

if (failed.length) {
dispatch(setUserError('Some data failed to load'));
}

```id="3b1l1a"

[x] Task H-02

---

# 🟡 MEDIUM FIXES

## Task M-02 — Wire change password to backend
- File: `Settings.jsx`

Call:
```

POST /api/auth/change-password

```id="jsh3cy"

Body:
```

{ currentPassword, newPassword }

```id="sh6o4g"

[x] Task M-02

---

## Task M-01 — Remove duplicate selector
- File: `store/index.js`

Action:
- Remove direct export of `selectTeamsLoading`
- Use selector from `selectors.js`

[x] Task M-01

---

## Task M-03 — Remove dead thunk export
- File: `tasksSlice.js`

Remove:
- updateTaskStatus export (if still exists)

[x] Task M-03

---

## Task M-04 — Fix selector usage
- File: `ProjectSettings.jsx`

Replace:
```

state.users?.currentUserId

```id="xg6gcr"

With:
```

useSelector(selectCurrentUserId)

```id="1n1l61"

[x] Task M-04

---

## Task M-05 — Fix joinByInviteCode response
- File: `teams.controller.js`

Fix:
- Replace stub `{ id: userId }`
- Fetch full user object OR trigger full refetch

[x] Task M-05

---

# 🔵 INFO / CLEANUP

## Task I-02 — Remove crypto from dependencies
- File: `server/package.json`

Action:
- Remove `"crypto"` from dependencies

[x] Task I-02

---

## Task I-03 — Remove unused API endpoints
- File: `apiSlice.js`

Delete:
- Equipment APIs
- Request APIs
- Technician APIs

[x] Task I-03

---

## Task I-04 — Delete empty file
- File: `server/src/utils/addhere.js`

Action:
- Delete file

[x] Task I-04

---

## Task I-01 — Remove unused createTask export
- File: `tasksSlice.js`

Action:
- Remove unused thunk export

[x] Task I-01

---

# ✅ COMPLETION CHECK

After all tasks:
- All checkboxes must be ✅
- App must:
  - Load tasks correctly
  - Show correct project counts
  - Allow status updates without mismatch
  - Handle errors visibly
  - Not crash on missing routes

---

# 🎯 END