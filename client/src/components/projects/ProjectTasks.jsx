import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    Box,
    Button,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputAdornment,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { MediumAvatar } from '../ui/ReusableStyled';
import { styled } from '@mui/material/styles';
const MinWidthFormControl = styled(FormControl)({
    minWidth: 170,
});
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Calendar as CalendarIcon, Pen, Trash, XIcon, Zap } from 'lucide-react';

import { deleteTask as deleteTaskAction, updateTask as updateTaskAction } from '../../store';
import { useDeleteTaskMutation, useGetProjectByIdQuery, useGetTeamByIdQuery, useUpdateTaskMutation } from '../../store/slices/apiSlice';

const typeChipColor = {
    BUG: 'error',
    FEATURE: 'info',
    TASK: 'success',
    IMPROVEMENT: 'secondary',
    EPIC: 'warning',
    STORY: 'info',
    SUB_TASK: 'default',
};

const statusOptions = [
    { label: 'Backlog', value: 'BACKLOG' },
    { label: 'To Do', value: 'TODO' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'In Review', value: 'IN_REVIEW' },
    { label: 'Done', value: 'DONE' },
];

const filterOptionMap = {
    status: [
        { label: 'All Statuses', value: '' },
        ...statusOptions,
    ],
    type: [
        { label: 'All Types', value: '' },
        { label: 'Task', value: 'TASK' },
        { label: 'Bug', value: 'BUG' },
        { label: 'Feature', value: 'FEATURE' },
        { label: 'Improvement', value: 'IMPROVEMENT' },
        { label: 'Epic', value: 'EPIC' },
        { label: 'Story', value: 'STORY' },
    ],
    priority: [
        { label: 'All Priorities', value: '' },
        { label: 'Low', value: 'LOW' },
        { label: 'Medium', value: 'MEDIUM' },
        { label: 'High', value: 'HIGH' },
        { label: 'Urgent', value: 'URGENT' },
    ],
};

const priorityColor = {
    HIGH: 'error',
    MEDIUM: 'warning',
    LOW: 'default',
    URGENT: 'error',
};

const taskTypeOptions = [
    { value: "BUG", label: "Bug" },
    { value: "FEATURE", label: "Feature" },
    { value: "TASK", label: "Task" },
    { value: "IMPROVEMENT", label: "Improvement" },
    { value: "EPIC", label: "Epic" },
    { value: "STORY", label: "Story" },
    { value: "SUB_TASK", label: "Sub-task" },
];

const taskPriorityOptions = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "URGENT", label: "Urgent" },
];

const toDateInputValue = (value) => {
    if (!value) return "";
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return "";
    return format(parsedDate, 'yyyy-MM-dd');
};

const ProjectTasks = ({ tasks, projectId }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [updateTask] = useUpdateTaskMutation();
    const [deleteTask] = useDeleteTaskMutation();
    const [selectedTasks, setSelectedTasks] = useState([]);

    const [filters, setFilters] = useState({
        status: '',
        type: '',
        priority: '',
        assignee: '',
    });

    const getSafeDate = (value) => {
        if (!value) return null;
        const parsedDate = new Date(value);
        return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
    };

    const getTaskDueDate = (task) => task?.dueDate || task?.due_date || null;
    const { data: projectData } = useGetProjectByIdQuery(projectId, { skip: !projectId });
    const { data: teamData } = useGetTeamByIdQuery(projectData?.project?.teamId, {
        skip: !projectData?.project?.teamId,
    });

    const teamMembers = useMemo(() => {
        const rawMembers = teamData?.team?.members || [];
        const membersById = new Map();

        rawMembers.forEach((member) => {
            const memberUser = member?.user || member;
            const memberId = memberUser?.id || member?.userId || null;

            if (!memberId || membersById.has(memberId)) return;
            membersById.set(memberId, {
                id: memberId,
                label: memberUser.fullName || memberUser.username || memberUser.email || memberId,
            });
        });

        return Array.from(membersById.values());
    }, [teamData]);

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);
    const [editError, setEditError] = useState('');
    const [editFormData, setEditFormData] = useState({
        id: '',
        title: '',
        description: '',
        type: 'TASK',
        priority: 'MEDIUM',
        status: 'BACKLOG',
        assigneeId: '',
        due_date: '',
    });

    const assigneeList = useMemo(
        () =>
            Array.from(
                new Set(
                    tasks
                        .map((task) => task.assignee?.name || task.assignee?.fullName || task.assignee?.username)
                        .filter(Boolean)
                )
            ),
        [tasks]
    );

    const assigneeOptions = useMemo(
        () => [{ label: 'All Assignees', value: '' }, ...assigneeList.map((n) => ({ label: n, value: n }))],
        [assigneeList]
    );

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const { status, type, priority, assignee } = filters;
            return (
                (!status || task.status === status) &&
                (!type || task.type === type) &&
                (!priority || task.priority === priority) &&
                (!assignee || (task.assignee?.name || task.assignee?.fullName || task.assignee?.username) === assignee)
            );
        });
    }, [filters, tasks]);

    const handleStatusChange = async (taskId, newStatus) => {
        let loadingToast;

        try {
            loadingToast = toast.loading('Updating status...');
            const { task: updatedTask } = await updateTask({ id: taskId, status: newStatus }).unwrap();
            dispatch(updateTaskAction(updatedTask));

            toast.success('Task status updated successfully');
        } catch (error) {
            toast.error(error?.data?.message || error?.response?.data?.message || error.message);
        } finally {
            if (loadingToast) {
                toast.dismiss(loadingToast);
            }
        }
    };

    const openEditDialog = (task) => {
        setEditFormData({
            id: task.id,
            title: task.title || '',
            description: task.description || '',
            type: task.type || 'TASK',
            priority: task.priority || 'MEDIUM',
            status: task.status || 'BACKLOG',
            assigneeId: task.assigneeId || '',
            due_date: toDateInputValue(getTaskDueDate(task)),
        });
        setEditError('');
        setIsEditDialogOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editFormData.id || !editFormData.title.trim()) return;

        setIsEditSubmitting(true);
        setEditError('');
        let loadingToast;

        try {
            loadingToast = toast.loading('Saving task changes...');
            const { task: updatedTask } = await updateTask({
                id: editFormData.id,
                title: editFormData.title,
                description: editFormData.description,
                type: editFormData.type,
                priority: editFormData.priority,
                status: editFormData.status,
                assigneeId: editFormData.assigneeId || null,
                dueDate: editFormData.due_date || null,
            }).unwrap();

            dispatch(updateTaskAction(updatedTask));
            setIsEditDialogOpen(false);
            toast.success('Task updated successfully');
        } catch (error) {
            const message = error?.data?.message || error?.response?.data?.message || error.message || 'Failed to update task';
            setEditError(message);
            toast.error(message);
        } finally {
            if (loadingToast) {
                toast.dismiss(loadingToast);
            }
            setIsEditSubmitting(false);
        }
    };

    const handleDelete = async () => {
        let loadingToast;

        try {
            const confirm = window.confirm('Are you sure you want to delete the selected tasks?');
            if (!confirm) return;

            loadingToast = toast.loading('Deleting tasks...');
            await Promise.all(selectedTasks.map((taskId) => deleteTask(taskId).unwrap()));

            dispatch(deleteTaskAction(selectedTasks));
            setSelectedTasks([]);

            toast.success('Tasks deleted successfully');
        } catch (error) {
            toast.error(error?.data?.message || error?.response?.data?.message || error.message);
        } finally {
            if (loadingToast) {
                toast.dismiss(loadingToast);
            }
        }
    };

    const toggleSelection = (taskId) => {
        setSelectedTasks((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]));
    };

    const [showFilters, setShowFilters] = useState(false);

    const FilterBar = () => (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
            {['status', 'type', 'priority', 'assignee'].map((name) => (
                <MinWidthFormControl key={name} size="small">
                    <Select
                        value={filters[name]}
                        onChange={(e) => setFilters((prev) => ({ ...prev, [name]: e.target.value }))}
                        displayEmpty
                    >
                        {(name === 'assignee' ? assigneeOptions : filterOptionMap[name]).map((opt) => (
                            <MenuItem key={opt.value || 'empty'} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </Select>
                </MinWidthFormControl>
            ))}

            {(filters.status || filters.type || filters.priority || filters.assignee) && (
                <Button
                    type="button"
                    variant="outlined"
                    onClick={() => setFilters({ status: '', type: '', priority: '', assignee: '' })}
                    startIcon={<XIcon className="size-3" />}
                >
                    Reset
                </Button>
            )}

            {selectedTasks.length > 0 && (
                <Button type="button" color="error" variant="contained" onClick={handleDelete} startIcon={<Trash className="size-3" />}>
                    Delete
                </Button>
            )}
        </Stack>
    );

    return (
        <Box>
            {/* Mobile Filter Toggle */}
            <div className="md:hidden mb-4">
                <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setShowFilters(!showFilters)}
                    startIcon={<Zap className="size-4" />}
                >
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
                {showFilters && (
                    <div className="mt-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                        <FilterBar />
                    </div>
                )}
            </div>

            {/* Desktop Filter Bar */}
            <div className="hidden md:block">
                <FilterBar />
            </div>

            {/* Responsive Task List: Table on Desktop, Cards on Mobile */}
            <div className="hidden sm:block">
                <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        onChange={() =>
                                            selectedTasks.length === tasks.length
                                                ? setSelectedTasks([])
                                                : setSelectedTasks(tasks.map((t) => t.id))
                                        }
                                        checked={tasks.length > 0 && selectedTasks.length === tasks.length}
                                    />
                                </TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Priority</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Assignee</TableCell>
                                <TableCell>Due Date</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map((task) => {
                                    const chipColor = typeChipColor[task.type] || 'default';

                                    return (
                                        <TableRow
                                            key={task.id}
                                            hover
                                            sx={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`)}
                                        >
                                            <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedTasks.includes(task.id)}
                                                    onChange={() => toggleSelection(task.id)}
                                                />
                                            </TableCell>
                                            <TableCell>{task.title}</TableCell>
                                            <TableCell>
                                                <Chip size="small" label={task.type} color={chipColor} />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={task.priority}
                                                    color={priorityColor[task.priority] || 'default'}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <FormControl size="small" sx={{ minWidth: 130 }}>
                                                    <Select
                                                        value={task.status}
                                                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                                    >
                                                        {statusOptions.map((option) => (
                                                            <MenuItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <MediumAvatar src={task.assignee?.image || task.assignee?.avatarUrl} />
                                                    <Typography variant="body2">{task.assignee?.name || task.assignee?.fullName || task.assignee?.username || '-'}</Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <CalendarIcon className="size-4" />
                                                    <Typography variant="body2">{getSafeDate(getTaskDueDate(task)) ? format(getSafeDate(getTaskDueDate(task)), 'dd MMMM') : '—'}</Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    type="button"
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<Pen className="size-3.5" />}
                                                    onClick={() => openEditDialog(task)}
                                                >
                                                    Edit
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8}>
                                        <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
                                            No tasks found for the selected filters.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => {
                        return (
                            <div
                                key={task.id}
                                className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 space-y-3"
                                onClick={() => navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <h3 className="font-medium text-sm">{task.title}</h3>
                                        <span className="text-xs text-zinc-500">{task.type}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            size="small"
                                            variant="outlined"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openEditDialog(task);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Checkbox
                                            size="small"
                                            checked={selectedTasks.includes(task.id)}
                                            onChange={() => toggleSelection(task.id)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between gap-2">
                                    <div onClick={(e) => e.stopPropagation()} className="flex-1">
                                        <Select
                                            value={task.status}
                                            size="small"
                                            fullWidth
                                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                            sx={{ fontSize: '0.75rem' }}
                                        >
                                            {statusOptions.map((option) => (
                                                <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.75rem' }}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </div>
                                    <Chip
                                        size="small"
                                        label={task.priority}
                                        color={priorityColor[task.priority] || 'default'}
                                        variant="outlined"
                                        sx={{ fontSize: '0.65rem' }}
                                    />
                                </div>

                                <div className="flex items-center justify-between text-xs text-zinc-500">
                                    <div className="flex items-center gap-1.5">
                                        <MediumAvatar src={task.assignee?.image || task.assignee?.avatarUrl} sx={{ width: 18, height: 18 }} />
                                        <span>{task.assignee?.name || task.assignee?.fullName || task.assignee?.username || 'Unassigned'}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <CalendarIcon className="size-3" />
                                        <span>{getSafeDate(getTaskDueDate(task)) ? format(getSafeDate(getTaskDueDate(task)), 'dd MMM') : '—'}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                        <Typography variant="body2" color="text.secondary">No tasks found</Typography>
                    </div>
                )}
            </div>

            <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Edit Task</DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleEditSubmit} sx={{ mt: 1, display: 'grid', gap: 2 }}>
                        <TextField
                            label="Title"
                            value={editFormData.title}
                            onChange={(e) => setEditFormData((prev) => ({ ...prev, title: e.target.value }))}
                            required
                        />

                        <TextField
                            label="Description"
                            value={editFormData.description}
                            onChange={(e) => setEditFormData((prev) => ({ ...prev, description: e.target.value }))}
                            multiline
                            rows={3}
                        />

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <TextField
                                select
                                label="Type"
                                value={editFormData.type}
                                onChange={(e) => setEditFormData((prev) => ({ ...prev, type: e.target.value }))}
                            >
                                {taskTypeOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                label="Priority"
                                value={editFormData.priority}
                                onChange={(e) => setEditFormData((prev) => ({ ...prev, priority: e.target.value }))}
                            >
                                {taskPriorityOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <TextField
                                select
                                label="Status"
                                value={editFormData.status}
                                onChange={(e) => setEditFormData((prev) => ({ ...prev, status: e.target.value }))}
                            >
                                {statusOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                label="Assignee"
                                value={editFormData.assigneeId}
                                onChange={(e) => setEditFormData((prev) => ({ ...prev, assigneeId: e.target.value }))}
                            >
                                <MenuItem value="">Unassigned</MenuItem>
                                {teamMembers.map((member) => (
                                    <MenuItem key={member.id} value={member.id}>
                                        {member.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <TextField
                            type="date"
                            label="Due Date"
                            value={editFormData.due_date}
                            onChange={(e) => setEditFormData((prev) => ({ ...prev, due_date: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <CalendarIcon className="size-5" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {editError && (
                            <Typography color="error" variant="body2">
                                {editError}
                            </Typography>
                        )}

                        <DialogActions sx={{ px: 0 }}>
                            <Button type="button" variant="outlined" onClick={() => setIsEditDialogOpen(false)} disabled={isEditSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" disabled={isEditSubmitting || !editFormData.title.trim()}>
                                {isEditSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogActions>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default ProjectTasks;

