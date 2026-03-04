import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearTeamsError, joinTeamAtomic, selectCurrentUserId } from '../../store';
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
      const success = dispatch(joinTeamAtomic({ teamId, userId: effectiveUserId }));
      if (success) {
        dispatch(clearTeamsError());

        if (onJoinSuccess) {
          onJoinSuccess(teamId);
        }
      }
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
