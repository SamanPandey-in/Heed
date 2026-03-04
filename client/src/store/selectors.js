/**
 * Redux selectors for user and team state
 */

// ==================== USER SELECTORS ====================

/**
 * Select current user info
 */
export const selectCurrentUser = (state) => ({
  id: state.user.id,
  name: state.user.name,
  email: state.user.email,
});

/**
 * Select user info with all details
 */
export const selectUserInfo = (state) => state.user;

/**
 * Select array of team IDs the user is a member of
 */
export const selectUserTeams = (state) => state.user.teams || [];

/**
 * Select currently selected team ID
 */
export const selectCurrentTeamId = (state) => state.user.currentTeamId;

/**
 * Select full team objects for user's teams
 * Returns array of team objects user is a member of
 */
export const selectUserTeamObjects = (state) => {
  const userTeamIds = state.user.teams || [];
  const allTeams = state.teams.teams || [];
  return allTeams.filter((team) => userTeamIds.includes(team.id));
};

// ==================== TEAM SELECTORS ====================

/**
 * Select all teams
 */
export const selectAllTeams = (state) => state.teams.teams || [];

/**
 * Select team by ID
 */
export const selectTeamById = (state, teamId) => {
  return (state.teams.teams || []).find((team) => team.id === teamId);
};

/**
 * Select currently selected team object
 */
export const selectCurrentTeam = (state) => {
  const currentTeamId = state.user.currentTeamId;
  return (state.teams.teams || []).find((team) => team.id === currentTeamId);
};

/**
 * Select team members array for a specific team
 */
export const selectTeamMembers = (state, teamId) => {
  const team = (state.teams.teams || []).find((t) => t.id === teamId);
  return team ? team.members : [];
};

/**
 * Select current team members
 */
export const selectCurrentTeamMembers = (state) => {
  const currentTeamId = state.user.currentTeamId;
  return selectTeamMembers(state, currentTeamId);
};

/**
 * Select team count
 */
export const selectTeamCount = (state) => {
  return (state.teams.teams || []).length;
};

/**
 * Select user's team count
 */
export const selectUserTeamCount = (state) => {
  return (state.user.teams || []).length;
};

/**
 * Check if user is member of a team
 */
export const selectIsUserInTeam = (state, teamId) => {
  const userTeams = state.user.teams || [];
  return userTeams.includes(teamId);
};

/**
 * Check if user is member of current team
 */
export const selectIsUserInCurrentTeam = (state) => {
  const currentTeamId = state.user.currentTeamId;
  return selectIsUserInTeam(state, currentTeamId);
};

/**
 * Select teams loading state
 */
export const selectTeamsLoading = (state) => state.teams.loading;

/**
 * Select teams error
 */
export const selectTeamsError = (state) => state.teams.error;

/**
 * Select user loading state
 */
export const selectUserLoading = (state) => state.user.loading;

/**
 * Select user error
 */
export const selectUserError = (state) => state.user.error;

/**
 * Select member count for a team
 */
export const selectTeamMemberCount = (state, teamId) => {
  const team = selectTeamById(state, teamId);
  return team ? team.members.length : 0;
};

/**
 * Select current team member count
 */
export const selectCurrentTeamMemberCount = (state) => {
  const currentTeamId = state.user.currentTeamId;
  return selectTeamMemberCount(state, currentTeamId);
};
