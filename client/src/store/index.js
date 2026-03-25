export { default as store } from "./store.js";

export { fetchTeams, createTeam, joinTeamByInviteCode, updateTeamName } from "./slices/teamsSlice.js";
export { fetchProjects, createProject } from "./slices/projectsSlice.js";
export { fetchTasks } from "./slices/tasksSlice.js";

export { toggleTheme, setTheme, loadTheme } from "./slices/themeSlice.js";
export { default as themeReducer } from "./slices/themeSlice.js";

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

export {
  setCurrentProjectId,
  clearProjectsError,
  resetProjectsState,
  selectAllProjects as selectAllProjectsValue,
  selectProjectById as selectProjectByIdValue,
  selectProjectIds,
  selectProjectEntities,
  selectProjectsLoading,
  selectProjectsError,
  selectCurrentProjectId as selectCurrentProjectIdValue,
  selectCurrentProject,
} from "./slices/projectsSlice.js";
export { default as projectsReducer } from "./slices/projectsSlice.js";

export {
  updateTask,
  deleteTask,
  clearTasksError,
  resetTasksState,
  selectAllTasks as selectAllTasksValue,
  selectTaskById as selectTaskByIdValue,
  selectTaskIds,
  selectTaskEntities,
  selectTasksLoading,
  selectTasksError,
} from "./slices/tasksSlice.js";
export { default as tasksReducer } from "./slices/tasksSlice.js";

export {
  setCurrentTeamId,
  clearTeamsError,
  resetTeamsState,
  selectAllTeams as selectAllTeamsValue,
  selectTeamById as selectTeamByIdValue,
  selectTeamIds,
  selectTeamEntities,
  selectTeamTotal,
  selectTeamsLoading,
  selectTeamsError as selectTeamsErrorValue,
  selectCurrentTeamId as selectCurrentTeamIdValue,
  selectCurrentTeam as selectCurrentTeamValue,
} from "./slices/teamsSlice.js";
export { default as teamsReducer } from "./slices/teamsSlice.js";

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
  selectSearchableItems,
} from "./selectors.js";
