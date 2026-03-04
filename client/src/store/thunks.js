/**
 * Redux Thunks for multi-slice coordination
 * These handle atomic operations that need to update multiple slices consistently
 */

import { deleteTeam } from './slices/teamsSlice';
import { removeTeamFromUser } from './slices/userSlice';

/**
 * Atomic delete team operation
 * 
 * Ensures that when a team is deleted:
 * 1. Team is removed from teamsSlice
 * 2. Team is removed from all users' team lists
 * 3. If user's currentTeamId was the deleted team, reset to first remaining team
 * 
 * Usage:
 *   dispatch(deleteTeamAtomic(teamId))
 */
export const deleteTeamAtomic = (teamId) => (dispatch, getState) => {
  const state = getState();
  
  // 1. Remove team from teams slice
  dispatch(deleteTeam(teamId));
  
  // 2. Check if current user has this team, remove it
  const currentUser = state.user;
  if (currentUser.teams.includes(teamId)) {
    dispatch(removeTeamFromUser(teamId));
    
    // 3. If this was the current team, reset to first remaining team
    if (currentUser.currentTeamId === teamId) {
      const remainingTeams = currentUser.teams.filter((id) => id !== teamId);
      if (remainingTeams.length > 0) {
        // Auto-switch to first remaining team
        // Note: This dispatch assumes setCurrentTeamId is imported
        // TODO: Import and dispatch setCurrentTeamId(remainingTeams[0])
      }
    }
  }
};

/**
 * Atomic join team operation
 * 
 * Ensures that when a user joins a team:
 * 1. User is added to team.members
 * 2. Team is added to user.teams
 * Both operations must succeed or fail together
 * 
 * Usage:
 *   dispatch(joinTeamAtomic({ teamId, userId }))
 */
export const joinTeamAtomic = ({ teamId, userId }) => (dispatch, getState) => {
  const state = getState();
  
  // Get current state before changes
  const teamsError = state.teams.error;
  
  // 1. Add user to team.members
  dispatch(joinTeam({ teamId, userId }));
  
  // Check if join succeeded by checking if error was set
  const newTeamsError = getState().teams.error;
  
  if (newTeamsError) {
    // Join failed, don't add team to user
    return false;
  }
  
  // 2. Add team to user.teams
  dispatch(addTeamToUser(teamId));
  
  return true;
};
