// redux store configuration
import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./slices/themeSlice";
import userReducer from "./slices/userSlice";
import projectsReducer from "./slices/projectsSlice";
import teamsReducer from "./slices/teamsSlice";
import settingsReducer from "./slices/settingsSlice";
import { apiSlice } from "./slices/apiSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    user: userReducer,
    projects: projectsReducer,
    teams: teamsReducer,
    settings: settingsReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  
  // Optional: enable Redux DevTools automatically in dev
  devTools: import.meta.env.DEV,
});

export default store;