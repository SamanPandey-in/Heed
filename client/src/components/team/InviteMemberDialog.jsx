import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    TextField,
    Typography,
} from '@mui/material';
import { Mail, UserPlus } from 'lucide-react';

import { dummyUsers } from '../../assets/assets';
import {
    clearTeamsError,
    inviteMemberAtomic,
    selectTeamById,
    selectTeamsError,
} from '../../store';

const InviteMemberDialog = ({ isDialogOpen, setIsDialogOpen, teamId, onInviteSuccess }) => {
    const dispatch = useDispatch();
    const team = useSelector((state) => selectTeamById(state, teamId));
    const teamsError = useSelector(selectTeamsError);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userIdentifier, setUserIdentifier] = useState('');

    const suggestedUsers = useMemo(() => {
        const memberSet = new Set(team?.members || []);
        return dummyUsers.filter((user) => !memberSet.has(user.id));
    }, [team?.members]);

    const resolveUserId = (value) => {
        const normalized = String(value || '').trim();
        if (!normalized) return '';

        const knownUser = dummyUsers.find(
            (user) =>
                user.id.toLowerCase() === normalized.toLowerCase() ||
                user.email.toLowerCase() === normalized.toLowerCase()
        );

        return knownUser?.id || normalized;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const resolvedUserId = resolveUserId(userIdentifier);
        if (!resolvedUserId || !teamId) return;

        setIsSubmitting(true);

        const success = dispatch(inviteMemberAtomic({ teamId, userId: resolvedUserId }));

        setIsSubmitting(false);

        if (success) {
            setUserIdentifier('');
            dispatch(clearTeamsError());
            setIsDialogOpen(false);

            if (onInviteSuccess) {
                onInviteSuccess(resolvedUserId);
            }
        }
    };

    return (
        <Dialog
            open={isDialogOpen}
            onClose={() => {
                setIsDialogOpen(false);
                setUserIdentifier('');
                dispatch(clearTeamsError());
            }}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <UserPlus className="size-5" />
                Add Team Member
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ mb: 2 }}>
                    Add a member to <strong>{team?.name || 'this team'}</strong>
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        id="member-id"
                        list="team-invite-suggestions"
                        label="User ID or Email"
                        value={userIdentifier}
                        onChange={(e) => setUserIdentifier(e.target.value)}
                        placeholder="e.g. user_2 or john@example.com"
                        required
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Mail className="w-4 h-4" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <datalist id="team-invite-suggestions">
                        {suggestedUsers.map((user) => (
                            <option key={user.id} value={user.id} label={`${user.name} (${user.email})`} />
                        ))}
                    </datalist>

                    {teamsError && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                            {teamsError}
                        </Typography>
                    )}

                    <DialogActions sx={{ px: 0, pt: 3 }}>
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={() => {
                                setIsDialogOpen(false);
                                setUserIdentifier('');
                                dispatch(clearTeamsError());
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting || !teamId || !userIdentifier.trim()}
                        >
                            {isSubmitting ? 'Adding...' : 'Add Member'}
                        </Button>
                    </DialogActions>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default InviteMemberDialog;
