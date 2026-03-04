import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { GitCommit, MessageSquare, Clock, Bug, Zap, Square } from 'lucide-react';
import { selectRecentTasks } from '../../store';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
const StatusChip = styled('span')(({ theme }) => ({
    marginLeft: theme.spacing(0.5),
    padding: '2px 8px',
    borderRadius: 6,
    fontSize: 12,
    backgroundColor: 'var(--color-surface-variant)',
    color: 'var(--color-text)',
    display: 'inline-block',
    minWidth: 48,
    textAlign: 'center',
}));

const IconBg = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1),
    borderRadius: 12,
    backgroundColor: 'var(--color-surface-variant)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const typeIcons = {
    BUG: { icon: Bug, style: {} },
    FEATURE: { icon: Zap, style: {} },
    TASK: { icon: Square, style: {} },
    IMPROVEMENT: { icon: MessageSquare, style: {} },
    OTHER: { icon: GitCommit, style: {} },
};

const statusColors = {
    TODO: { bg: 'var(--color-surface-variant)', text: 'var(--color-text)' },
    IN_PROGRESS: { bg: 'var(--color-surface-variant)', text: 'var(--color-text)' },
    DONE: { bg: 'var(--color-surface-variant)', text: 'var(--color-text)' },
};

const RecentActivity = () => {
    const tasks = useSelector(selectRecentTasks);

    return (
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 rounded-lg transition-all overflow-hidden">
            <div className="border-b border-zinc-200 dark:border-white/10 p-4">
                <h2 className="text-lg text-zinc-800 dark:text-zinc-200">Recent Activity</h2>
            </div>

            <div className="p-0">
                {tasks.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                            <Clock className="w-8 h-8 text-zinc-600 dark:text-zinc-500" />
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400">No recent activity</p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-200 dark:divide-white/10">
                        {tasks.map((task) => {
                            const TypeIcon = typeIcons[task.type]?.icon || Square;

                            return (
                                <div key={task.id} className="p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <IconBg>
                                            <TypeIcon className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                                        </IconBg>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="text-zinc-800 dark:text-zinc-200 truncate">
                                                    {task.title}
                                                </h4>
                                                <StatusChip>
                                                    {task.status.replace("_", " ")}
                                                </StatusChip>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                                                <span className="capitalize">{task.type.toLowerCase()}</span>
                                                {task.assignee && (
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-4 h-4 bg-zinc-300 dark:bg-zinc-700 rounded-full flex items-center justify-center text-[10px] text-zinc-800 dark:text-zinc-200">
                                                            {task.assignee.name[0].toUpperCase()}
                                                        </div>
                                                        {task.assignee.name}
                                                    </div>
                                                )}
                                                <span>
                                                    {format(new Date(task.updatedAt), "MMM d, h:mm a")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentActivity;
