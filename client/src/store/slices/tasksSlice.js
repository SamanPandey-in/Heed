import { createSlice, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";
import api from "../../lib/api";

const tasksAdapter = createEntityAdapter({
  selectId: (task) => task.id,
  sortComparer: (a, b) => {
    const dateA = a.createdAt || "";
    const dateB = b.createdAt || "";
    return dateB.localeCompare(dateA);
  },
});

export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/tasks");
      return response.data.tasks || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch tasks");
    }
  }
);

const initialState = tasksAdapter.getInitialState({
  loading: false,
  error: null,
});

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    updateTask: (state, action) => {
      const task = action.payload;
      if (!task?.id) return;

      tasksAdapter.updateOne(state, {
        id: task.id,
        changes: task,
      });
    },
    deleteTask: (state, action) => {
      const payload = action.payload;
      const ids = Array.isArray(payload) ? payload : [payload];
      tasksAdapter.removeMany(state, ids.filter(Boolean));
    },
    clearTasksError: (state) => {
      state.error = null;
    },
    resetTasksState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        tasksAdapter.setAll(state, action.payload);
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateTask, deleteTask, clearTasksError, resetTasksState } = tasksSlice.actions;

// Export selectors
export const {
  selectAll: selectAllTasks,
  selectById: selectTaskById,
  selectIds: selectTaskIds,
  selectEntities: selectTaskEntities,
} = tasksAdapter.getSelectors((state) => state.tasks);

// Custom selectors
export const selectTasksLoading = (state) => state.tasks.loading;
export const selectTasksError = (state) => state.tasks.error;

export default tasksSlice.reducer;
