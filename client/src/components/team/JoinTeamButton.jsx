import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@mui/material';
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
      <Button
        disabled
        variant="outlined"
        color="success"
        startIcon={<Check className="w-4 h-4" />}
      >
        Member
      </Button>
    );
  }

  return (
    <Button
      onClick={handleJoin}
      disabled={isSubmitting}
      variant="contained"
      startIcon={<UserPlus className="w-4 h-4" />}
    >
      {isSubmitting ? 'Joining...' : 'Join Team'}
    </Button>
  );
};

export default JoinTeamButton;
