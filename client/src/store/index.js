// Store
export { default as store } from "./store.js";

// Async Thunks
export { fetchTeams, createTeam, joinTeamByInviteCode } from "./slices/teamsSlice.js";
export { fetchProjects, createProject } from "./slices/projectsSlice.js";
export { fetchTasks, createTask, updateTaskStatus } from "./slices/tasksSlice.js";

// Theme Slice
export { toggleTheme, setTheme, loadTheme } from "./slices/themeSlice.js";
export { default as themeReducer } from "./slices/themeSlice.js";

// User Slice
export {
  setUser,
  setCurrentTeamId as setUserCurrentTeamId,
  addTeamToUser,
  removeTeamFromUser,
  setLoading as setUserLoading,
  setError as setUserError,
  clearError as clearUserError,
} from "./slices/userSlice.js";
export { default as userReducer } from "./slices/userSlice.js";

// Projects Slice
export {
  setCurrentProjectId,
  clearProjectsError,
  resetProjectsState,
  selectAllProjects,
  selectProjectById,
  selectProjectIds,
  selectProjectEntities,
  selectProjectsLoading,
  selectProjectsError,
  selectCurrentProjectId as selectCurrentProjectIdValue,
  selectCurrentProject,
} from "./slices/projectsSlice.js";
export { default as projectsReducer } from "./slices/projectsSlice.js";

// Tasks Slice
export {
  clearTasksError,
  resetTasksState,
  selectAllTasks,
  selectTaskById,
  selectTaskIds,
  selectTaskEntities,
  selectTasksLoading,
  selectTasksError,
} from "./slices/tasksSlice.js";
export { default as tasksReducer } from "./slices/tasksSlice.js";

// Teams Slice
export {
  setCurrentTeamId,
  clearTeamsError,
  resetTeamsState,
  selectAllTeams,
  selectTeamById,
  selectTeamIds,
  selectTeamEntities,
  selectTeamTotal,
  selectTeamsLoading,
  selectTeamsError,
  selectCurrentTeamId as selectCurrentTeamIdValue,
  selectCurrentTeam as selectCurrentTeamValue,
} from "./slices/teamsSlice.js";
export { default as teamsReducer } from "./slices/teamsSlice.js";

// Settings Slice
export {
  updateUserSettings,
  updateNotifications,
  updatePrivacy,
  updatePreferences,
  resetToDefaults,
  setLoading as setSettingsLoading,
  setError as setSettingsError
} from "./slices/settingsSlice.js";
export { default as settingsReducer } from "./slices/settingsSlice.js";

// Derived Selectors
export {
  selectCurrentUserId,
  selectUserTeams,
  selectTeamsByUser,
  selectUserTeamObjects,
  selectCurrentTeamId,
  selectCurrentTeam,
  selectCurrentTeamMembers,
  selectTeamMembers,
  selectAllTeams,
  selectTeamById,
  selectTeamByInviteCode,
  selectIsUserInTeam,
  selectTeamProjects,
  selectTeamProjectsByStatus,
  selectTeamsError,
  selectUserInfo,
  selectCurrentUser,
  selectTeamCount,
  selectTasksForUser,
  selectUserTasksSortedByDueDate,
  selectUserTasksByStatus,
  selectUserTasksCountByStatus,
  selectAllTasks,
  selectTasksByProjectId,
  selectTaskById,
  selectDashboardStats,
  selectRecentTasks,
  selectTaskSummaryCards,
  selectAllProjects,
  selectProjectById,
  selectProjectsByStatus,
  selectProjectsByTeam,
  selectProjectsByTeamAndStatus,
  selectProjectsForUserTeams,
  selectProjectsForCurrentTeam,
} from "./selectors.js";
