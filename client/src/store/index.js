// Store
export { default as store } from "./store.js";

// Thunks (for atomic multi-slice operations)
export { deleteTeamAtomic, joinTeamAtomic } from "./thunks.js";

// Theme Slice
export { toggleTheme, setTheme, loadTheme } from "./slices/themeSlice.js";
export { default as themeReducer } from "./slices/themeSlice.js";

// API Slice
export { apiSlice } from "./slices/apiSlice.js";

// User Slice
export {
  setUser,
  setCurrentTeamId,
  addTeamToUser,
  removeTeamFromUser,
  setLoading as setUserLoading,
  setError as setUserError,
  clearError as clearUserError,
} from "./slices/userSlice.js";
export { default as userReducer } from "./slices/userSlice.js";

// Projects Slice
export {
  setProjects,
  setCurrentProjectId,
  addProject,
  updateProject,
  updateProjectStatus,
  deleteProject,
  addTask,
  updateTask,
  deleteTask,
} from "./slices/projectsSlice.js";
export { default as projectsReducer } from "./slices/projectsSlice.js";

// Tasks Slice
export {
  setTasks,
  setTasksLoading,
  setTasksError,
  clearTasksError,
} from "./slices/tasksSlice.js";
export { default as tasksReducer } from "./slices/tasksSlice.js";

// Teams Slice
export {
  createTeam,
  joinTeam,
  leaveTeam,
  addTeamMember,
  removeTeamMember,
  updateTeam,
  deleteTeam,
  setTeams,
  setLoading as setTeamsLoading,
  setError as setTeamsError,
  clearError as clearTeamsError,
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

// Selectors
export {
  selectCurrentUserId,
  selectUserTeams,
  selectUserTeamObjects,
  selectCurrentTeamId,
  selectCurrentTeam,
  selectCurrentTeamMembers,
  selectTeamMembers,
  selectAllTeams,
  selectTeamById,
  selectTeamProjects,
  selectTeamProjectsByStatus,
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
  selectProjectsByStatus,
  selectProjectsByTeam,
  selectProjectsForUserTeams,
  selectProjectsForCurrentTeam,
} from "./selectors.js";
