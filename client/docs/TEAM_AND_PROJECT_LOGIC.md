# Team and Project Creation Logic

## Overview

This document explains the architectural flow and user interaction model for the current frontend application.

The system is built using:

* React
* Vite
* Redux Toolkit
* React Router

The architecture follows a **User → Teams → Projects → Tasks** hierarchy with no workspace layer.

---

# 1. High-Level Architecture

## Core Relationship Model

```
User
 └── Teams (many)
      └── Projects (many per team)
           └── Tasks (many per project)
```

### Key Rules

1. A user can belong to multiple teams.
2. A team can have multiple projects.
3. Every project must belong to exactly one team.
4. Every task must belong to exactly one project.
5. The dashboard is user-centric, not team-centric.

There is **no workspace concept** in the application.

---

# 2. User Flow

## 2.1 Dashboard

**Route:** `/dashboard`

The dashboard displays:

* All tasks assigned to the current user
* Across all projects
* Across all teams

### Dashboard Logic

The dashboard:

* Selects all tasks where `task.assignedTo === currentUserId`
* Aggregates statistics:

  * Total Tasks
  * Completed
  * In Progress
  * Overdue

This ensures the system is fully user-centric.

---

## 2.2 Projects Page

**Route:** `/projects`

This page displays:

* All projects where the user is a member of the associated team
* Rendered as project cards

Each project card displays:

* Project name
* Description
* Status (active / completed / deprecated)
* Team name
* Progress summary

### Creating a Project

When creating a new project:

1. User must select a team.
2. Only teams the user belongs to are selectable.
3. The project is created with:

   * `teamId`
   * `status`
   * `result`
4. The project ID is added to the corresponding team’s `projectIds`.

This guarantees referential consistency.

---

## 2.3 Project Details Page

**Route:** `/projects/:projectId`

Displays:

* Project metadata
* Project team
* Tasks table
* Status and result
* Filters (status, type, priority, assignee)

### Project Model

Each project contains:

```
{
  id,
  name,
  description,
  teamId,
  status: "active" | "completed" | "deprecated",
  result: "success" | "failed" | "ongoing" | null
}
```

### Status and Result Rules

* Status can be changed at any time.
* Result can only be set when status is `completed`.
* Filters on the main projects page use selector-based filtering.

---

## 2.4 Teams Page

**Route:** `/teams`

Displays:

* All teams the user is a member of
* Rendered as cards

Each team card shows:

* Team name
* Number of members
* Number of projects

Clicking a team card navigates to:

`/teams/:teamId`

---

## 2.5 Team Details Page

**Route:** `/teams/:teamId`

Displays:

* Team name
* Members list
* All projects under that team

### Team Model

```
{
  id,
  name,
  members: [userId],
  projectIds: [projectId]
}
```

### Team Rules

1. A user cannot access a team they are not a member of.
2. Creating a project automatically links it to the team.
3. Deleting a project removes it from `team.projectIds`.

---

# 3. Redux State Structure

The application uses normalized state.

## Example Structure

```
{
  auth: {
    currentUserId
  },

  users: {
    byId,
    allIds
  },

  teams: {
    byId,
    allIds
  },

  projects: {
    byId,
    allIds
  },

  tasks: {
    byId,
    allIds
  }
}
```

### Why Normalized?

* Prevents duplication
* Avoids circular data
* Enables fast lookup
* Keeps slices independent

---

# 4. Data Integrity Rules

The system enforces the following constraints:

1. No project exists without a team.
2. No task exists without a project.
3. Dashboard only shows tasks assigned to the current user.
4. Teams page only shows teams the user belongs to.
5. Access to `/teams/:teamId` is blocked if user is not a member.

---

# 5. Filtering Logic

Filtering is handled via Redux selectors, not component-level filtering.

Supported filters:

### Projects Page

* All
* Active
* Completed
* Deprecated

### Team Page

* All Projects
* Active
* Completed
* Deprecated

### Project Tasks

* Status
* Type
* Priority
* Assignee

---

# 6. Architectural Benefits

This structure provides:

* Clear domain separation
* Scalable state management
* Clean relational mapping
* Backend-ready schema design
* Easy transition to API integration

The removal of the workspace layer simplifies logic and removes unnecessary nesting.

---

# 7. Final Flow Summary

1. User logs in.
2. Dashboard shows all assigned tasks.
3. User navigates to Projects.
4. User creates or manages projects under specific teams.
5. User navigates to Teams.
6. Teams contain projects.
7. Projects contain tasks.

Everything revolves around teams as the ownership boundary.

---

# Conclusion

The application now follows a clean, scalable, team-driven architecture where:

* Users are independent entities.
* Teams act as collaboration boundaries.
* Projects are owned by teams.
* Tasks are owned by projects.
* The dashboard is fully user-centric.

This model is production-ready from a frontend architectural perspective and is easily extendable to a backend-driven system in the future.
