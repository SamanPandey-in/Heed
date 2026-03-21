import { useState } from 'react';
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
import { useCreateTaskMutation, useGetProjectByIdQuery } from '../../store/slices/apiSlice';

export default function CreateTaskDialog({ showCreateTask, setShowCreateTask, projectId }) {
    const { data } = useGetProjectByIdQuery(projectId, { skip: !projectId });
    const project = data?.project;
    const teamMembers = project?.members || [];

    const [createTask] = useCreateTaskMutation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "TASK",
        priority: "MEDIUM",
        assigneeId: "",
        due_date: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !projectId) return;

        setIsSubmitting(true);
        setError('');

        try {
            await createTask({
                title: formData.title,
                description: formData.description,
                projectId,
                type: formData.type,
                priority: formData.priority,
                assigneeId: formData.assigneeId || undefined,
                dueDate: formData.due_date || undefined,
            }).unwrap();

            setIsDialogOpen(false);
            setFormData({
                title: "",
                description: "",
                type: "TASK",
                priority: "MEDIUM",
                assigneeId: "",
                due_date: "",
            });
        } catch (err) {
            setError(err?.data?.message || 'Failed to create task');
        } finally {
            setIsSubmitting(false);
        }
    };

    const setIsDialogOpen = (open) => {
        if (!open) {
            setShowCreateTask(false);
        }
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
                            <MenuItem value="EPIC">Epic</MenuItem>
                            <MenuItem value="STORY">Story</MenuItem>
                            <MenuItem value="SUB_TASK">Sub-task</MenuItem>
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
                            <MenuItem value="URGENT">Urgent</MenuItem>
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
                                    {member.fullName || member.username || member.email}
                                </MenuItem>
                            ))}
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

                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}

                    <DialogActions sx={{ px: 0 }}>
                        <Button type="button" variant="outlined" onClick={() => setShowCreateTask(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={isSubmitting || !formData.title.trim()}>
                            {isSubmitting ? "Creating..." : "Create Task"}
                        </Button>
                    </DialogActions>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
