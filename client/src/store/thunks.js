/**
 * Redux Thunks for multi-slice coordination
 */

import {
  addTeamMember,
  addTeamProject,
  deleteTeam,
  joinTeam,
  removeTeamProject,
  setError as setTeamsError,
} from "./slices/teamsSlice";
import { addTeamToUser, removeTeamFromUser, setCurrentTeamId } from "./slices/userSlice";
import { addProject, deleteProject, updateProject } from "./slices/projectsSlice";

export const deleteTeamAtomic = (teamId) => (dispatch, getState) => {
  const state = getState();
  const currentUser = state.users?.users?.[state.users?.currentUserId];
  const currentUserTeamIds = currentUser?.teamIds || [];

  dispatch(deleteTeam(teamId));

  if (getState().teams?.error) return false;

  if (currentUserTeamIds.includes(teamId)) {
    dispatch(removeTeamFromUser(teamId));

    const nextState = getState();
    const remainingTeamIds =
      nextState.users?.users?.[nextState.users?.currentUserId]?.teamIds || [];

    if (remainingTeamIds.length > 0) {
      dispatch(setCurrentTeamId(remainingTeamIds[0]));
    }
  }

  return true;
};

export const joinTeamAtomic = ({ teamId, userId }) => (dispatch, getState) => {
  if (!teamId || !userId) return false;

  dispatch(joinTeam({ teamId, userId }));

  if (getState().teams?.error) {
    return false;
  }

  dispatch(addTeamToUser(teamId));
  return true;
};

export const joinTeamByIdentifierAtomic = ({ identifier, userId }) => (dispatch, getState) => {
  const normalizedIdentifier = String(identifier || "").trim();

  if (!normalizedIdentifier || !userId) {
    dispatch(setTeamsError("Team ID or invite code is required"));
    return false;
  }

  const state = getState();
  const teams = Object.values(state.teams?.teams || {});

  const matchedTeam =
    teams.find((team) => team.id === normalizedIdentifier) ||
    teams.find(
      (team) =>
        String(team?.inviteCode || "").trim().toLowerCase() === normalizedIdentifier.toLowerCase()
    );

  if (!matchedTeam) {
    dispatch(setTeamsError("Team not found for the provided ID/invite code"));
    return false;
  }

  return dispatch(joinTeamAtomic({ teamId: matchedTeam.id, userId }));
};

export const inviteMemberAtomic = ({ teamId, userId }) => (dispatch, getState) => {
  if (!teamId || !userId) {
    dispatch(setTeamsError("Team ID and user ID are required"));
    return false;
  }

  dispatch(addTeamMember({ teamId, userId }));

  if (getState().teams?.error) {
    return false;
  }

  const state = getState();
  if (state.users?.currentUserId === userId) {
    dispatch(addTeamToUser(teamId));
  }

  return true;
};

export const createProjectAtomic = (projectPayload = {}) => (dispatch, getState) => {
  const state = getState();
  const currentUserId = state.users?.currentUserId;
  const teams = state.teams?.teams || {};
  const memberTeamIds = Object.values(teams)
    .filter((team) => currentUserId && (team.members || []).includes(currentUserId))
    .map((team) => team.id);

  const teamId = projectPayload.teamId;

  if (!teamId) {
    dispatch(setTeamsError("Project must belong to a team"));
    return { ok: false, error: "Project must belong to a team" };
  }

  if (!teams[teamId]) {
    dispatch(setTeamsError(`Team with id ${teamId} does not exist`));
    return { ok: false, error: `Team with id ${teamId} does not exist` };
  }

  if (!memberTeamIds.includes(teamId)) {
    dispatch(setTeamsError("You can only create projects for teams you are a member of"));
    return { ok: false, error: "You can only create projects for teams you are a member of" };
  }

  const projectId = projectPayload.id || `project_${Date.now()}`;

  dispatch(
    addProject({
      ...projectPayload,
      id: projectId,
      teamId,
      validTeamIds: memberTeamIds,
    })
  );

  const projectError = getState().projects?.error;
  if (projectError) {
    return { ok: false, error: projectError };
  }

  dispatch(addTeamProject({ teamId, projectId }));

  return { ok: true, projectId };
};

export const updateProjectAtomic = (projectPayload = {}) => (dispatch, getState) => {
  const { id: projectId, teamId: nextTeamId } = projectPayload;
  if (!projectId) {
    return { ok: false, error: "Project id is required" };
  }

  const state = getState();
  const existingProject = state.projects?.projects?.[projectId];
  if (!existingProject) {
    return { ok: false, error: `Project with id ${projectId} not found` };
  }

  if (nextTeamId && !state.teams?.teams?.[nextTeamId]) {
    dispatch(setTeamsError(`Team with id ${nextTeamId} does not exist`));
    return { ok: false, error: `Team with id ${nextTeamId} does not exist` };
  }

  if (nextTeamId) {
    const currentUserId = state.users?.currentUserId;
    const targetTeamMembers = state.teams?.teams?.[nextTeamId]?.members || [];
    if (currentUserId && !targetTeamMembers.includes(currentUserId)) {
      return { ok: false, error: "You can only move a project to a team you belong to" };
    }
  }

  dispatch(updateProject(projectPayload));

  const projectError = getState().projects?.error;
  if (projectError) {
    return { ok: false, error: projectError };
  }

  const resolvedTeamId = nextTeamId || existingProject.teamId;
  if (resolvedTeamId) {
    dispatch(addTeamProject({ teamId: resolvedTeamId, projectId }));
  }

  return { ok: true, projectId };
};

export const deleteProjectAtomic = (projectId) => (dispatch, getState) => {
  const state = getState();
  const project = state.projects?.projects?.[projectId];

  if (!project) {
    return { ok: false, error: `Project with id ${projectId} not found` };
  }

  dispatch(deleteProject(projectId));

  const projectError = getState().projects?.error;
  if (projectError) {
    return { ok: false, error: projectError };
  }

  dispatch(removeTeamProject({ teamId: project.teamId, projectId }));
  return { ok: true };
};
