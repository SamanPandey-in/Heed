import { createSlice } from "@reduxjs/toolkit";

// Default user state - in a real app, this would come from auth
const initialState = {
  id: "user_1",
  name: "John Doe",
  email: "john@example.com",
  teams: ["team_1", "team_2"], // Array of team IDs
  currentTeamId: "team_1", // Currently selected team
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Set user data (typically from auth)
    setUser: (state, action) => {
      const { id, name, email, teams } = action.payload;
      state.id = id;
      state.name = name;
      state.email = email;
      state.teams = teams || [];
      if (state.teams.length > 0 && !state.currentTeamId) {
        state.currentTeamId = state.teams[0];
      }
    },

    // Set currently selected team
    setCurrentTeamId: (state, action) => {
      const teamId = action.payload;
      if (state.teams.includes(teamId)) {
        state.currentTeamId = teamId;
      }
    },

    // Add team to user's teams (after successfully joining)
    addTeamToUser: (state, action) => {
      const teamId = action.payload;
      if (!state.teams.includes(teamId)) {
        state.teams.push(teamId);
        // If this is the first team, set it as current
        if (state.teams.length === 1) {
          state.currentTeamId = teamId;
        }
      }
    },

    // Remove team from user's teams (after leaving)
    removeTeamFromUser: (state, action) => {
      const teamId = action.payload;
      state.teams = state.teams.filter((id) => id !== teamId);
      
      // If removed team was current, switch to first remaining team
      if (state.currentTeamId === teamId) {
        state.currentTeamId = state.teams.length > 0 ? state.teams[0] : null;
      }
    },

    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setUser,
  setCurrentTeamId,
  addTeamToUser,
  removeTeamFromUser,
  setLoading,
  setError,
  clearError,
} = userSlice.actions;

export default userSlice.reducer;
