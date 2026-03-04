import { createSlice } from "@reduxjs/toolkit";
import { dummyProjects } from "../../assets/assets";

const initialState = {
  projects: dummyProjects || [],
  currentProjectId: null,
  loading: false,
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setProjects: (state, action) => {
      state.projects = action.payload;
    },
    setCurrentProjectId: (state, action) => {
      state.currentProjectId = action.payload;
    },
    addProject: (state, action) => {
      state.projects.push(action.payload);
    },
    updateProject: (state, action) => {
      state.projects = state.projects.map((p) =>
        p.id === action.payload.id ? action.payload : p
      );
    },
    deleteProject: (state, action) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
    },
    addTask: (state, action) => {
      state.projects = state.projects.map((p) => {
        if (p.id === action.payload.projectId) {
          return {
            ...p,
            tasks: [...(p.tasks || []), action.payload],
          };
        }
        return p;
      });
    },
    updateTask: (state, action) => {
      state.projects = state.projects.map((p) => {
        if (p.id === action.payload.projectId) {
          return {
            ...p,
            tasks: (p.tasks || []).map((t) =>
              t.id === action.payload.id ? action.payload : t
            ),
          };
        }
        return p;
      });
    },
    deleteTask: (state, action) => {
      state.projects = state.projects.map((p) => {
        if (p.id === action.payload.projectId) {
          return {
            ...p,
            tasks: (p.tasks || []).filter((t) => !action.payload.taskIds.includes(t.id)),
          };
        }
        return p;
      });
    },
  },
});

export const {
  setProjects,
  setCurrentProjectId,
  addProject,
  updateProject,
  deleteProject,
  addTask,
  updateTask,
  deleteTask,
} = projectsSlice.actions;

export default projectsSlice.reducer;
