import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Button,
    Chip,
    FormControl,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import { Plus, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';

import { StatsGrid, ProjectOverview, RecentActivity, TasksSummary, CreateProjectDialog } from '../components';
import { selectUserTasksSortedByDueDate, selectUserTasksCountByStatus, selectCurrentUser } from '../store';

const Dashboard = () => {
    const currentUser = useSelector(selectCurrentUser);
    const userTasks = useSelector(selectUserTasksSortedByDueDate);
    const taskStats = useSelector(selectUserTasksCountByStatus);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [sortBy, setSortBy] = useState('dueDate'); // 'dueDate' or 'status'
    const [filterStatus, setFilterStatus] = useState('ALL');

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
        switch (status) {
            case 'DONE':
                return <CheckCircle size={16} />;
            case 'IN_PROGRESS':
                return <Clock size={16} />;
            case 'IN_REVIEW':
                return <AlertCircle size={16} />;
            default:
                return <Calendar size={16} />;
        }
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
                        Welcome back, {currentUser?.name || 'User'}
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
            <div className="mt-12 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                            My Tasks
                        </h2>
                        <p className="text-gray-500 dark:text-zinc-400 text-sm">
                            {taskStats.total} total tasks across all teams and projects
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <MenuItem value="ALL">All Status</MenuItem>
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
                <div className="border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                    {sortedTasks.length === 0 ? (
                        <div className="p-8 text-center">
                            <Calendar className="size-12 mx-auto mb-4 text-gray-400 dark:text-zinc-600" />
                            <p className="text-gray-600 dark:text-zinc-400">
                                {userTasks.length === 0 
                                    ? "No tasks assigned to you yet" 
                                    : "No tasks match your filter"}
                            </p>
                        </div>
                    ) : (
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
