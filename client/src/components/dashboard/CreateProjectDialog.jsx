import { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material';
import { XIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createProject, selectAllTeams, selectProjectsLoading, selectProjectsError } from '../../store';

const CreateProjectDialog = ({ isDialogOpen, setIsDialogOpen }) => {
    const dispatch = useDispatch();
    const userTeams = useSelector(selectAllTeams);
    const isSubmitting = useSelector(selectProjectsLoading);
    const serverError = useSelector(selectProjectsError);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        teamId: "",
        status: "ACTIVE",
    });

    const [localError, setLocalError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError("");

        if (userTeams.length === 0) {
            setLocalError("You must join a team before creating a project");
            return;
        }

        if (!formData.teamId) {
            setLocalError("Please select a valid team");
            return;
        }

        try {
            await dispatch(createProject({
                name: formData.name,
                description: formData.description,
                teamId: formData.teamId,
                status: formData.status,
            })).unwrap();

            setIsDialogOpen(false);
            setFormData({
                name: "",
                description: "",
                teamId: "",
                status: "ACTIVE",
            });
        } catch (err) {
            // Error handled by Redux state
        }
    };

    return (
        <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} fullWidth maxWidth="md">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Create New Project
                <IconButton size="small" onClick={() => setIsDialogOpen(false)}>
                    <XIcon className="size-5" />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Add a new project to your team
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
                    <TextField
                        select
                        label="Team *"
                        value={formData.teamId}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                teamId: e.target.value,
                                team_members: [],
                                team_lead: "",
                            })
                        }
                        required
                    >
                        <MenuItem value="">Select a team</MenuItem>
                        {userTeams.map((team) => (
                            <MenuItem key={team.id} value={team.id}>
                                {team.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    {userTeams.length === 0 && (
                        <Typography variant="caption" color="warning.main">
                            You must be a member of a team to create a project
                        </Typography>
                    )}

                    <TextField
                        label="Project Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter project name"
                        required
                    />

                    <TextField
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your project"
                        multiline
                        rows={3}
                    />

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
<TextField
                        select
                        label="Status"
                        value={formData.status}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                status: e.target.value,
                            }))
                        }
                    >
                        <MenuItem value="ACTIVE">Active</MenuItem>
                        <MenuItem value="COMPLETED">Completed</MenuItem>
                        <MenuItem value="DEPRECATED">Deprecated</MenuItem>
                    </TextField>
                    </Box>

                    {localError && (
                        <Typography variant="body2" color="error">
                            {localError}
                        </Typography>
                    )}
                    {serverError && (
                        <Typography variant="body2" color="error">
                            {serverError}
                        </Typography>
                    )}
                    <DialogActions sx={{ px: 0 }}>
                        <Button type="button" variant="outlined" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={isSubmitting || userTeams.length === 0}>
                            {isSubmitting ? "Creating..." : "Create Project"}
                        </Button>
                    </DialogActions>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default CreateProjectDialog;
