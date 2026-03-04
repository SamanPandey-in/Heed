import { createSlice } from "@reduxjs/toolkit";

// Default users state - in a real app, this would come from auth
const initialState = {
  users: {
    user_1: {
      id: "user_1",
      name: "John Doe",
      email: "john@example.com",
      teamIds: ["team_1", "team_2"],
    },
  }, // Normalized user entities
  userIds: ["user_1"],
  currentUserId: "user_1",
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
      state.currentUserId = id;
      state.users[id] = { id, name, email, teamIds: teams || [] };
      if (!state.userIds.includes(id)) {
        state.userIds.push(id);
      }

      const userTeamIds = state.users[id].teamIds || [];
      if (userTeamIds.length > 0 && !state.currentTeamId) {
        state.currentTeamId = userTeamIds[0];
      }
    },

    // Set currently selected team
    setCurrentTeamId: (state, action) => {
      const teamId = action.payload;
      const currentUser = state.users[state.currentUserId];
      const userTeamIds = currentUser?.teamIds || [];
      if (userTeamIds.includes(teamId)) {
        state.currentTeamId = teamId;
      }
    },

    // Add team to user's teams (after successfully joining)
    // ⚠️  IMPORTANT: This only updates userSlice.user.teams
    // When user joins a team, must also call joinTeam to add user to team.members
    // Use joinTeamAtomic thunk from store/thunks.js to ensure consistency
    addTeamToUser: (state, action) => {
      const teamId = action.payload;
      const currentUser = state.currentUserId ? state.users[state.currentUserId] : null;
      if (!currentUser) return;

      const userTeamIds = currentUser.teamIds || [];

      if (!userTeamIds.includes(teamId)) {
        currentUser.teamIds = [...userTeamIds, teamId];

        // If this is the first team, set it as current
        if (currentUser.teamIds.length === 1) {
          state.currentTeamId = teamId;
        }
      }
    },

    // Remove team from user's teams (after leaving)
    // ⚠️  IMPORTANT: This only updates userSlice.user.teams
    // When user leaves team or team is deleted, must also update team.members
    // When team is deleted, use deleteTeamAtomic thunk from store/thunks.js
    removeTeamFromUser: (state, action) => {
      const teamId = action.payload;
      const currentUser = state.currentUserId ? state.users[state.currentUserId] : null;
      if (!currentUser) return;

      currentUser.teamIds = (currentUser.teamIds || []).filter((id) => id !== teamId);
      
      // If removed team was current, switch to first remaining team
      if (state.currentTeamId === teamId) {
        state.currentTeamId = currentUser.teamIds.length > 0 ? currentUser.teamIds[0] : null;
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
