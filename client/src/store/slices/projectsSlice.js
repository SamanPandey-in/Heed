import { createSlice, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";
import api from "../../lib/api";
import { fetchTeams } from "./teamsSlice";

const normalizeProjectStatus = (status) => {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "completed" || normalized === "done") return "completed";
  if (normalized === "deprecated" || normalized === "cancelled" || normalized === "archived") return "deprecated";
  return "active";
};

const projectsAdapter = createEntityAdapter({
  selectId: (project) => project.id,
  sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt),
});

export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/projects");
      return response.data.projects || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch projects");
    }
  }
);

export const createProject = createAsyncThunk(
  "projects/createProject",
  async (projectData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post("/projects", projectData);
      // Hybrid pattern + dependency refresh
      dispatch(fetchProjects());
      dispatch(fetchTeams()); // Update team's project list
      return response.data.project;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create project");
    }
  }
);

const initialState = projectsAdapter.getInitialState({
  loading: false,
  error: null,
  currentProjectId: null,
});

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setCurrentProjectId: (state, action) => {
      state.currentProjectId = action.payload;
    },
    clearProjectsError: (state) => {
      state.error = null;
    },
    resetProjectsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        projectsAdapter.setAll(state, action.payload.map(p => ({
            ...p,
            status: normalizeProjectStatus(p.status)
        })));
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          projectsAdapter.addOne(state, {
              ...action.payload,
              status: normalizeProjectStatus(action.payload.status)
          });
        }
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setCurrentProjectId, 
  clearProjectsError, 
  resetProjectsState 
} = projectsSlice.actions;

// Export selectors
export const {
  selectAll: selectAllProjects,
  selectById: selectProjectById,
  selectIds: selectProjectIds,
  selectEntities: selectProjectEntities,
} = projectsAdapter.getSelectors((state) => state.projects);

// Custom selectors
export const selectProjectsLoading = (state) => state.projects.loading;
export const selectProjectsError = (state) => state.projects.error;
export const selectCurrentProjectId = (state) => state.projects.currentProjectId;
export const selectCurrentProject = (state) => 
  state.projects.currentProjectId ? state.projects.entities[state.projects.currentProjectId] : null;

export default projectsSlice.reducer;

