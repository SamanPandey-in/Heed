import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchWorkspaces = createAsyncThunk('workspace/fetchAll', async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('accessToken');
    try {
        const res = await fetch(`${API_URL}/workspaces`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
            const err = await res.json();
            return rejectWithValue(err.message || 'Failed to load workspaces');
        }
        const data = await res.json();
        return data.data;
    } catch (err) {
        return rejectWithValue(err.message);
    }
});

const initialState = {
    workspaces: [],
    currentWorkspace: null,
    loading: false,
};

const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        setWorkspaces: (state, action) => {
            state.workspaces = action.payload;
        },
        setCurrentWorkspace: (state, action) => {
            localStorage.setItem("currentWorkspaceId", action.payload);
            state.currentWorkspace = state.workspaces.find((w) => w.id === action.payload);
        },
        addWorkspace: (state, action) => {
            state.workspaces.push(action.payload);
            if (state.currentWorkspace?.id !== action.payload.id) {
                state.currentWorkspace = action.payload;
            }
        },
        updateWorkspace: (state, action) => {
            state.workspaces = state.workspaces.map((w) =>
                w.id === action.payload.id ? action.payload : w
            );
            if (state.currentWorkspace?.id === action.payload.id) {
                state.currentWorkspace = action.payload;
            }
        },
        deleteWorkspace: (state, action) => {
            state.workspaces = state.workspaces.filter((w) => w.id !== action.payload);
        },
        addProject: (state, action) => {
            if (state.currentWorkspace) {
                state.currentWorkspace.projects = [...(state.currentWorkspace.projects || []), action.payload];
            }
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace?.id ? { ...w, projects: [...(w.projects || []), action.payload] } : w
            );
        },
        addTask: (state, action) => {
            if (state.currentWorkspace?.projects) {
                state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) =>
                    p.id === action.payload.projectId ? { ...p, tasks: [...(p.tasks || []), action.payload] } : p
                );
            }
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace?.id ? {
                    ...w, projects: w.projects.map((p) =>
                        p.id === action.payload.projectId ? { ...p, tasks: [...(p.tasks || []), action.payload] } : p
                    )
                } : w
            );
        },
        updateTask: (state, action) => {
            const project = state.currentWorkspace?.projects?.find(p => p.id === action.payload.projectId);
            if (project) {
                project.tasks = project.tasks.map(t => t.id === action.payload.id ? action.payload : t);
            }
            state.workspaces = state.workspaces.map(w =>
                w.id === state.currentWorkspace?.id ? {
                    ...w, projects: w.projects.map(p =>
                        p.id === action.payload.projectId ? {
                            ...p, tasks: p.tasks.map(t => t.id === action.payload.id ? action.payload : t)
                        } : p
                    )
                } : w
            );
        },
        deleteTask: (state, action) => {
            const { taskId, projectId } = action.payload;
            const proj = state.currentWorkspace?.projects?.find(p => p.id === projectId);
            if (proj) proj.tasks = proj.tasks.filter(t => t.id !== taskId);
            state.workspaces = state.workspaces.map(w =>
                w.id === state.currentWorkspace?.id ? {
                    ...w, projects: w.projects.map(p =>
                        p.id === projectId ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) } : p
                    )
                } : w
            );
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWorkspaces.pending, (state) => { state.loading = true; })
            .addCase(fetchWorkspaces.fulfilled, (state, action) => {
                state.workspaces = action.payload;
                state.loading = false;
                const savedId = localStorage.getItem('currentWorkspaceId');
                state.currentWorkspace = action.payload.find(w => w.id === savedId) || action.payload[0] || null;
            })
            .addCase(fetchWorkspaces.rejected, (state) => { state.loading = false; });
    }
});

export const { setWorkspaces, setCurrentWorkspace, addWorkspace, updateWorkspace, deleteWorkspace, addProject, addTask, updateTask, deleteTask } = workspaceSlice.actions;
export default workspaceSlice.reducer;