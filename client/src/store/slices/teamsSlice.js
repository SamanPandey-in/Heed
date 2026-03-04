import { createSlice } from "@reduxjs/toolkit";

// Dummy teams data
const dummyTeams = [
  {
    id: "team_1",
    name: "Product Team",
    description: "Main product development team",
    members: ["user_1", "user_2", "user_3"],
    createdAt: new Date("2024-01-01").toISOString(),
  },
  {
    id: "team_2",
    name: "Design Team",
    description: "UX/UI Design team",
    members: ["user_1", "user_4", "user_5"],
    createdAt: new Date("2024-02-01").toISOString(),
  },
  {
    id: "team_3",
    name: "QA Team",
    description: "Quality Assurance team",
    members: ["user_2", "user_6"],
    createdAt: new Date("2024-03-01").toISOString(),
  },
];

const normalizeTeams = (teams = []) => {
  const entities = {};
  const ids = [];

  teams.forEach((team) => {
    if (!team?.id) return;
    entities[team.id] = {
      ...team,
      members: [...new Set(team.members || [])],
    };
    ids.push(team.id);
  });

  return { entities, ids };
};

const normalizedInitialTeams = normalizeTeams(dummyTeams);

const initialState = {
  teams: normalizedInitialTeams.entities, // Normalized team entities by ID
  teamIds: normalizedInitialTeams.ids, // Ordered team IDs
  loading: false,
  error: null,
};

const teamsSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    // Create a new team
    createTeam: (state, action) => {
      const { id, name, description, createdBy } = action.payload;
      const newTeam = {
        id,
        name,
        description: description || "",
        members: [createdBy], // Creator is automatically a member
        createdAt: new Date().toISOString(),
      };
      state.teams[id] = newTeam;
      if (!state.teamIds.includes(id)) {
        state.teamIds.push(id);
      }
      state.error = null;
    },

    // Join team (add user to team members)
    // ⚠️  IMPORTANT: This only updates teamsSlice.teams[].members
    // If user joins, must also call addTeamToUser to add team to user.teams
    // Use joinTeamAtomic thunk from store/thunks.js to ensure consistency
    joinTeam: (state, action) => {
      const { teamId, userId } = action.payload;
      const team = state.teams[teamId];

      if (!team) {
        state.error = `Team with id ${teamId} not found`;
        return;
      }

      // Prevent duplicate joins
      if (team.members.includes(userId)) {
        state.error = `User ${userId} is already a member of this team`;
        return;
      }

      team.members.push(userId);
      state.error = null;
    },

    // Leave team (remove user from team members)
    leaveTeam: (state, action) => {
      const { teamId, userId } = action.payload;
      const team = state.teams[teamId];

      if (!team) {
        state.error = `Team with id ${teamId} not found`;
        return;
      }

      // Don't allow leaving if it's the last member (team owner)
      if (team.members.length === 1 && team.members[0] === userId) {
        state.error = "Cannot leave team as the last member. Delete team instead.";
        return;
      }

      team.members = team.members.filter((id) => id !== userId);
      state.error = null;
    },

    // Add team member (by admin/owner)
    addTeamMember: (state, action) => {
      const { teamId, userId } = action.payload;
      const team = state.teams[teamId];

      if (!team) {
        state.error = `Team with id ${teamId} not found`;
        return;
      }

      if (team.members.includes(userId)) {
        state.error = `User ${userId} is already a member`;
        return;
      }

      team.members.push(userId);
      state.error = null;
    },

    // Remove team member (by admin/owner)
    removeTeamMember: (state, action) => {
      const { teamId, userId } = action.payload;
      const team = state.teams[teamId];

      if (!team) {
        state.error = `Team with id ${teamId} not found`;
        return;
      }

      // Prevent removing last member
      if (team.members.length === 1 && team.members[0] === userId) {
        state.error = "Cannot remove the last member from team";
        return;
      }

      team.members = team.members.filter((id) => id !== userId);
      state.error = null;
    },

    // Update team info
    updateTeam: (state, action) => {
      const { teamId, name, description } = action.payload;
      const team = state.teams[teamId];

      if (!team) {
        state.error = `Team with id ${teamId} not found`;
        return;
      }

      if (name !== undefined) team.name = name;
      if (description !== undefined) team.description = description;
      state.error = null;
    },

    // Delete team
    // ⚠️  IMPORTANT: This only removes from teamsSlice
    // If user has this team in user.teams, must also call removeTeamFromUser
    // Use deleteTeamAtomic thunk from store/thunks.js to ensure consistency
    // See: store/thunks.js for proper implementation
    deleteTeam: (state, action) => {
      const teamId = action.payload;
      if (!state.teams[teamId]) {
        state.error = `Team with id ${teamId} not found`;
        return;
      }

      delete state.teams[teamId];
      state.teamIds = state.teamIds.filter((id) => id !== teamId);
      state.error = null;
    },

    // Set all teams
    setTeams: (state, action) => {
      const normalized = normalizeTeams(action.payload || []);
      state.teams = normalized.entities;
      state.teamIds = normalized.ids;
      state.error = null;
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
  createTeam,
  joinTeam,
  leaveTeam,
  addTeamMember,
  removeTeamMember,
  updateTeam,
  deleteTeam,
  setTeams,
  setLoading,
  setError,
  clearError,
} = teamsSlice.actions;

export default teamsSlice.reducer;
