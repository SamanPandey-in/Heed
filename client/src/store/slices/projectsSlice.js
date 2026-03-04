import { createSlice } from "@reduxjs/toolkit";
import { dummyProjects } from "../../assets/assets";

const FALLBACK_TEAM_ID = "team_1";

const normalizeProject = (project, index = 0) => {
  const fallbackTeamId = `team_${(index % 3) + 1}`;
  const memberIds = Array.isArray(project.memberIds)
    ? project.memberIds
    : (project.members || [])
        .map((member) => member?.user?.id || member?.userId)
        .filter(Boolean);

  return {
    ...project,
    teamId: project.teamId || fallbackTeamId || FALLBACK_TEAM_ID,
    result: project.result ?? null,
    memberIds: [...new Set(memberIds)],
  };
};

const initialState = {
  projects: (dummyProjects || []).map((project, index) =>
    normalizeProject(project, index)
  ),
  currentProjectId: null,
  loading: false,
  error: null,
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setProjects: (state, action) => {
      state.projects = (action.payload || []).map((project, index) =>
        normalizeProject(project, index)
      );
    },
    setCurrentProjectId: (state, action) => {
      state.currentProjectId = action.payload;
    },
    addProject: (state, action) => {
      const {
        id,
        name,
        teamId,
        status = "PLANNING",
        result = null,
        validTeamIds = [],
        ...rest
      } = action.payload;

      if (!name?.trim()) {
        state.error = "Project name is required";
        return;
      }

      if (!teamId) {
        state.error = "Project must belong to a team";
        return;
      }

      // Caller provides the list of known team IDs so this slice can enforce team existence.
      if (validTeamIds.length > 0 && !validTeamIds.includes(teamId)) {
        state.error = `Team with id ${teamId} does not exist`;
        return;
      }

      const projectId = id || `project_${Date.now()}`;
      if (state.projects.some((project) => project.id === projectId)) {
        state.error = `Project with id ${projectId} already exists`;
        return;
      }

      const nextProject = normalizeProject(
        {
          id: projectId,
          name: name.trim(),
          teamId,
          status,
          result,
          ...rest,
        },
        state.projects.length
      );

      state.projects.push(nextProject);
      state.error = null;
    },
    updateProject: (state, action) => {
      state.projects = state.projects.map((p) =>
        p.id === action.payload.id ? normalizeProject(action.payload) : p
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
