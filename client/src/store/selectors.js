import { createSelector } from "reselect";

const normalizeProjectStatus = (status) => {
  const normalized = String(status || "active").trim().toLowerCase();
  if (normalized === "completed" || normalized === "done") return "completed";
  if (normalized === "deprecated" || normalized === "cancelled" || normalized === "archived") {
    return "deprecated";
  }
  return "active";
};

const extractMemberId = (member) => {
  if (!member) return null;
  if (typeof member === "string") return member;
  return member.id || member.userId || member.user?.id || null;
};

const getTeamMemberIds = (members = []) =>
  members.map(extractMemberId).filter(Boolean);

const getTaskDueDate = (task) => task?.dueDate || task?.due_date || null;

const mapTeamMembersToProfiles = (members = [], currentUser = null) =>
  members
    .map((member) => {
      const memberId = extractMemberId(member);
      if (!memberId) return null;

      if (typeof member === "object") {
        const memberUser = member.user || member;
        return {
          id: memberId,
          name: memberUser.fullName || memberUser.name || memberUser.username || memberId,
          email: memberUser.email || `${memberId}@Heed.local`,
          avatar: memberUser.avatarUrl || memberUser.image || null,
          role: member.role || "MEMBER",
        };
      }

    if (currentUser?.id === memberId) {
      return {
        id: currentUser.id,
        name: currentUser.name || currentUser.fullName,
        email: currentUser.email,
        role: "ADMIN",
      };
    }

    return {
      id: memberId,
      name: memberId,
      email: `${memberId}@Heed.local`,
      role: "MEMBER",
    };
    })
    .filter(Boolean);

// Base state selectors
const selectUsersState = (state) => state.users || {};
const selectTeamsState = (state) => state.teams || {};
const selectProjectsState = (state) => state.projects || {};
const selectTasksState = (state) => state.tasks || {};

const selectUserEntities = (state) => selectUsersState(state).users || {};
const selectCurrentUserIdValue = (state) => selectUsersState(state).currentUserId || null;
const selectCurrentTeamIdValue = (state) => selectUsersState(state).currentTeamId || null;

const selectTeamEntities = (state) => selectTeamsState(state).entities || {};
const selectTeamIds = (state) => selectTeamsState(state).ids || [];

const selectProjectEntities = (state) => selectProjectsState(state).entities || {};
const selectProjectIds = (state) => selectProjectsState(state).ids || [];

const selectTaskEntities = (state) => selectTasksState(state).entities || {};
const selectTaskIds = (state) => selectTasksState(state).ids || [];

// Users
export const selectCurrentUser = createSelector(
  [selectCurrentUserIdValue, selectUserEntities],
  (currentUserId, users) => users[currentUserId] || { id: null, name: "", email: "", teamIds: [] }
);

export const selectCurrentUserId = createSelector(
  [selectCurrentUser],
  (currentUser) => currentUser?.id || null
);

export const selectUserInfo = createSelector([selectUsersState], (usersState) => usersState);

const selectUserTeamIdsFromProfile = createSelector(
  [selectCurrentUser],
  (currentUser) => currentUser?.teamIds || []
);

export const selectCurrentTeamId = createSelector(
  [selectCurrentTeamIdValue],
  (teamId) => teamId
);

export const selectUserLoading = createSelector(
  [selectUsersState],
  (usersState) => Boolean(usersState.loading)
);

export const selectUserError = createSelector(
  [selectUsersState],
  (usersState) => usersState.error || null
);

// Teams
export const selectAllTeams = createSelector(
  [selectTeamEntities, selectTeamIds],
  (teamEntities, teamIds) => teamIds.map((teamId) => teamEntities[teamId]).filter(Boolean)
);

export const selectTeamById = createSelector(
  [selectTeamEntities, (_, teamId) => teamId],
  (teams, teamId) => teams[teamId] || null
);

export const selectTeamByInviteCode = createSelector(
  [selectAllTeams, (_, inviteCode) => inviteCode],
  (teams, inviteCode) => {
    const normalizedInviteCode = String(inviteCode || "").trim().toLowerCase();
    if (!normalizedInviteCode) return null;

    return (
      teams.find(
        (team) => String(team?.inviteCode || "").trim().toLowerCase() === normalizedInviteCode
      ) || null
    );
  }
);

export const selectCurrentTeam = createSelector(
  [selectCurrentTeamId, selectTeamEntities],
  (currentTeamId, teamEntities) => (currentTeamId ? teamEntities[currentTeamId] || null : null)
);

export const selectTeamsByUser = createSelector(
  [selectAllTeams, (_, userId) => userId],
  (allTeams, userId) => {
    if (!userId) return [];
    return allTeams.filter((team) => getTeamMemberIds(team?.members || []).includes(userId));
  }
);

export const selectUserTeamObjects = createSelector(
  [selectCurrentUserId, selectAllTeams],
  (currentUserId, allTeams) => {
    if (!currentUserId) return [];
    return allTeams.filter((team) =>
      getTeamMemberIds(team?.members || []).includes(currentUserId)
    );
  }
);

export const selectUserTeams = createSelector(
  [selectUserTeamObjects, selectUserTeamIdsFromProfile],
  (teamsFromMembership, profileTeamIds) => {
    const membershipTeamIds = teamsFromMembership.map((team) => team.id);
    if (membershipTeamIds.length > 0) return membershipTeamIds;
    return profileTeamIds;
  }
);

export const selectTeamMembers = createSelector(
  [selectTeamById, selectCurrentUser],
  (team, currentUser) => mapTeamMembersToProfiles(team?.members || [], currentUser)
);

export const selectCurrentTeamMembers = createSelector(
  [selectCurrentTeam, selectCurrentUser],
  (team, currentUser) => mapTeamMembersToProfiles(team?.members || [], currentUser)
);

export const selectTeamCount = createSelector([selectTeamIds], (teamIds) => teamIds.length);

export const selectUserTeamCount = createSelector(
  [selectUserTeams],
  (teamIds) => teamIds.length
);

export const selectIsUserInTeam = createSelector(
  [selectTeamById, selectCurrentUserId],
  (team, currentUserId) =>
    Boolean(
      team && currentUserId && getTeamMemberIds(team.members || []).includes(currentUserId)
    )
);

export const selectIsUserInCurrentTeam = createSelector(
  [selectCurrentTeam, selectCurrentUserId],
  (team, currentUserId) =>
    Boolean(
      team && currentUserId && getTeamMemberIds(team.members || []).includes(currentUserId)
    )
);

export const selectTeamsLoading = createSelector(
  [selectTeamsState],
  (teamsState) => Boolean(teamsState.loading)
);

export const selectTeamsError = createSelector(
  [selectTeamsState],
  (teamsState) => teamsState.error || null
);

export const selectTeamMemberCount = createSelector(
  [selectTeamById],
  (team) => team?.members?.length || 0
);

export const selectCurrentTeamMemberCount = createSelector(
  [selectCurrentTeam],
  (team) => team?.members?.length || 0
);

// Tasks
export const selectAllTasks = createSelector(
  [selectTaskEntities, selectTaskIds],
  (taskEntities, taskIds) =>
    taskIds
      .map((taskId) => taskEntities[taskId])
      .filter(Boolean)
);

export const selectTaskById = createSelector(
  [selectTaskEntities, (_, taskId) => taskId],
  (taskEntities, taskId) => taskEntities[taskId] || null
);

const selectTasksByProjectMap = createSelector([selectAllTasks], (tasks) => {
  const tasksByProject = {};

  tasks.forEach((task) => {
    const projectId = task?.projectId;
    if (!projectId) return;

    if (!tasksByProject[projectId]) {
      tasksByProject[projectId] = [];
    }
    tasksByProject[projectId].push(task);
  });

  return tasksByProject;
});

export const selectTasksByProjectId = createSelector(
  [selectTasksByProjectMap, (_, projectId) => projectId],
  (tasksByProject, projectId) => tasksByProject[projectId] || []
);

export const selectTasksForUser = createSelector(
  [selectAllTasks, (_, userId) => userId],
  (tasks, userId) => {
    if (!userId) return [];
    return tasks.filter((task) => task.assigneeId === userId);
  }
);

export const selectUserTasksSortedByDueDate = createSelector(
  [selectCurrentUserId, selectAllTasks, selectProjectEntities],
  (userId, tasks, projectEntities) => {
    if (!userId) return [];

    return tasks
      .filter((task) => task.assigneeId === userId)
      .map((task) => ({
        id: task.id,
        title: task.title,
        assigneeId: task.assigneeId,
        projectId: task.projectId,
        projectName: projectEntities[task.projectId]?.name || "Unknown Project",
        status: task.status,
        priority: task.priority,
        type: task.type,
        dueDate: getTaskDueDate(task),
        description: task.description,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }))
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
  }
);

export const selectUserTasksByStatus = createSelector(
  [selectCurrentUserId, selectAllTasks, selectProjectEntities],
  (userId, tasks, projectEntities) => {
    if (!userId) {
      return { TODO: [], IN_PROGRESS: [], IN_REVIEW: [], DONE: [] };
    }

    const grouped = {
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: [],
    };

    tasks.forEach((task) => {
      if (task.assigneeId !== userId) return;

      const normalizedTask = {
        id: task.id,
        title: task.title,
        projectId: task.projectId,
        projectName: projectEntities[task.projectId]?.name || "Unknown Project",
        status: task.status,
        priority: task.priority,
        dueDate: getTaskDueDate(task),
      };

      if (grouped[task.status]) {
        grouped[task.status].push(normalizedTask);
      }
    });

    return grouped;
  }
);

export const selectUserTasksCountByStatus = createSelector(
  [selectUserTasksByStatus],
  (tasksByStatus) => ({
    todo: tasksByStatus.TODO?.length || 0,
    inProgress: tasksByStatus.IN_PROGRESS?.length || 0,
    inReview: tasksByStatus.IN_REVIEW?.length || 0,
    done: tasksByStatus.DONE?.length || 0,
    total:
      (tasksByStatus.TODO?.length || 0) +
      (tasksByStatus.IN_PROGRESS?.length || 0) +
      (tasksByStatus.IN_REVIEW?.length || 0) +
      (tasksByStatus.DONE?.length || 0),
  })
);

export const selectRecentTasks = createSelector([selectAllTasks], (tasks) =>
  [...tasks]
    .filter((task) => task?.updatedAt)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 12)
);

export const selectTaskSummaryCards = createSelector(
  [selectCurrentUserId, selectAllTasks],
  (userId, tasks) => {
    const now = new Date();
    const myTasks = tasks.filter((task) => task.assigneeId === userId);
    const overdueTasks = tasks.filter(
      (task) => getTaskDueDate(task) && new Date(getTaskDueDate(task)) < now && task.status !== "DONE"
    );
    const inProgressTasks = tasks.filter((task) => task.status === "IN_PROGRESS");

    return {
      myTasks,
      overdueTasks,
      inProgressTasks,
    };
  }
);

// Projects
export const selectAllProjects = createSelector(
  [selectProjectEntities, selectProjectIds, selectTasksByProjectMap],
  (projectEntities, projectIds, tasksByProject) =>
    projectIds
      .map((projectId) => {
        const project = projectEntities[projectId];
        if (!project) return null;

        return {
          ...project,
          tasks: tasksByProject[projectId] || [],
        };
      })
      .filter(Boolean)
);

export const selectProjectById = createSelector(
  [selectAllProjects, (_, projectId) => projectId],
  (projects, projectId) => projects.find((project) => project.id === projectId) || null
);

export const selectTeamProjects = createSelector(
  [selectAllProjects, (_, teamId) => teamId],
  (projects, teamId) => {
    if (!teamId) return [];
    return projects.filter((project) => project.teamId === teamId);
  }
);

export const selectTeamProjectsByStatus = createSelector(
  [selectTeamProjects],
  (teamProjects) => {
    const groupedProjects = {
      active: [],
      completed: [],
      deprecated: [],
    };

    teamProjects.forEach((project) => {
      const normalizedStatus = normalizeProjectStatus(project.status);
      groupedProjects[normalizedStatus].push(project);
    });

    return groupedProjects;
  }
);

export const selectProjectsByTeam = selectTeamProjects;

export const selectProjectsByTeamAndStatus = createSelector(
  [selectTeamProjects, (_, __, status) => status ?? "all"],
  (projects, status) => {
    const normalizedStatus = String(status || "all").trim().toLowerCase();
    if (normalizedStatus === "all") return projects;

    return projects.filter(
      (project) => normalizeProjectStatus(project.status) === normalizeProjectStatus(normalizedStatus)
    );
  }
);

export const selectProjectsByStatus = createSelector(
  [
    selectAllProjects,
    (_, status) => status ?? "all",
    (state, __, userTeams) => userTeams ?? selectUserTeams(state),
  ],
  (projects, status, userTeams) => {
    const normalizedFilter = String(status || "all").toLowerCase();
    const teamIds = Array.isArray(userTeams)
      ? userTeams
          .map((team) => (typeof team === "string" ? team : team?.id))
          .filter(Boolean)
      : null;

    const scopedProjects =
      teamIds === null ? projects : projects.filter((project) => teamIds.includes(project.teamId));

    if (normalizedFilter === "all") return scopedProjects;

    return scopedProjects.filter(
      (project) => normalizeProjectStatus(project.status) === normalizeProjectStatus(normalizedFilter)
    );
  }
);

export const selectProjectsForUserTeams = createSelector(
  [selectAllProjects, (state, userTeams) => userTeams ?? selectUserTeams(state)],
  (projects, userTeams) => {
    const userTeamIds = userTeams
      .map((team) => (typeof team === "string" ? team : team?.id))
      .filter(Boolean);

    if (!userTeamIds.length) return [];
    return projects.filter((project) => userTeamIds.includes(project.teamId));
  }
);

export const selectProjectsForCurrentTeam = createSelector(
  [selectAllProjects, selectCurrentTeamId],
  (projects, currentTeamId) => {
    if (!currentTeamId) return [];
    return projects.filter((project) => project.teamId === currentTeamId);
  }
);

export const selectDashboardStats = createSelector(
  [selectAllProjects, selectCurrentUserId],
  (projects, currentUserId) => {
    const now = new Date();
    let completedProjects = 0;
    let myTaskCount = 0;
    let overdueTaskCount = 0;
    let activeProjects = 0;

    projects.forEach((project) => {
      const projectStatus = normalizeProjectStatus(project.status);
      if (projectStatus === "active") activeProjects += 1;
      if (projectStatus === "completed") completedProjects += 1;

      (project.tasks || []).forEach((task) => {
        if (task.assigneeId === currentUserId) myTaskCount += 1;
        if (getTaskDueDate(task) && new Date(getTaskDueDate(task)) < now && task.status !== "DONE") {
          overdueTaskCount += 1;
        }
      });
    });

    return {
      totalProjects: projects.length,
      activeProjects,
      completedProjects,
      myTasks: myTaskCount,
      overdueIssues: overdueTaskCount,
    };
  }
);
