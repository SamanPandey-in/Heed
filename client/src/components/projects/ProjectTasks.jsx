import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    Avatar,
    Box,
    Button,
    Checkbox,
    Chip,
    FormControl,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { MediumAvatar } from '../ui/ReusableStyled';
import { styled } from '@mui/material/styles';
const MinWidthFormControl = styled(FormControl)({
    minWidth: 170,
});
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Bug, CalendarIcon, GitCommit, MessageSquare, Square, Trash, XIcon, Zap } from 'lucide-react';

import { deleteTask, updateTask } from '../../store';

const typeIcons = {
    BUG: { icon: Bug, color: 'error' },
    FEATURE: { icon: Zap, color: 'info' },
    TASK: { icon: Square, color: 'success' },
    IMPROVEMENT: { icon: GitCommit, color: 'secondary' },
    OTHER: { icon: MessageSquare, color: 'warning' },
};

const statusOptions = [
    { label: 'To Do', value: 'TODO' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
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
        { label: 'Other', value: 'OTHER' },
    ],
    priority: [
        { label: 'All Priorities', value: '' },
        { label: 'Low', value: 'LOW' },
        { label: 'Medium', value: 'MEDIUM' },
        { label: 'High', value: 'HIGH' },
    ],
};

const priorityColor = {
    LOW: 'warning',
    MEDIUM: 'info',
    HIGH: 'success',
};

const ProjectTasks = ({ tasks }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selectedTasks, setSelectedTasks] = useState([]);

    const [filters, setFilters] = useState({
        status: '',
        type: '',
        priority: '',
        assignee: '',
    });

    const assigneeList = useMemo(
        () => Array.from(new Set(tasks.map((t) => t.assignee?.name).filter(Boolean))),
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
                (!assignee || task.assignee?.name === assignee)
            );
        });
    }, [filters, tasks]);

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            toast.loading('Updating status...');
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const updatedTask = structuredClone(tasks.find((t) => t.id === taskId));
            updatedTask.status = newStatus;
            dispatch(updateTask(updatedTask));

            toast.dismiss();
            toast.success('Task status updated successfully');
        } catch (error) {
            toast.dismiss();
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const handleDelete = async () => {
        try {
            const confirm = window.confirm('Are you sure you want to delete the selected tasks?');
            if (!confirm) return;

            toast.loading('Deleting tasks...');
            await new Promise((resolve) => setTimeout(resolve, 2000));

            dispatch(deleteTask(selectedTasks));

            toast.dismiss();
            toast.success('Tasks deleted successfully');
        } catch (error) {
            toast.dismiss();
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const toggleSelection = (taskId) => {
        setSelectedTasks((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]));
    };

    return (
        <Box>
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
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => {
                                const Icon = typeIcons[task.type]?.icon;
                                const chipColor = typeIcons[task.type]?.color || 'default';

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
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                {Icon ? <Icon className="size-4" /> : null}
                                                <Chip size="small" label={task.type} color={chipColor} />
                                            </Stack>
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
                                                <MediumAvatar src={task.assignee?.image} />
                                                <Typography variant="body2">{task.assignee?.name || '-'}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                <CalendarIcon className="size-4" />
                                                <Typography variant="body2">{task.due_date ? format(new Date(task.due_date), 'dd MMMM') : '—'}</Typography>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7}>
                                    <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
                                        No tasks found for the selected filters.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ProjectTasks;
