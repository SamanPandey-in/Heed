import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material';
import { Mail, UserPlus } from 'lucide-react';
import { useAddProjectMemberMutation, useGetProjectByIdQuery, useGetTeamByIdQuery } from '../../store/slices/apiSlice';

const AddProjectMember = ({ isDialogOpen, setIsDialogOpen, projectId: projectIdProp }) => {
    const [searchParams] = useSearchParams();
    const { projectId: projectIdFromParams } = useParams();

    const id = projectIdProp || projectIdFromParams || searchParams.get('id');
    const { data: projectData } = useGetProjectByIdQuery(id, { skip: !id });
    const project = projectData?.project;

    // Fetch the team so we know all possible members to add
    const { data: teamData } = useGetTeamByIdQuery(project?.teamId, { skip: !project?.teamId });

    const [addProjectMember] = useAddProjectMemberMutation();

    // Team members minus people already in the project
    const projectMemberIds = project?.memberIds || [];
    const teamMembers = teamData?.team?.members || [];
    const availableMembers = teamMembers
        .filter((member) => !projectMemberIds.includes(member.id))
        .map((member) => ({
            id: member.id,
            label: member.fullName || member.username || member.email,
        }));

    const [memberId, setMemberId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!memberId || !id) return;

        setIsSubmitting(true);
        setError('');

        try {
            await addProjectMember({ projectId: id, userId: memberId }).unwrap();
            setIsDialogOpen(false);
            setMemberId('');
        } catch (err) {
            setError(err?.data?.message || 'Failed to add member');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <UserPlus className="size-5" /> Add Member to Project
            </DialogTitle>
            <DialogContent>
                {project && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Adding to Project: <strong>{project.name}</strong>
                    </Typography>
                )}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
<TextField
                        select
                        label="Member"
                        value={memberId}
                        onChange={(e) => {
                            setMemberId(e.target.value);
                            setError('');
                        }}
                        required
                        fullWidth
                        sx={{ mt: 1 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Mail className="w-4 h-4" />
                                </InputAdornment>
                            ),
                        }}
                    >
                        <MenuItem value="">Select a member</MenuItem>
                        {availableMembers.map((member) => (
                            <MenuItem key={member.id} value={member.id}>
                                {member.label}
                            </MenuItem>
                        ))}
                    </TextField>

                    {error && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    )}

                    <DialogActions sx={{ px: 0, pt: 3 }}>
                        <Button type="button" variant="outlined" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={isSubmitting || !memberId}>
                            {isSubmitting ? 'Adding...' : 'Add Member'}
                        </Button>
                    </DialogActions>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default AddProjectMember;
