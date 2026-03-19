import { useState } from 'react';
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
import { useAddTeamMemberMutation } from '../../store/slices/apiSlice';

const InviteMemberDialog = ({ isDialogOpen, setIsDialogOpen, teamId, teamName, onInviteSuccess }) => {
    const [addTeamMember] = useAddTeamMemberMutation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userIdentifier, setUserIdentifier] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const normalized = userIdentifier.trim();
        if (!normalized || !teamId) return;

        const isEmail = normalized.includes('@');
        setIsSubmitting(true);
        setError('');

        try {
            await addTeamMember({
                teamId,
                ...(isEmail ? { email: normalized } : { userId: normalized }),
            }).unwrap();

            setUserIdentifier('');
            setIsDialogOpen(false);

            if (onInviteSuccess) {
                onInviteSuccess();
            }
        } catch (err) {
            setError(err?.data?.message || 'Failed to add member');
        } finally {
            setIsSubmitting(false);
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
                    Add a member to <strong>{teamName || 'this team'}</strong>
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        id="member-id"
                        label="User ID or Email"
                        value={userIdentifier}
                        onChange={(e) => {
                            setUserIdentifier(e.target.value);
                            setError('');
                        }}
                        placeholder="e.g. user_2 or john@example.com"
                        required
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Mail className="w-4 h-4" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    {error && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    )}

                    <DialogActions sx={{ px: 0, pt: 3 }}>
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={() => {
                                setIsDialogOpen(false);
                                setUserIdentifier('');
                                setError('');
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
