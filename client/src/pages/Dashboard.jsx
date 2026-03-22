import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    Chip,
    FormControl,
    Menu,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import { Plus, Calendar, CheckCircle, AlertCircle, Clock, LayoutGrid, List, ChevronDown, Flag } from 'lucide-react';
import toast from 'react-hot-toast';

import { StatsGrid, ProjectOverview, RecentActivity, TasksSummary, CreateProjectDialog } from '../components';
import { selectUserTasksSortedByDueDate, selectUserTasksCountByStatus, selectCurrentUser, updateTask as updateTaskAction } from '../store';
import { useUpdateTaskMutation } from '../store/slices/apiSlice';

const statusMap = {
    TODO:        { label: 'Todo',        color: 'default', icon: <Calendar size={14} /> },
    IN_PROGRESS: { label: 'In Progress', color: 'primary', icon: <Clock size={14} /> },
    IN_REVIEW:   { label: 'In Review',   color: 'warning', icon: <AlertCircle size={14} /> },
    DONE:        { label: 'Done',        color: 'success', icon: <CheckCircle size={14} /> },
};

const priorityMap = {
    HIGH:   { label: 'High Priority',   color: 'text-red-500',   bgColor: 'bg-red-50 dark:bg-red-950/40' },
    MEDIUM: { label: 'Medium Priority', color: 'text-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-950/40' },
    LOW:    { label: 'Low Priority',    color: 'text-blue-500',  bgColor: 'bg-blue-50 dark:bg-blue-950/40' },
    NONE:   { label: 'No Priority',     color: 'text-gray-400',  bgColor: 'bg-gray-50 dark:bg-zinc-950/40' },
};

const Dashboard = () => {
    const dispatch = useDispatch();
    const currentUser = useSelector(selectCurrentUser);
    const userTasks = useSelector(selectUserTasksSortedByDueDate);
    const taskStats = useSelector(selectUserTasksCountByStatus);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [sortBy, setSortBy] = useState('dueDate'); // 'dueDate' or 'status'
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
    const [anchorEl, setAnchorEl] = useState(null);
    const [activeTaskId, setActiveTaskId] = useState(null);
    const [activeTaskStatus, setActiveTaskStatus] = useState(null);

    const [updateTask] = useUpdateTaskMutation();

    const handleOpenMenu = (event, taskId, taskStatus) => {
        setAnchorEl(event.currentTarget);
        setActiveTaskId(taskId);
        setActiveTaskStatus(taskStatus);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setActiveTaskId(null);
        setActiveTaskStatus(null);
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!activeTaskId) return;
        let loadingToast;
        try {
            loadingToast = toast.loading('Updating status...');
            const { task: updatedTask } = await updateTask({ id: activeTaskId, status: newStatus }).unwrap();
            dispatch(updateTaskAction(updatedTask));
            toast.success('Task status updated successfully');
        } catch (error) {
            toast.error(error?.data?.message || error?.message || 'Failed to update status');
        } finally {
            if (loadingToast) toast.dismiss(loadingToast);
        }
        handleCloseMenu();
    };

    const toSafeDate = (value) => {
        if (!value) return null;
        const parsedDate = new Date(value);
        return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
    };

    // Filter tasks by status if not ALL
    const filteredTasks = filterStatus === 'ALL' 
        ? userTasks 
        : userTasks.filter(task => task.status === filterStatus);

    // Sort tasks
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (sortBy === 'dueDate') {
            const dueDateA = toSafeDate(a.dueDate);
            const dueDateB = toSafeDate(b.dueDate);

            if (!dueDateA) return 1;
            if (!dueDateB) return -1;
            return dueDateA - dueDateB;
        } else if (sortBy === 'status') {
            const statusOrder = { TODO: 0, IN_PROGRESS: 1, IN_REVIEW: 2, DONE: 3 };
            return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
        }
        return 0;
    });

    const getStatusIcon = (status) => {
        return statusMap[status]?.icon ?? <Calendar size={16} />;
    };

    const formatDate = (dateString) => {
        const date = toSafeDate(dateString);
        if (!date) return 'No due date';
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className='max-w-6xl mx-auto space-y-6'>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                        Welcome back, {currentUser?.fullName || currentUser?.name || 'User'}
                    </h1>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm">
                        Here's what's happening with your projects today
                    </p>
                </div>
                <Button 
                  variant='contained' 
                  color='primary'
                  startIcon={<Plus size={16} />}
                  onClick={() => setIsDialogOpen(true)}
                >
                  New Project
                </Button>
                <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            </div>

            <StatsGrid />

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <ProjectOverview />
                    <RecentActivity />
                </div>
                <div>
                    <TasksSummary />
                </div>
            </div>

            {/* My Tasks Section */}
            <div id="my-tasks" className="mt-12 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                            My Tasks
                        </h2>
                        <p className="text-gray-500 dark:text-zinc-400 text-sm">
                            {taskStats.total} total tasks across all teams and projects
                        </p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* View Toggle */}
                        <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg mr-2">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary' : 'text-gray-500'}`}
                            >
                                <List size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary' : 'text-gray-500'}`}
                            >
                                <LayoutGrid size={18} />
                            </button>
                        </div>

                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <MenuItem value="ALL">All Status</MenuItem>
                                <MenuItem value="BACKLOG">Backlog</MenuItem>
                                <MenuItem value="TODO">Todo</MenuItem>
                                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                                <MenuItem value="IN_REVIEW">In Review</MenuItem>
                                <MenuItem value="DONE">Done</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 170 }}>
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <MenuItem value="dueDate">Sort by Due Date</MenuItem>
                                <MenuItem value="status">Sort by Status</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                </div>

                {/* Task Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Todo', value: taskStats.todo, color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' },
                        { label: 'In Progress', value: taskStats.inProgress, color: 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
                        { label: 'In Review', value: taskStats.inReview, color: 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' },
                        { label: 'Done', value: taskStats.done, color: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
                    ].map((stat, idx) => (
                        <div key={idx} className={`rounded-lg p-4 ${stat.color}`}>
                            <p className="text-sm font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Tasks List */}
                {sortedTasks.length === 0 ? (
                    <div className="p-12 border border-dashed border-gray-300 dark:border-zinc-800 rounded-xl text-center">
                        <Calendar aria-label="No tasks available" className="size-10 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-500 dark:text-zinc-400">
                            {userTasks.length === 0
                                ? "No tasks assigned to you yet"
                                : "No tasks match your filter"}
                        </p>
                    </div>
                ) : viewMode === 'table' ? (
                    // --- TABLE VIEW (hidden on mobile, always cards on small screens) ---
                    <>
                        {/* Card list on mobile */}
                        <div className="sm:hidden grid grid-cols-1 gap-4">
                            {sortedTasks.map((task) => {
                                const priority = priorityMap[task.priority] ?? priorityMap.NONE;
                                const status = statusMap[task.status] ?? statusMap.TODO;
                                return (
                                    <div key={task.id} className="p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl hover:border-blue-500/50 transition-colors shadow-sm relative overflow-hidden">
                                        {task.priority && task.priority !== 'NONE' && (
                                            <div className={`absolute top-0 right-0 h-10 w-10 ${priority.bgColor} rounded-bl-full`} />
                                        )}
                                        <div className="flex justify-between items-start mb-2 relative z-10">
                                            <Chip label={task.projectName} size="small" variant="outlined" className="text-[10px] uppercase tracking-wider" />
                                            <div className={`flex items-center gap-1.5 text-xs font-semibold ${priority.color}`}>
                                                <Flag size={14} />
                                                {priority.label}
                                            </div>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{task.title}</h4>
                                        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 line-clamp-2 min-h-[40px]">
                                            {task.description || 'No description provided'}
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center relative z-10">
                                            <span className="text-xs font-medium text-gray-400">Due {formatDate(task.dueDate)}</span>
                                            <Chip
                                                label={status.label}
                                                size="small"
                                                color={status.color}
                                                onClick={(e) => handleOpenMenu(e, task.id, task.status)}
                                                onDelete={(e) => handleOpenMenu(e, task.id, task.status)}
                                                deleteIcon={<ChevronDown size={12} />}
                                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                                sx={{ height: 24, fontSize: '0.7rem', fontWeight: 600 }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Table on sm+ screens */}
                        <div className="hidden sm:block border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900/50">
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Task</TableCell>
                                            <TableCell className="hidden sm:table-cell">Project</TableCell>
                                            <TableCell className="hidden md:table-cell">Status</TableCell>
                                            <TableCell>Due Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sortedTasks.map((task) => (
                                            <TableRow key={task.id} hover>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white line-clamp-2">
                                                            {task.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                                                            {task.description || 'No description'}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">{task.projectName}</TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <Chip
                                                        size="small"
                                                        icon={getStatusIcon(task.status)}
                                                        label={task.status.replace('_', ' ')}
                                                        color={
                                                            task.status === 'DONE'
                                                                ? 'success'
                                                                : task.status === 'IN_PROGRESS'
                                                                    ? 'info'
                                                                    : task.status === 'IN_REVIEW'
                                                                        ? 'warning'
                                                                        : 'default'
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>{formatDate(task.dueDate)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    </>
                ) : (
                    // --- CARD / GRID VIEW ---
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortedTasks.map((task) => {
                            const priority = priorityMap[task.priority] ?? priorityMap.NONE;
                            const status = statusMap[task.status] ?? statusMap.TODO;
                            return (
                                <div key={task.id} className="p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl hover:border-blue-500/50 transition-colors shadow-sm relative overflow-hidden">
                                    {/* Subtle priority corner accent */}
                                    {task.priority && task.priority !== 'NONE' && (
                                        <div className={`absolute top-0 right-0 h-10 w-10 ${priority.bgColor} rounded-bl-full`} />
                                    )}

                                    <div className="flex justify-between items-start mb-2 relative z-10">
                                        <Chip
                                            label={task.projectName}
                                            size="small"
                                            variant="outlined"
                                            className="text-[10px] uppercase tracking-wider"
                                        />
                                        {/* Priority indicator */}
                                        <div className={`flex items-center gap-1.5 text-xs font-semibold ${priority.color}`}>
                                            <Flag size={14} />
                                            {priority.label}
                                        </div>
                                    </div>

                                    <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{task.title}</h4>
                                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 line-clamp-2 min-h-[40px]">
                                        {task.description || 'No description provided'}
                                    </p>

                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center relative z-10">
                                        <span className="text-xs font-medium text-gray-400">Due {formatDate(task.dueDate)}</span>
                                        <Chip
                                            label={status.label}
                                            size="small"
                                            color={status.color}
                                            onClick={(e) => handleOpenMenu(e, task.id, task.status)}
                                            onDelete={(e) => handleOpenMenu(e, task.id, task.status)}
                                            deleteIcon={<ChevronDown size={12} />}
                                            className="cursor-pointer hover:opacity-80 transition-opacity"
                                            sx={{ height: 24, fontSize: '0.7rem', fontWeight: 600 }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Global Status Quick-Edit Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                    PaperProps={{
                        sx: { mt: 1, width: 160, borderRadius: 2, boxShadow: '0px 4px 20px rgba(0,0,0,0.1)' }
                    }}
                >
                    {Object.entries(statusMap).map(([key, { label, icon }]) => (
                        <MenuItem
                            key={key}
                            onClick={() => handleStatusUpdate(key)}
                            selected={activeTaskStatus === key}
                            sx={{ gap: 1.5, fontSize: '0.875rem' }}
                        >
                            {icon} {label}
                        </MenuItem>
                    ))}
                </Menu>
            </div>
        </div>
    );
};

export default Dashboard;
