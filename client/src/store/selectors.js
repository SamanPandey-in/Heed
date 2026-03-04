import { createSelector } from "reselect";
import { dummyUsers } from "../assets/assets";

const DUMMY_USER_BY_ID = dummyUsers.reduce((acc, user) => {
  acc[user.id] = user;
  return acc;
}, {});

const normalizeProjectStatus = (status) => {
  const normalized = String(status || "active").trim().toLowerCase();
  if (normalized === "completed" || normalized === "done") return "completed";
  if (normalized === "deprecated" || normalized === "cancelled" || normalized === "archived") {
    return "deprecated";
  }
  return "active";
};

const mapTeamMembersToProfiles = (memberIds = [], currentUser = null) =>
  memberIds.map((memberId) => {
    if (currentUser?.id === memberId) {
      return {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: "ADMIN",
      };
    }

    const knownUser = DUMMY_USER_BY_ID[memberId];
    if (knownUser) {
      return {
        id: knownUser.id,
        name: knownUser.name,
        email: knownUser.email,
        avatar: knownUser.image,
        role: "MEMBER",
      };
    }

    return {
      id: memberId,
      name: memberId,
      email: `${memberId}@relayops.local`,
      role: "MEMBER",
    };
  });

// Base state selectors
const selectUsersState = (state) => state.users || {};
const selectTeamsState = (state) => state.teams || {};
const selectProjectsState = (state) => state.projects || {};
const selectTasksState = (state) => state.tasks || {};

const selectUserEntities = (state) => selectUsersState(state).users || {};
const selectCurrentUserIdValue = (state) => selectUsersState(state).currentUserId || null;
const selectCurrentTeamIdValue = (state) => selectUsersState(state).currentTeamId || null;

const selectTeamEntities = (state) => selectTeamsState(state).teams || {};
const selectTeamIds = (state) => selectTeamsState(state).teamIds || [];

const selectProjectEntities = (state) => selectProjectsState(state).projects || {};
const selectProjectIds = (state) => selectProjectsState(state).projectIds || [];

const selectTaskEntities = (state) => selectTasksState(state).tasks || {};
const selectTaskIds = (state) => selectTasksState(state).taskIds || [];

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

export const selectUserTeams = createSelector(
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

export const selectCurrentTeam = createSelector(
  [selectCurrentTeamId, selectTeamEntities],
  (currentTeamId, teamEntities) => (currentTeamId ? teamEntities[currentTeamId] || null : null)
);

export const selectUserTeamObjects = createSelector(
  [selectUserTeams, selectAllTeams],
  (userTeamIds, allTeams) => allTeams.filter((team) => userTeamIds.includes(team.id))
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
  [selectUserTeams, (_, teamId) => teamId],
  (userTeamIds, teamId) => userTeamIds.includes(teamId)
);

export const selectIsUserInCurrentTeam = createSelector(
  [selectUserTeams, selectCurrentTeamId],
  (userTeamIds, currentTeamId) => userTeamIds.includes(currentTeamId)
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
      .map((task) => ({
        ...task,
        assignee: task.assigneeId ? DUMMY_USER_BY_ID[task.assigneeId] || null : null,
      }))
);

export const selectTaskById = createSelector(
  [selectTaskEntities, (_, taskId) => taskId],
  (taskEntities, taskId) => {
    const task = taskEntities[taskId];
    if (!task) return null;

    return {
      ...task,
      assignee: task.assigneeId ? DUMMY_USER_BY_ID[task.assigneeId] || null : null,
    };
  }
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
        dueDate: task.due_date,
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
        dueDate: task.due_date,
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
      (task) => task.due_date && new Date(task.due_date) < now && task.status !== "DONE"
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
        const members = (project.memberIds || []).map((memberId) => ({
          id: `member_${projectId}_${memberId}`,
          userId: memberId,
          projectId,
          user: DUMMY_USER_BY_ID[memberId] || null,
        }));

        return {
          ...project,
          members,
          tasks: tasksByProject[projectId] || [],
        };
      })
      .filter(Boolean)
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
        if (task.due_date && new Date(task.due_date) < now && task.status !== "DONE") {
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
