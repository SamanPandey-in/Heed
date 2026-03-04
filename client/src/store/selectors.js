/**
 * Redux selectors for user and team state
 */

import { createSelector } from 'reselect';

// ==================== USER SELECTORS ====================

/**
 * Select current user info (memoized)
 */
export const selectCurrentUser = createSelector(
  [(state) => state.user.id, (state) => state.user.name, (state) => state.user.email],
  (id, name, email) => ({ id, name, email })
);

/**
 * Select user info with all details
 */
export const selectUserInfo = (state) => state.user;

/**
 * Select array of team IDs the user is a member of
 */
export const selectUserTeams = (state) => state.user.teams || [];

/**
 * Select currently selected team ID
 */
export const selectCurrentTeamId = (state) => state.user.currentTeamId;

/**
 * Select full team objects for user's teams (memoized)
 * Returns array of team objects user is a member of
 */
export const selectUserTeamObjects = createSelector(
  [(state) => state.user.teams || [], (state) => state.teams.teams || []],
  (userTeamIds, allTeams) => allTeams.filter((team) => userTeamIds.includes(team.id))
);

// ==================== TEAM SELECTORS ====================

/**
 * Select all teams
 */
export const selectAllTeams = (state) => state.teams.teams || [];

/**
 * Select team by ID
 */
export const selectTeamById = (state, teamId) => {
  return (state.teams.teams || []).find((team) => team.id === teamId);
};

/**
 * Select currently selected team object
 */
export const selectCurrentTeam = (state) => {
  const currentTeamId = state.user.currentTeamId;
  return (state.teams.teams || []).find((team) => team.id === currentTeamId);
};

/**
 * Select team members array for a specific team (memoized)
 */
export const selectTeamMembers = createSelector(
  [(state) => state.teams.teams || [], (state, teamId) => teamId],
  (teams, teamId) => {
    const team = teams.find((t) => t.id === teamId);
    return team ? team.members : [];
  }
);

/**
 * Select current team members (memoized)
 */
export const selectCurrentTeamMembers = createSelector(
  [(state) => state.user.currentTeamId, (state) => state.teams.teams || []],
  (currentTeamId, teams) => {
    const team = teams.find((t) => t.id === currentTeamId);
    return team ? team.members : [];
  }
);

/**
 * Select team count
 */
export const selectTeamCount = (state) => {
  return (state.teams.teams || []).length;
};

/**
 * Select user's team count
 */
export const selectUserTeamCount = (state) => {
  return (state.user.teams || []).length;
};

/**
 * Check if user is member of a team
 */
export const selectIsUserInTeam = (state, teamId) => {
  const userTeams = state.user.teams || [];
  return userTeams.includes(teamId);
};

/**
 * Check if user is member of current team
 */
export const selectIsUserInCurrentTeam = (state) => {
  const currentTeamId = state.user.currentTeamId;
  return selectIsUserInTeam(state, currentTeamId);
};

/**
 * Select teams loading state
 */
export const selectTeamsLoading = (state) => state.teams.loading;

/**
 * Select teams error
 */
export const selectTeamsError = (state) => state.teams.error;

/**
 * Select user loading state
 */
export const selectUserLoading = (state) => state.user.loading;

/**
 * Select user error
 */
export const selectUserError = (state) => state.user.error;

/**
 * Select member count for a team
 */
export const selectTeamMemberCount = (state, teamId) => {
  const team = selectTeamById(state, teamId);
  return team ? team.members.length : 0;
};

/**
 * Select current team member count
 */
export const selectCurrentTeamMemberCount = (state) => {
  const currentTeamId = state.user.currentTeamId;
  return selectTeamMemberCount(state, currentTeamId);
};

// ==================== TASK SELECTORS ====================

/**
 * Base selector for all projects
 */
const selectProjects = (state) => state.projects?.projects || [];

/**
 * Memoized selector to get all tasks assigned to a specific user across all projects
 * @param {string} userId - User ID to filter tasks by
 * @returns {Array} Array of task objects with project and team info
 */
export const selectTasksForUser = createSelector(
  [selectProjects, (_, userId) => userId],
  (projects, userId) => {
    if (!userId) return [];
    
    const userTasks = [];
    
    projects.forEach((project) => {
      (project.tasks || []).forEach((task) => {
        // Match tasks assigned to this user
        if (task.assigneeId === userId) {
          userTasks.push({
            id: task.id,
            title: task.title,
            assigneeId: task.assigneeId,
            projectId: task.projectId,
            projectName: project.name,
            status: task.status,
            priority: task.priority,
            type: task.type,
            dueDate: task.due_date,
            description: task.description,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
          });
        }
      });
    });
    
    return userTasks;
  }
);

/**
 * Selector to get tasks for current user, sorted by due date
 */
export const selectUserTasksSortedByDueDate = createSelector(
  [(state) => state.user?.id, selectProjects],
  (userId, projects) => {
    if (!userId) return [];
    
    const userTasks = [];
    
    projects.forEach((project) => {
      (project.tasks || []).forEach((task) => {
        if (task.assigneeId === userId) {
          userTasks.push({
            id: task.id,
            title: task.title,
            assigneeId: task.assigneeId,
            projectId: task.projectId,
            projectName: project.name,
            status: task.status,
            priority: task.priority,
            type: task.type,
            dueDate: task.due_date,
            description: task.description,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
          });
        }
      });
    });
    
    // Sort by due date (earliest first, nulls at end)
    return userTasks.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }
);

/**
 * Selector to get tasks grouped by status
 */
export const selectUserTasksByStatus = createSelector(
  [(state) => state.user?.id, selectProjects],
  (userId, projects) => {
    if (!userId) return {};
    
    const tasksByStatus = {
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: [],
    };
    
    projects.forEach((project) => {
      (project.tasks || []).forEach((task) => {
        if (task.assigneeId === userId) {
          const taskObj = {
            id: task.id,
            title: task.title,
            projectId: task.projectId,
            projectName: project.name,
            status: task.status,
            priority: task.priority,
            dueDate: task.due_date,
          };
          
          if (tasksByStatus[task.status]) {
            tasksByStatus[task.status].push(taskObj);
          }
        }
      });
    });
    
    return tasksByStatus;
  }
);

/**
 * Selector to get count of tasks by status for current user
 */
export const selectUserTasksCountByStatus = createSelector(
  [selectUserTasksByStatus],
  (tasksByStatus) => ({
    todo: tasksByStatus.TODO?.length || 0,
    inProgress: tasksByStatus.IN_PROGRESS?.length || 0,
    inReview: tasksByStatus.IN_REVIEW?.length || 0,
    done: tasksByStatus.DONE?.length || 0,
    total: (
      (tasksByStatus.TODO?.length || 0) +
      (tasksByStatus.IN_PROGRESS?.length || 0) +
      (tasksByStatus.IN_REVIEW?.length || 0) +
      (tasksByStatus.DONE?.length || 0)
    ),
  })
);

// ==================== PROJECT SELECTORS ====================

/**
 * Base selector for all projects
 */
const selectAllProjects = (state) => state.projects?.projects || [];

/**
 * Memoized selector to get projects for a specific team
 */
export const selectProjectsByTeam = createSelector(
  [selectAllProjects, (state, teamId) => teamId],
  (projects, teamId) => {
    if (!teamId) return [];
    return projects.filter((project) => project.teamId === teamId);
  }
);

/**
 * Memoized selector to get projects for user's teams
 * Returns only projects that belong to teams the user is a member of
 */
export const selectProjectsForUserTeams = createSelector(
  [selectAllProjects, (state, userTeams) => userTeams ?? state.user?.teams ?? []],
  (projects, userTeams) => {
    const userTeamIds = userTeams
      .map((team) => (typeof team === "string" ? team : team?.id))
      .filter(Boolean);

    if (!userTeamIds.length) return [];
    return projects.filter((project) => userTeamIds.includes(project.teamId));
  }
);

/**
 * Memoized selector to get projects for current user's current team
 */
export const selectProjectsForCurrentTeam = createSelector(
  [selectAllProjects, (state) => state.user?.currentTeamId],
  (projects, currentTeamId) => {
    if (!currentTeamId) return [];
    return projects.filter((project) => project.teamId === currentTeamId);
  }
);
