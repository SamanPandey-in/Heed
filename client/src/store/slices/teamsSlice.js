import { createSlice } from "@reduxjs/toolkit";
import { dummyProjects } from "../../assets/assets";
import { addProject, deleteProject, setProjects, updateProject } from "./projectsSlice";

const generateInviteCode = (seed = "team") => `${String(seed).toUpperCase()}-${Date.now()}`;

const dummyTeams = [
  {
    id: "team_1",
    name: "Product Team",
    description: "Main product development team",
    members: ["user_1", "user_2", "user_3"],
    projectIds: [],
    inviteCode: "TEAM1-INVITE",
    createdAt: new Date("2024-01-01").toISOString(),
  },
  {
    id: "team_2",
    name: "Design Team",
    description: "UX/UI Design team",
    members: ["user_1", "user_4", "user_5"],
    projectIds: [],
    inviteCode: "TEAM2-INVITE",
    createdAt: new Date("2024-02-01").toISOString(),
  },
  {
    id: "team_3",
    name: "QA Team",
    description: "Quality Assurance team",
    members: ["user_2", "user_6"],
    projectIds: [],
    inviteCode: "TEAM3-INVITE",
    createdAt: new Date("2024-03-01").toISOString(),
  },
];

const normalizeTeam = (team = {}) => ({
  id: team.id,
  name: String(team.name || "").trim(),
  description: team.description || "",
  members: [...new Set((team.members || []).filter(Boolean))],
  projectIds: [...new Set((team.projectIds || []).filter(Boolean))],
  inviteCode: String(team.inviteCode || generateInviteCode(team.id || "team")).trim(),
  createdAt: team.createdAt || new Date().toISOString(),
});

const normalizeTeams = (teams = []) => {
  const entities = {};
  const ids = [];

  teams.forEach((team) => {
    if (!team?.id) return;

    entities[team.id] = normalizeTeam(team);
    ids.push(team.id);
  });

  return { entities, ids };
};

const linkProjectsToTeams = (teamsById = {}, teamIds = [], projects = []) => {
  const nextTeams = Object.fromEntries(
    Object.entries(teamsById).map(([teamId, team]) => [teamId, { ...team, projectIds: [] }])
  );

  projects.forEach((project, index) => {
    if (!project?.id) return;

    const fallbackTeamId = teamIds.length > 0 ? teamIds[index % teamIds.length] : null;
    const projectTeamId = project.teamId && nextTeams[project.teamId] ? project.teamId : fallbackTeamId;

    if (!projectTeamId || !nextTeams[projectTeamId]) return;

    if (!nextTeams[projectTeamId].projectIds.includes(project.id)) {
      nextTeams[projectTeamId].projectIds.push(project.id);
    }
  });

  return nextTeams;
};

const normalizedInitialTeams = normalizeTeams(dummyTeams);

const initialState = {
  teams: linkProjectsToTeams(
    normalizedInitialTeams.entities,
    normalizedInitialTeams.ids,
    dummyProjects || []
  ),
  teamIds: normalizedInitialTeams.ids,
  loading: false,
  error: null,
};

const removeProjectFromAllTeams = (state, projectId) => {
  state.teamIds.forEach((teamId) => {
    const team = state.teams[teamId];
    if (!team) return;
    team.projectIds = team.projectIds.filter((id) => id !== projectId);
  });
};

const teamsSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    createTeam: (state, action) => {
      const { id, name, description, createdBy, inviteCode } = action.payload || {};

      if (!id) {
        state.error = "Team id is required";
        return;
      }

      if (!name?.trim()) {
        state.error = "Team name is required";
        return;
      }

      if (!createdBy) {
        state.error = "Team creator is required";
        return;
      }

      if (state.teams[id]) {
        state.error = `Team with id ${id} already exists`;
        return;
      }

      state.teams[id] = normalizeTeam({
        id,
        name: name.trim(),
        description: description || "",
        members: [createdBy],
        projectIds: [],
        inviteCode: inviteCode || generateInviteCode(id),
        createdAt: new Date().toISOString(),
      });

      state.teamIds.push(id);
      state.error = null;
    },

    joinTeam: (state, action) => {
      const { teamId, userId } = action.payload || {};
      const team = state.teams[teamId];

      if (!team) {
        state.error = `Team with id ${teamId} not found`;
        return;
      }

      if (!userId) {
        state.error = "User id is required";
        return;
      }

      if (team.members.includes(userId)) {
        state.error = `User ${userId} is already a member of this team`;
        return;
      }

      team.members.push(userId);
      state.error = null;
    },

    leaveTeam: (state, action) => {
      const { teamId, userId } = action.payload || {};
      const team = state.teams[teamId];

      if (!team) {
        state.error = `Team with id ${teamId} not found`;
        return;
      }

      if (team.members.length === 1 && team.members[0] === userId) {
        state.error = "Cannot leave team as the last member. Delete team instead.";
        return;
      }

      team.members = team.members.filter((id) => id !== userId);
      state.error = null;
    },

    addTeamMember: (state, action) => {
      const { teamId, userId } = action.payload || {};
      const team = state.teams[teamId];

      if (!team) {
        state.error = `Team with id ${teamId} not found`;
        return;
      }

      if (!userId) {
        state.error = "User id is required";
        return;
      }

      if (team.members.includes(userId)) {
        state.error = `User ${userId} is already a member`;
        return;
      }

      team.members.push(userId);
      state.error = null;
    },

    removeTeamMember: (state, action) => {
      const { teamId, userId } = action.payload || {};
      const team = state.teams[teamId];

      if (!team) {
        state.error = `Team with id ${teamId} not found`;
        return;
      }

      if (team.members.length === 1 && team.members[0] === userId) {
        state.error = "Cannot remove the last member from team";
        return;
      }

      team.members = team.members.filter((id) => id !== userId);
      state.error = null;
    },

    addTeamProject: (state, action) => {
      const { teamId, projectId } = action.payload || {};
      const team = state.teams[teamId];

      if (!team) {
        state.error = `Team with id ${teamId} not found`;
        return;
      }

      if (!projectId) {
        state.error = "Project id is required";
        return;
      }

      removeProjectFromAllTeams(state, projectId);
      if (!team.projectIds.includes(projectId)) {
        team.projectIds.push(projectId);
      }

      state.error = null;
    },

    removeTeamProject: (state, action) => {
      const { teamId, projectId } = action.payload || {};

      if (!projectId) {
        state.error = "Project id is required";
        return;
      }

      if (teamId && state.teams[teamId]) {
        state.teams[teamId].projectIds = state.teams[teamId].projectIds.filter(
          (id) => id !== projectId
        );
      } else {
        removeProjectFromAllTeams(state, projectId);
      }

      state.error = null;
    },

    updateTeam: (state, action) => {
      const { teamId, name, description, inviteCode } = action.payload || {};
      const team = state.teams[teamId];

      if (!team) {
        state.error = `Team with id ${teamId} not found`;
        return;
      }

      if (name !== undefined) team.name = String(name).trim();
      if (description !== undefined) team.description = description;
      if (inviteCode !== undefined) team.inviteCode = String(inviteCode).trim();
      state.error = null;
    },

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

    setTeams: (state, action) => {
      const normalized = normalizeTeams(action.payload || []);
      state.teams = normalized.entities;
      state.teamIds = normalized.ids;
      state.error = null;
    },

    setLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },

    setError: (state, action) => {
      state.error = action.payload || null;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setProjects, (state, action) => {
      const incomingProjects = action.payload || [];

      state.teamIds.forEach((teamId) => {
        if (!state.teams[teamId]) return;
        state.teams[teamId].projectIds = [];
      });

      incomingProjects.forEach((project, index) => {
        if (!project?.id) return;

        const fallbackTeamId = state.teamIds.length > 0 ? state.teamIds[index % state.teamIds.length] : null;
        const teamId = project.teamId && state.teams[project.teamId] ? project.teamId : fallbackTeamId;

        if (!teamId || !state.teams[teamId]) return;
        if (!state.teams[teamId].projectIds.includes(project.id)) {
          state.teams[teamId].projectIds.push(project.id);
        }
      });
    });

    builder.addCase(addProject, (state, action) => {
      const { id, teamId, name } = action.payload || {};

      if (!id || !teamId || !name?.trim()) return;
      if (!state.teams[teamId]) return;

      const alreadyTracked = state.teamIds.some((currentTeamId) =>
        state.teams[currentTeamId]?.projectIds?.includes(id)
      );
      if (alreadyTracked) return;

      state.teams[teamId].projectIds.push(id);
    });

    builder.addCase(updateProject, (state, action) => {
      const { id, teamId } = action.payload || {};

      if (!id || !teamId || !state.teams[teamId]) return;

      const isTracked = state.teamIds.some((currentTeamId) =>
        state.teams[currentTeamId]?.projectIds?.includes(id)
      );
      if (!isTracked) return;

      removeProjectFromAllTeams(state, id);
      if (!state.teams[teamId].projectIds.includes(id)) {
        state.teams[teamId].projectIds.push(id);
      }
    });

    builder.addCase(deleteProject, (state, action) => {
      const projectId = action.payload;
      if (!projectId) return;

      removeProjectFromAllTeams(state, projectId);
    });
  },
});

export const {
  createTeam,
  joinTeam,
  leaveTeam,
  addTeamMember,
  removeTeamMember,
  addTeamProject,
  removeTeamProject,
  updateTeam,
  deleteTeam,
  setTeams,
  setLoading,
  setError,
  clearError,
} = teamsSlice.actions;

export default teamsSlice.reducer;
