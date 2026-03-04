# Redux Architecture Review (Phase 7)

## Current State Shape

The normalized entity domains are now top-level and ID-driven:

- `users.users` + `users.userIds`: user entities and ordering
- `teams.teams` + `teams.teamIds`: team entities and ordering
- `projects.projects` + `projects.projectIds`: project entities and ordering
- `tasks.tasks` + `tasks.taskIds`: task entities and ordering

Relations are ID-first:

- Team membership: `team.members` (user IDs)
- Project ownership: `project.teamId`
- Project members: `project.memberIds`
- Project-task relation: `project.taskIds`
- Task-project relation: `task.projectId`
- Task assignee relation: `task.assigneeId`

## Selector Strategy

- All exported selectors are memoized via `reselect`.
- Entity hydration and filtering is centralized in selectors.
- Shared dashboard/task computations are selector-based (no duplicated per-component filters).
- Components consume selector outputs instead of direct entity traversal.

## Remaining Improvement Opportunities

1. Replace manual normalization with RTK `createEntityAdapter` for `users`, `teams`, `projects`, and `tasks`.
2. Add selector unit tests for:
   - hydration (`project.taskIds -> tasks[]`)
   - status filtering (`active/completed/deprecated`)
   - team-scoped project filtering
   - dashboard/task summary selectors.
3. Add atomic thunks for project deletion and task migration flows to enforce cross-slice consistency.
4. Move reducers/selectors into feature folders (`features/users`, `features/teams`, etc.) while keeping `store/` as composition root.
