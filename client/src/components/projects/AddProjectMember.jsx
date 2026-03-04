import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
import { dummyUsers } from '../../assets/assets';
import { selectAllProjects, selectAllTeams } from '../../store';

const AddProjectMember = ({ isDialogOpen, setIsDialogOpen, projectId: projectIdProp }) => {

    const [searchParams] = useSearchParams();
    const { projectId: projectIdFromParams } = useParams();

    const id = projectIdProp || projectIdFromParams || searchParams.get('id');

    const projects = useSelector(selectAllProjects);
    const teams = useSelector(selectAllTeams);

    const project = projects.find((p) => p.id === id);
    const team = teams.find((entry) => entry.id === project?.teamId);
    const projectMemberIds = Array.isArray(project?.members)
        ? project.members.map((member) => member?.user?.id || member?.userId).filter(Boolean)
        : (project?.memberIds || []);
    const availableMembers = (team?.members || [])
        .filter((memberId) => !projectMemberIds.includes(memberId))
        .map((memberId) => {
            const profile = dummyUsers.find((user) => user.id === memberId);
            return {
                id: memberId,
                label: profile?.email || profile?.name || memberId,
            };
        });

    const [memberId, setMemberId] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        
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
                        onChange={(e) => setMemberId(e.target.value)}
                        required
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

                    <DialogActions sx={{ px: 0, pt: 3 }}>
                        <Button type="button" variant="outlined" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={!project}>
                            Add Member
                        </Button>
                    </DialogActions>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default AddProjectMember;
