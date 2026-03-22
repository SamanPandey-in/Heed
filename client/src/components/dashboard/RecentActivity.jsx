import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { GitCommit, MessageSquare, Clock, Bug, Zap, Square } from 'lucide-react';
import { selectRecentTasks } from '../../store';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const statusChipStyles = {
    TODO:        { bg: 'rgba(113,113,122,0.12)', darkBg: 'rgba(113,113,122,0.25)', color: '#52525b', darkColor: '#a1a1aa' },
    IN_PROGRESS: { bg: 'rgba(37,99,235,0.10)',  darkBg: 'rgba(96,165,250,0.20)',  color: '#2563eb', darkColor: '#60a5fa' },
    IN_REVIEW:   { bg: 'rgba(217,119,6,0.10)',  darkBg: 'rgba(251,191,36,0.20)',  color: '#b45309', darkColor: '#fbbf24' },
    DONE:        { bg: 'rgba(5,150,105,0.10)',  darkBg: 'rgba(52,211,153,0.20)',  color: '#059669', darkColor: '#34d399' },
};

const StatusChip = styled('span', {
    shouldForwardProp: (prop) => prop !== 'status',
})(({ theme, status }) => {
    const s = statusChipStyles[status] || statusChipStyles.TODO;
    return {
        marginLeft: theme.spacing(0.5),
        padding: '2px 8px',
        borderRadius: 6,
        fontSize: 12,
        backgroundColor: theme.palette.mode === 'dark' ? s.darkBg : s.bg,
        color: theme.palette.mode === 'dark' ? s.darkColor : s.color,
        display: 'inline-block',
        minWidth: 48,
        textAlign: 'center',
        fontWeight: 500,
        whiteSpace: 'nowrap',
    };
});

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

const RecentActivity = () => {
    const tasks = useSelector(selectRecentTasks);

    const toSafeDate = (value) => {
        if (!value) return null;
        const parsedDate = new Date(value);
        return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
    };

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
                                                <StatusChip status={task.status}>
                                                    {task.status.replace("_", " ")}
                                                </StatusChip>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                                                <span className="capitalize">{task.type.toLowerCase()}</span>
                                                {task.assignee && (
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-4 h-4 bg-zinc-300 dark:bg-zinc-700 rounded-full flex items-center justify-center text-[10px] text-zinc-800 dark:text-zinc-200">
                                                            {(task.assignee.name || task.assignee.fullName || task.assignee.username || '?')[0].toUpperCase()}
                                                        </div>
                                                        {task.assignee.name || task.assignee.fullName || task.assignee.username}
                                                    </div>
                                                )}
                                                <span>
                                                    {toSafeDate(task.updatedAt) ? format(toSafeDate(task.updatedAt), "MMM d, h:mm a") : 'Unknown time'}
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
