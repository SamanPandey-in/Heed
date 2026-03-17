import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: {},
  userIds: [],
  currentUserId: null,
  currentTeamId: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Called after successful login / signup / session restore
    // Payload: { id, email, username, fullName, avatarUrl, bio, isEmailVerified, createdAt, updatedAt, lastLoginAt, teamIds }
    setUser: (state, action) => {
      const {
        id,
        email,
        username,
        fullName,
        avatarUrl,
        bio,
        isEmailVerified,
        createdAt,
        updatedAt,
        lastLoginAt,
        teamIds = [],
      } = action.payload;

      if (!id) return;

      state.currentUserId = id;
      state.users[id] = {
        id,
        email,
        username,
        fullName,
        name: fullName,
        avatarUrl: avatarUrl || null,
        image: avatarUrl || null,
        bio: bio || '',
        about: bio || '',
        isEmailVerified: Boolean(isEmailVerified),
        createdAt: createdAt || null,
        updatedAt: updatedAt || null,
        lastLoginAt: lastLoginAt || null,
        teamIds,
      };

      if (!state.userIds.includes(id)) state.userIds.push(id);
      if (teamIds.length > 0 && !state.currentTeamId) state.currentTeamId = teamIds[0];
    },

    // Called on logout — wipes all user state
    clearUser: (state) => {
      state.users = {};
      state.userIds = [];
      state.currentUserId = null;
      state.currentTeamId = null;
      state.error = null;
    },

    setCurrentTeamId: (state, action) => {
      const teamId = action.payload;
      const user = state.users[state.currentUserId];
      if (user?.teamIds?.includes(teamId)) state.currentTeamId = teamId;
    },

    addTeamToUser: (state, action) => {
      const teamId = action.payload;
      const user = state.users[state.currentUserId];
      if (!user || user.teamIds.includes(teamId)) return;
      user.teamIds = [...user.teamIds, teamId];
      if (user.teamIds.length === 1) state.currentTeamId = teamId;
    },

    removeTeamFromUser: (state, action) => {
      const teamId = action.payload;
      const user = state.users[state.currentUserId];
      if (!user) return;
      user.teamIds = user.teamIds.filter((id) => id !== teamId);
      if (state.currentTeamId === teamId) state.currentTeamId = user.teamIds[0] ?? null;
    },

    setLoading: (state, action) => { state.loading = Boolean(action.payload); },
    setError:   (state, action) => { state.error = action.payload; },
    clearError: (state)         => { state.error = null; },
  },
});

export const {
  setUser, clearUser,
  setCurrentTeamId,
  addTeamToUser, removeTeamFromUser,
  setLoading, setError, clearError,
} = userSlice.actions;

export default userSlice.reducer;
