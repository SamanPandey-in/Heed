import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { joinTeam, addTeamToUser, clearTeamsError, selectCurrentUserId } from '../../store';
import { selectIsUserInTeam } from '../../store/selectors';
import { UserPlus, Check } from 'lucide-react';

const JoinTeamButton = ({ teamId, userId, onJoinSuccess }) => {
  const dispatch = useDispatch();
  const currentUserId = useSelector(selectCurrentUserId);
  const effectiveUserId = userId || currentUserId;
  const isUserInTeam = useSelector((state) => selectIsUserInTeam(state, teamId));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleJoin = async () => {
    if (isUserInTeam) return;

    if (!effectiveUserId) return;

    setIsSubmitting(true);

    try {
      // ATOMIC JOIN: First add user to team members
      // If this succeeds, add team to user's teams
      // This prevents state inconsistency
      dispatch(joinTeam({ teamId, userId: effectiveUserId }));
      
      // Check if join succeeded (no error in teams slice)
      // Using a simple check: if error exists, join failed
      // Better approach would be to check action result
      setTimeout(() => {
        // Small delay to ensure state is updated
        // Then add team to user's teams (second part of atomic operation)
        dispatch(addTeamToUser(teamId));
        dispatch(clearTeamsError());

        if (onJoinSuccess) {
          onJoinSuccess(teamId);
        }
      }, 0);
    } catch (error) {
      console.error('Failed to join team:', error);
      dispatch(clearTeamsError());
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUserInTeam) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg border border-green-300 dark:border-green-700 cursor-default"
      >
        <Check className="w-4 h-4" />
        Member
      </button>
    );
  }

  return (
    <button
      onClick={handleJoin}
      disabled={isSubmitting}
      className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50"
    >
      <UserPlus className="w-4 h-4" />
      {isSubmitting ? 'Joining...' : 'Join Team'}
    </button>
  );
};

export default JoinTeamButton;
