import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';

import { StatsGrid, ProjectOverview, RecentActivity, TasksSummary, CreateProjectDialog, Button } from '../components';
import { selectUserTasksSortedByDueDate, selectUserTasksCountByStatus, selectCurrentUser } from '../store';

const Dashboard = () => {
    const currentUser = useSelector(selectCurrentUser);
    const userId = useSelector((state) => state.user?.id);
    const userTasks = useSelector((state) => selectUserTasksSortedByDueDate(state));
    const taskStats = useSelector(selectUserTasksCountByStatus);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [sortBy, setSortBy] = useState('dueDate'); // 'dueDate' or 'status'
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Filter tasks by status if not ALL
    const filteredTasks = filterStatus === 'ALL' 
        ? userTasks 
        : userTasks.filter(task => task.status === filterStatus);

    // Sort tasks
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (sortBy === 'dueDate') {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        } else if (sortBy === 'status') {
            const statusOrder = { TODO: 0, IN_PROGRESS: 1, IN_REVIEW: 2, DONE: 3 };
            return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
        }
        return 0;
    });

    const getStatusColor = (status) => {
        const colors = {
            TODO: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
            IN_PROGRESS: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
            IN_REVIEW: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
            DONE: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
        };
        return colors[status] || colors.TODO;
    };

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
        if (!dateString) return 'No due date';
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className='max-w-6xl mx-auto space-y-6'>
            {/* Header */}
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
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white text-sm bg-white dark:bg-zinc-900"
                        >
                            <option value="ALL">All Status</option>
                            <option value="TODO">Todo</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="IN_REVIEW">In Review</option>
                            <option value="DONE">Done</option>
                        </select>
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white text-sm bg-white dark:bg-zinc-900"
                        >
                            <option value="dueDate">Sort by Due Date</option>
                            <option value="status">Sort by Status</option>
                        </select>
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
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-800">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-zinc-400">
                                            Task
                                        </th>
                                        <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-zinc-400">
                                            Project
                                        </th>
                                        <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-zinc-400">
                                            Status
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-zinc-400">
                                            Due Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                    {sortedTasks.map((task) => (
                                        <tr 
                                            key={task.id}
                                            className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                                        >
                                            <td className="px-4 sm:px-6 py-3 text-sm">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white line-clamp-2">
                                                        {task.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                                                        {task.description || 'No description'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="hidden sm:table-cell px-4 sm:px-6 py-3 text-sm text-gray-600 dark:text-zinc-400 whitespace-nowrap">
                                                {task.projectName}
                                            </td>
                                            <td className="hidden md:table-cell px-4 sm:px-6 py-3 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${getStatusColor(task.status)}`}>
                                                        {getStatusIcon(task.status)}
                                                        {task.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 text-sm text-gray-600 dark:text-zinc-400 whitespace-nowrap">
                                                {formatDate(task.dueDate)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;