import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Button,
    Chip,
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
import { dummyUsers } from '../../assets/assets';
import { createProjectAtomic, selectCurrentTeamId, selectUserTeamObjects } from '../../store';

const CreateProjectDialog = ({ isDialogOpen, setIsDialogOpen }) => {

    const dispatch = useDispatch();

    // Get user's teams
    const userTeams = useSelector(selectUserTeamObjects);
    const currentTeamId = useSelector(selectCurrentTeamId);
    const projectsError = useSelector((state) => state.projects.error);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        teamId: currentTeamId || "",
        status: "active",
        priority: "MEDIUM",
        start_date: "",
        end_date: "",
        team_members: [],
        team_lead: "",
        progress: 0,
        result: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const selectedTeam = useMemo(
        () => userTeams.find((team) => team.id === formData.teamId),
        [formData.teamId, userTeams]
    );

    const teamUserOptions = useMemo(() => {
        const teamMemberIds = selectedTeam?.members || [];
        return teamMemberIds.map((id) => {
            const profile = dummyUsers.find((user) => user.id === id);
            return {
                id,
                name: profile?.name || id,
            };
        });
    }, [selectedTeam]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");

        if (userTeams.length === 0) {
            setSubmitError("You must join a team before creating a project");
            return;
        }

        const validTeamIds = userTeams.map((team) => team.id);
        if (!validTeamIds.includes(formData.teamId)) {
            setSubmitError("Please select a valid team");
            return;
        }

        setIsSubmitting(true);
        const now = new Date().toISOString();
        const memberIds = [...new Set(
            formData.team_lead
                ? [...formData.team_members, formData.team_lead]
                : formData.team_members
        )];

        const actionResult = dispatch(
            createProjectAtomic({
                id: `project_${Date.now()}`,
                name: formData.name,
                description: formData.description,
                teamId: formData.teamId,
                status: formData.status,
                priority: formData.priority,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
                team_lead: formData.team_lead || null,
                memberIds,
                progress: formData.progress || 0,
                result: formData.status === "completed" ? (formData.result || null) : null,
                tasks: [],
                createdAt: now,
                updatedAt: now,
                validTeamIds,
            })
        );

        setIsSubmitting(false);
        if (!actionResult?.ok) {
            setSubmitError(actionResult?.error || "Failed to create project");
            return;
        }

        setIsDialogOpen(false);
        setFormData({
            name: "",
            description: "",
            teamId: currentTeamId || "",
            status: "active",
            priority: "MEDIUM",
            start_date: "",
            end_date: "",
            team_members: [],
            team_lead: "",
            progress: 0,
            result: "",
        });
    };

    const removeTeamMember = (email) => {
        setFormData((prev) => ({ ...prev, team_members: prev.team_members.filter(m => m !== email) }));
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
                                    result: e.target.value === "completed" ? prev.result : "",
                                }))
                            }
                        >
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="deprecated">Deprecated</MenuItem>
                        </TextField>
                        <TextField
                            select
                            label="Priority"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        >
                            <MenuItem value="LOW">Low</MenuItem>
                            <MenuItem value="MEDIUM">Medium</MenuItem>
                            <MenuItem value="HIGH">High</MenuItem>
                        </TextField>
                    </Box>

                    {formData.status === "completed" && (
                        <TextField
                            select
                            label="Result"
                            value={formData.result}
                            onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                        >
                            <MenuItem value="">Not Set</MenuItem>
                            <MenuItem value="success">Success</MenuItem>
                            <MenuItem value="failed">Failed</MenuItem>
                            <MenuItem value="ongoing">Ongoing</MenuItem>
                        </TextField>
                    )}

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        <TextField
                            type="date"
                            label="Start Date"
                            value={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            type="date"
                            label="End Date"
                            value={formData.end_date}
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{
                                min: formData.start_date && new Date(formData.start_date).toISOString().split('T')[0],
                            }}
                        />
                    </Box>

                    <TextField
                        select
                        label="Project Lead"
                        value={formData.team_lead}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                team_lead: e.target.value,
                                team_members: e.target.value
                                    ? [...new Set([...formData.team_members, e.target.value])]
                                    : formData.team_members,
                            })
                        }
                    >
                        <MenuItem value="">No lead</MenuItem>
                        {teamUserOptions.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                                {user.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Team Members"
                        value=""
                        onChange={(e) => {
                            if (e.target.value && !formData.team_members.includes(e.target.value)) {
                                setFormData((prev) => ({ ...prev, team_members: [...prev.team_members, e.target.value] }));
                            }
                        }}
                    >
                        <MenuItem value="">Add team members</MenuItem>
                        {teamUserOptions
                            ?.filter((user) => !formData.team_members.includes(user.id))
                            .map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.name}
                                </MenuItem>
                            ))}
                    </TextField>

                    {formData.team_members.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {formData.team_members.map((memberId) => (
                                <Chip
                                    key={memberId}
                                    label={memberId}
                                    onDelete={() => removeTeamMember(memberId)}
                                    deleteIcon={<XIcon className="w-3 h-3" />}
                                />
                            ))}
                        </Box>
                    )}

                    {(submitError || projectsError) && (
                        <Typography variant="body2" color="error">
                            {submitError || projectsError}
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
