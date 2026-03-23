import { Box, AvatarGroup, Avatar, Tooltip, Typography } from '@mui/material';
import { useProjectPresence } from '../../hooks/useProjectPresence';

export default function PresenceIndicator({ projectId }) {
  const { count, users } = useProjectPresence(projectId);

  if (count === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
        {count} viewing
      </Typography>
      <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
        {users.map((userId) => (
          <Tooltip key={userId} title={userId}>
            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', backgroundColor: '#64748b' }}>
              {userId[0].toUpperCase()}
            </Avatar>
          </Tooltip>
        ))}
      </AvatarGroup>
    </Box>
  );
}
