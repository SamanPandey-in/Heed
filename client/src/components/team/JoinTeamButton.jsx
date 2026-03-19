import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@mui/material';
import { selectIsUserInTeam } from '../../store/selectors';
import { useJoinTeamByInviteCodeMutation } from '../../store/slices/apiSlice';
import { UserPlus, Check } from 'lucide-react';

const JoinTeamButton = ({ inviteCode, onJoinSuccess }) => {
  const [joinTeamByInviteCode] = useJoinTeamByInviteCodeMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!inviteCode) return;

    setIsSubmitting(true);
    setError('');

    try {
      const result = await joinTeamByInviteCode(inviteCode).unwrap();

      if (onJoinSuccess) {
        onJoinSuccess(result.team);
      }
    } catch (err) {
      setError(err?.data?.message || 'Failed to join team');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      onClick={handleJoin}
      disabled={isSubmitting || !inviteCode}
      variant="contained"
      startIcon={<UserPlus className="w-4 h-4" />}
    >
      {isSubmitting ? 'Joining...' : 'Join Team'}
    </Button>
  );
};

export default JoinTeamButton;
