import { useState } from 'react';
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
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { dummyUsers } from '../../assets/assets';
import { selectAllProjects } from '../../store';

export default function CreateTaskDialog({ showCreateTask, setShowCreateTask, projectId }) {
    const projects = useSelector(selectAllProjects);
    const project = projects.find((p) => p.id === projectId);
    const teamMembers = Array.isArray(project?.members) && project.members.length > 0
        ? project.members.map((member) => ({
            id: member?.user?.id || member?.userId,
            label: member?.user?.email || member?.user?.name || member?.userId || "Unknown",
        }))
        : (project?.memberIds || []).map((memberId) => {
            const profile = dummyUsers.find((user) => user.id === memberId);
            return {
                id: memberId,
                label: profile?.email || profile?.name || memberId,
            };
        });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "TASK",
        status: "TODO",
        priority: "MEDIUM",
        assigneeId: "",
        due_date: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();


    };

    return (
        <Dialog open={showCreateTask} onClose={() => setShowCreateTask(false)} fullWidth maxWidth="sm">
            <DialogTitle>Create New Task</DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, display: 'grid', gap: 2 }}>
                    <TextField
                        label="Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Task title"
                        required
                    />

                    <TextField
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the task"
                        multiline
                        rows={3}
                    />

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        <TextField
                            select
                            label="Type"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <MenuItem value="BUG">Bug</MenuItem>
                            <MenuItem value="FEATURE">Feature</MenuItem>
                            <MenuItem value="TASK">Task</MenuItem>
                            <MenuItem value="IMPROVEMENT">Improvement</MenuItem>
                            <MenuItem value="OTHER">Other</MenuItem>
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

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        <TextField
                            select
                            label="Assignee"
                            value={formData.assigneeId}
                            onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                        >
                            <MenuItem value="">Unassigned</MenuItem>
                            {teamMembers.map((member) => (
                                <MenuItem key={member.id} value={member.id}>
                                    {member.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            label="Status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <MenuItem value="TODO">To Do</MenuItem>
                            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                            <MenuItem value="DONE">Done</MenuItem>
                        </TextField>
                    </Box>

                    <TextField
                        type="date"
                        label="Due Date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: new Date().toISOString().split('T')[0] }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <CalendarIcon className="size-5" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    {formData.due_date && (
                        <Typography variant="caption" color="text.secondary">
                            {format(new Date(formData.due_date), "PPP")}
                        </Typography>
                    )}

                    <DialogActions sx={{ px: 0 }}>
                        <Button type="button" variant="outlined" onClick={() => setShowCreateTask(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Task"}
                        </Button>
                    </DialogActions>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
