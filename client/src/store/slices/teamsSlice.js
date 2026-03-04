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

const initialState = {
  teams: dummyTeams, // Array of team objects
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
      state.teams.push(newTeam);
      state.error = null;
    },

    // Join team (add user to team members)
    joinTeam: (state, action) => {
      const { teamId, userId } = action.payload;
      const team = state.teams.find((t) => t.id === teamId);

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
      const team = state.teams.find((t) => t.id === teamId);

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
      const team = state.teams.find((t) => t.id === teamId);

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
      const team = state.teams.find((t) => t.id === teamId);

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
      const team = state.teams.find((t) => t.id === teamId);

      if (!team) {
        state.error = `Team with id ${teamId} not found`;
        return;
      }

      if (name !== undefined) team.name = name;
      if (description !== undefined) team.description = description;
      state.error = null;
    },

    // Delete team
    deleteTeam: (state, action) => {
      const teamId = action.payload;
      const index = state.teams.findIndex((t) => t.id === teamId);

      if (index === -1) {
        state.error = `Team with id ${teamId} not found`;
        return;
      }

      state.teams.splice(index, 1);
      state.error = null;
    },

    // Set all teams
    setTeams: (state, action) => {
      state.teams = action.payload;
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
