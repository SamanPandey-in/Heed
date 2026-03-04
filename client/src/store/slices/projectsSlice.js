import { createSlice } from "@reduxjs/toolkit";
import { dummyProjects } from "../../assets/assets";

const FALLBACK_TEAM_ID = "team_1";
const VALID_PROJECT_RESULTS = ["success", "failed", "ongoing"];

const normalizeProjectStatus = (status) => {
  const normalized = String(status || "").trim().toLowerCase();

  if (normalized === "completed" || normalized === "done") return "completed";
  if (normalized === "deprecated" || normalized === "cancelled" || normalized === "archived") {
    return "deprecated";
  }
  if (normalized === "active" || normalized === "planning" || normalized === "on_hold") {
    return "active";
  }

  return "active";
};

const normalizeProjectResult = (status, result) => {
  const normalizedStatus = normalizeProjectStatus(status);
  if (normalizedStatus !== "completed") {
    return null;
  }

  const normalizedResult = String(result ?? "")
    .trim()
    .toLowerCase();

  if (!normalizedResult) {
    return null;
  }

  if (normalizedResult === "in_progress") return "ongoing";
  if (normalizedResult === "successful") return "success";
  if (normalizedResult === "fail") return "failed";

  return VALID_PROJECT_RESULTS.includes(normalizedResult) ? normalizedResult : null;
};

const normalizeTaskInput = (task = {}, fallbackProjectId) => {
  const normalizedTask = {
    ...task,
    id: task.id || `task_${Date.now()}`,
    projectId: task.projectId || fallbackProjectId,
  };

  if (!normalizedTask.assigneeId && task.assignee?.id) {
    normalizedTask.assigneeId = task.assignee.id;
  }

  return normalizedTask;
};

const normalizeProject = (project, index = 0) => {
  const fallbackTeamId = `team_${(index % 3) + 1}`;
  const normalizedStatus = normalizeProjectStatus(project.status);
  const memberIds = Array.isArray(project.memberIds)
    ? project.memberIds
    : (project.members || [])
        .map((member) => member?.user?.id || member?.userId)
        .filter(Boolean);
  const { members: _members, team_members: _legacyTeamMembers, ...projectRest } = project;

  return {
    ...projectRest,
    teamId: project.teamId || fallbackTeamId || FALLBACK_TEAM_ID,
    status: normalizedStatus,
    result: normalizeProjectResult(normalizedStatus, project.result),
    memberIds: [...new Set(memberIds)],
    taskIds: [...new Set(project.taskIds || [])],
  };
};

const normalizeProjectsPayload = (projects = []) => {
  const projectEntities = {};
  const projectIds = [];

  projects.forEach((project, index) => {
    const projectId = project.id || `project_${Date.now()}_${index}`;
    const tasks = Array.isArray(project.tasks) ? project.tasks : [];
    const normalizedTaskIds = tasks.map((task, taskIndex) =>
      normalizeTaskInput(
        {
          ...task,
          id: task.id || `task_${projectId}_${taskIndex}`,
          projectId,
        },
        projectId
      ).id
    );

    const { tasks: _ignoredTasks, ...projectRest } = project;

    projectEntities[projectId] = normalizeProject(
      {
        ...projectRest,
        id: projectId,
        taskIds: normalizedTaskIds,
      },
      index
    );
    projectIds.push(projectId);
  });

  return {
    projects: projectEntities,
    projectIds,
  };
};

const normalizedInitialState = normalizeProjectsPayload(dummyProjects || []);

const initialState = {
  projects: normalizedInitialState.projects, // Normalized project entities
  projectIds: normalizedInitialState.projectIds, // Ordered project IDs
  currentProjectId: null,
  loading: false,
  error: null,
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setProjects: (state, action) => {
      const normalized = normalizeProjectsPayload(action.payload || []);
      state.projects = normalized.projects;
      state.projectIds = normalized.projectIds;
      state.error = null;
    },
    setCurrentProjectId: (state, action) => {
      state.currentProjectId = action.payload;
    },
    addProject: (state, action) => {
      const {
        id,
        name,
        teamId,
        status = "active",
        result = null,
        validTeamIds = [],
        tasks = [],
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

      if (validTeamIds.length > 0 && !validTeamIds.includes(teamId)) {
        state.error = `Team with id ${teamId} does not exist`;
        return;
      }

      const projectId = id || `project_${Date.now()}`;
      if (state.projects[projectId]) {
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
          taskIds: tasks.map((task, index) =>
            normalizeTaskInput(
              {
                ...task,
                projectId,
                id: task.id || `task_${projectId}_${index}`,
              },
              projectId
            ).id
          ),
        },
        state.projectIds.length
      );

      state.projects[projectId] = nextProject;
      state.projectIds.push(projectId);
      state.error = null;
    },
    updateProject: (state, action) => {
      const incomingProject = action.payload;
      if (!incomingProject?.id || !state.projects[incomingProject.id]) {
        state.error = `Project with id ${incomingProject?.id} not found`;
        return;
      }

      const existingProject = state.projects[incomingProject.id];
      const nextStatus = incomingProject.status ?? existingProject.status;
      const nextTeamId = incomingProject.teamId || existingProject.teamId;
      const mergedProject = normalizeProject({
        ...existingProject,
        ...incomingProject,
        teamId: nextTeamId,
        status: nextStatus,
        result: normalizeProjectResult(nextStatus, incomingProject.result ?? existingProject.result),
        taskIds: existingProject.taskIds,
      });

      state.projects[incomingProject.id] = mergedProject;
      state.error = null;
    },
    updateProjectStatus: (state, action) => {
      const { projectId, status, result } = action.payload;
      const project = state.projects[projectId];

      if (!project) {
        state.error = `Project with id ${projectId} not found`;
        return;
      }

      const normalizedStatus = normalizeProjectStatus(status ?? project.status);
      project.status = normalizedStatus;
      project.result = normalizeProjectResult(normalizedStatus, result ?? project.result);

      project.updatedAt = new Date().toISOString();
      state.error = null;
    },
    deleteProject: (state, action) => {
      const projectId = action.payload;
      const project = state.projects[projectId];

      if (!project) {
        state.error = `Project with id ${projectId} not found`;
        return;
      }

      delete state.projects[projectId];
      state.projectIds = state.projectIds.filter((id) => id !== projectId);

      if (state.currentProjectId === projectId) {
        state.currentProjectId = null;
      }

      state.error = null;
    },
    addTask: (state, action) => {
      const incomingTask = action.payload;
      const projectId = incomingTask?.projectId;
      const taskId = incomingTask?.id;

      if (!projectId || !state.projects[projectId]) {
        state.error = `Project with id ${projectId} not found`;
        return;
      }

      if (!taskId) {
        state.error = "Task id is required";
        return;
      }

      const project = state.projects[projectId];

      if (!project.taskIds.includes(taskId)) {
        project.taskIds.push(taskId);
      }

      state.error = null;
    },
    updateTask: (state, action) => {
      const incomingTask = action.payload;
      const taskId = incomingTask?.id;

      if (!taskId) {
        state.error = "Task id is required";
        return;
      }

      const nextProjectId = incomingTask?.projectId;
      if (nextProjectId && !state.projects[nextProjectId]) {
        state.error = `Project with id ${nextProjectId} not found`;
        return;
      }

      const oldProjectId = incomingTask?.oldProjectId;
      if (oldProjectId && state.projects[oldProjectId]) {
        state.projects[oldProjectId].taskIds = state.projects[oldProjectId].taskIds.filter(
          (id) => id !== taskId
        );
      } else {
        Object.values(state.projects).forEach((project) => {
          if (project.taskIds.includes(taskId) && project.id !== nextProjectId) {
            project.taskIds = project.taskIds.filter((id) => id !== taskId);
          }
        });
      }

      if (nextProjectId && state.projects[nextProjectId]) {
        const taskIds = state.projects[nextProjectId].taskIds;
        if (!taskIds.includes(taskId)) {
          taskIds.push(taskId);
        }
      }

      state.error = null;
    },
    deleteTask: (state, action) => {
      const payload = action.payload;
      const taskIdsToDelete = Array.isArray(payload)
        ? payload
        : payload?.taskIds || (payload ? [payload] : []);
      const projectId = payload?.projectId;

      if (projectId && state.projects[projectId]) {
        state.projects[projectId].taskIds = state.projects[projectId].taskIds.filter(
          (id) => !taskIdsToDelete.includes(id)
        );
      } else {
        Object.values(state.projects).forEach((project) => {
          project.taskIds = project.taskIds.filter((id) => !taskIdsToDelete.includes(id));
        });
      }

      state.error = null;
    },
  },
});

export const {
  setProjects,
  setCurrentProjectId,
  addProject,
  updateProject,
  updateProjectStatus,
  deleteProject,
  addTask,
  updateTask,
  deleteTask,
} = projectsSlice.actions;

export default projectsSlice.reducer;
