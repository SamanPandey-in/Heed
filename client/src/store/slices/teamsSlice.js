import { createSlice, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";
import api from "../../lib/api";

const teamsAdapter = createEntityAdapter({
  selectId: (team) => team.id,
  sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt),
});

export const fetchTeams = createAsyncThunk(
  "teams/fetchTeams",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/teams");
      // The backend returns { success: true, teams: [...] }
      return response.data.teams || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch teams");
    }
  }
);

export const createTeam = createAsyncThunk(
  "teams/createTeam",
  async (teamData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post("/teams", teamData);
      // Hybrid pattern: re-fetch after successful creation for consistency
      dispatch(fetchTeams());
      return response.data.team;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create team");
    }
  }
);

export const joinTeamByInviteCode = createAsyncThunk(
  "teams/joinTeamByInviteCode",
  async (inviteCode, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post("/teams/join", { inviteCode });
      dispatch(fetchTeams());
      return response.data.team;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to join team");
    }
  }
);

export const updateTeamName = createAsyncThunk(
  "teams/updateTeamName",
  async ({ teamId, name, description }, { dispatch, rejectWithValue }) => {
    try {
      if (!teamId) {
        return rejectWithValue("Team ID is required");
      }

      const hasName = typeof name === "string";
      const hasDescription = typeof description === "string";

      if (!hasName && !hasDescription) {
        return rejectWithValue("No valid fields provided for update");
      }

      if (hasName && !name.trim()) {
        return rejectWithValue("Team name is required");
      }

      const payload = {
        ...(hasName ? { name: name.trim() } : {}),
        ...(hasDescription ? { description: description.trim() } : {}),
      };

      const response = await api.patch(`/teams/${teamId}`, payload);

      dispatch(fetchTeams());
      return response.data?.team || null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update team");
    }
  }
);

const initialState = teamsAdapter.getInitialState({
  loading: false,
  error: null,
  currentTeamId: null,
});

const teamsSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    setCurrentTeamId: (state, action) => {
      state.currentTeamId = action.payload;
    },
    clearTeamsError: (state) => {
      state.error = null;
    },
    resetTeamsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Teams
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        teamsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Team
      .addCase(createTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          teamsAdapter.addOne(state, action.payload);
        }
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(joinTeamByInviteCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinTeamByInviteCode.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          teamsAdapter.addOne(state, action.payload);
        }
      })
      .addCase(joinTeamByInviteCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateTeamName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTeamName.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.id) {
          teamsAdapter.upsertOne(state, action.payload);
        }
      })
      .addCase(updateTeamName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setCurrentTeamId, 
  clearTeamsError, 
  resetTeamsState 
} = teamsSlice.actions;

// Export selectors
export const {
  selectAll: selectAllTeams,
  selectById: selectTeamById,
  selectIds: selectTeamIds,
  selectEntities: selectTeamEntities,
  selectTotal: selectTeamTotal,
} = teamsAdapter.getSelectors((state) => state.teams);

// Custom selectors
export const selectTeamsLoading = (state) => state.teams.loading;
export const selectTeamsError = (state) => state.teams.error;
export const selectCurrentTeamId = (state) => state.teams.currentTeamId;
export const selectCurrentTeam = (state) => 
  state.teams.currentTeamId ? state.teams.entities[state.teams.currentTeamId] : null;

export default teamsSlice.reducer;

