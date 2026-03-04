import { createSlice } from "@reduxjs/toolkit";
import { dummyProjects } from "../../assets/assets";
import {
  addProject,
  addTask,
  deleteProject,
  deleteTask,
  setProjects,
  updateProject,
  updateTask,
} from "./projectsSlice";

const normalizeTask = (task = {}, fallbackProjectId = null) => {
  const { assignee: _assignee, ...taskRest } = task;
  const normalizedTask = {
    ...taskRest,
    id: task.id || `task_${Date.now()}`,
    projectId: task.projectId || fallbackProjectId,
  };

  if (!normalizedTask.assigneeId && task.assignee?.id) {
    normalizedTask.assigneeId = task.assignee.id;
  }

  return normalizedTask;
};

const normalizeTaskCollection = (tasks = []) => {
  const entities = {};
  const ids = [];

  tasks.forEach((task) => {
    if (!task?.id) return;

    entities[task.id] = task;
    ids.push(task.id);
  });

  return {
    tasks: entities,
    taskIds: ids,
  };
};

const normalizeTasksFromProjects = (projects = []) => {
  const entities = {};
  const ids = [];

  projects.forEach((project, projectIndex) => {
    const projectId = project?.id || `project_${projectIndex}`;
    const tasks = Array.isArray(project?.tasks) ? project.tasks : [];

    tasks.forEach((task, taskIndex) => {
      const normalizedTask = normalizeTask(
        {
          ...task,
          id: task.id || `task_${projectId}_${taskIndex}`,
          projectId,
        },
        projectId
      );

      entities[normalizedTask.id] = normalizedTask;
      if (!ids.includes(normalizedTask.id)) {
        ids.push(normalizedTask.id);
      }
    });
  });

  return {
    tasks: entities,
    taskIds: ids,
  };
};

const normalizedInitialState = normalizeTasksFromProjects(dummyProjects || []);

const initialState = {
  tasks: normalizedInitialState.tasks,
  taskIds: normalizedInitialState.taskIds,
  loading: false,
  error: null,
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasks: (state, action) => {
      const normalizedTasks = normalizeTaskCollection(action.payload || []);
      state.tasks = normalizedTasks.tasks;
      state.taskIds = normalizedTasks.taskIds;
      state.error = null;
    },
    setTasksLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setTasksError: (state, action) => {
      state.error = action.payload || null;
    },
    clearTasksError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setProjects, (state, action) => {
      const normalized = normalizeTasksFromProjects(action.payload || []);
      state.tasks = normalized.tasks;
      state.taskIds = normalized.taskIds;
      state.error = null;
    });

    builder.addCase(addProject, (state, action) => {
      const project = action.payload || {};
      const projectId = project.id;
      const tasks = Array.isArray(project.tasks) ? project.tasks : [];

      tasks.forEach((task, index) => {
        const normalizedTask = normalizeTask(
          {
            ...task,
            id: task.id || `task_${projectId}_${index}`,
            projectId,
          },
          projectId
        );

        state.tasks[normalizedTask.id] = normalizedTask;
        if (!state.taskIds.includes(normalizedTask.id)) {
          state.taskIds.push(normalizedTask.id);
        }
      });
    });

    builder.addCase(updateProject, (state, action) => {
      const project = action.payload || {};
      if (!Array.isArray(project.tasks)) return;

      const projectId = project.id;
      const nextTaskEntities = {};
      const nextTaskIds = [];

      project.tasks.forEach((task, index) => {
        const normalizedTask = normalizeTask(
          {
            ...task,
            id: task.id || `task_${projectId}_${index}`,
            projectId,
          },
          projectId
        );
        nextTaskEntities[normalizedTask.id] = normalizedTask;
        nextTaskIds.push(normalizedTask.id);
      });

      state.taskIds.forEach((taskId) => {
        const task = state.tasks[taskId];
        if (task?.projectId !== projectId) return;
        if (nextTaskIds.includes(taskId)) return;
        delete state.tasks[taskId];
      });
      state.taskIds = state.taskIds.filter((taskId) => state.tasks[taskId]);

      Object.entries(nextTaskEntities).forEach(([taskId, task]) => {
        state.tasks[taskId] = task;
        if (!state.taskIds.includes(taskId)) {
          state.taskIds.push(taskId);
        }
      });
    });

    builder.addCase(deleteProject, (state, action) => {
      const projectId = action.payload;
      state.taskIds.forEach((taskId) => {
        if (state.tasks[taskId]?.projectId === projectId) {
          delete state.tasks[taskId];
        }
      });
      state.taskIds = state.taskIds.filter((taskId) => state.tasks[taskId]);
    });

    builder.addCase(addTask, (state, action) => {
      const payload = action.payload || {};
      if (!payload.id) {
        state.error = "Task id is required";
        return;
      }
      const normalizedTask = normalizeTask(payload, payload.projectId);

      state.tasks[normalizedTask.id] = normalizedTask;
      if (!state.taskIds.includes(normalizedTask.id)) {
        state.taskIds.push(normalizedTask.id);
      }
      state.error = null;
    });

    builder.addCase(updateTask, (state, action) => {
      const payload = action.payload || {};
      const taskId = payload.id;

      if (!taskId || !state.tasks[taskId]) {
        state.error = `Task with id ${taskId} not found`;
        return;
      }

      const mergedTask = normalizeTask(
        {
          ...state.tasks[taskId],
          ...payload,
        },
        payload.projectId || state.tasks[taskId].projectId
      );

      state.tasks[taskId] = mergedTask;
      state.error = null;
    });

    builder.addCase(deleteTask, (state, action) => {
      const payload = action.payload;
      const taskIdsToDelete = Array.isArray(payload)
        ? payload
        : payload?.taskIds || (payload ? [payload] : []);

      taskIdsToDelete.forEach((taskId) => {
        delete state.tasks[taskId];
      });
      state.taskIds = state.taskIds.filter((taskId) => state.tasks[taskId]);
      state.error = null;
    });
  },
});

export const { setTasks, setTasksLoading, setTasksError, clearTasksError } = tasksSlice.actions;

export default tasksSlice.reducer;
