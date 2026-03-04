// Store
export { default as store } from "./store.js";

// Theme Slice
export { toggleTheme, setTheme, loadTheme } from "./slices/themeSlice.js";
export { default as themeReducer } from "./slices/themeSlice.js";

// API Slice
export { apiSlice } from "./slices/apiSlice.js";

// Projects Slice
export {
  setProjects,
  setCurrentProjectId,
  addProject,
  updateProject,
  deleteProject,
  addTask,
  updateTask,
  deleteTask,
} from "./slices/projectsSlice.js";
export { default as projectsReducer } from "./slices/projectsSlice.js";

// Teams Slice
export {
  setTeamMembers,
  addTeamMember,
  removeTeamMember,
  updateTeamMember,
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