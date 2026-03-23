import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { ArrowRight, Clock, AlertTriangle, User } from 'lucide-react';
import { selectTaskSummaryCards } from '../../store';

export default function TasksSummary() {
    const navigate = useNavigate();
    const { myTasks, overdueTasks, inProgressTasks } = useSelector(selectTaskSummaryCards);

    const summaryCards = [
        {
            title: "My Tasks",
            count: myTasks.length,
            icon: User,
            color: "bg-white text-black dark:bg-white dark:text-black",
            items: myTasks.slice(0, 3)
        },
        {
            title: "Overdue",
            count: overdueTasks.length,
            icon: AlertTriangle,
            color: "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-200",
            items: overdueTasks.slice(0, 3)
        },
        {
            title: "In Progress",
            count: inProgressTasks.length,
            icon: Clock,
            color: "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-200",
            items: inProgressTasks.slice(0, 3)
        }
    ];

    return (
        <div className="space-y-6">
            {summaryCards.map((card) => (
                <div key={card.title} className="bg-white dark:bg-black border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-all duration-200 rounded-lg overflow-hidden">
                    <div className="border-b border-zinc-200 dark:border-white/10 p-4 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-50 dark:bg-white/5 rounded-lg">
                                <card.icon className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                            </div>
                            <div className="flex items-center justify-between flex-1">
                                <h3 className="text-sm font-medium text-gray-800 dark:text-white">{card.title}</h3>
                                <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-semibold ${card.color}`}>
                                    {card.count}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        {card.items.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-zinc-400 text-center py-4">
                                No {card.title.toLowerCase()}
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {card.items.map((issue) => (
                                    <div key={issue.id} className="p-3 rounded-lg bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
                                        <h4 className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                            {issue.title}
                                        </h4>
                                        <p className="text-xs text-gray-600 dark:text-zinc-400 capitalize mt-1">
                                            {issue.type} • {issue.priority} priority
                                        </p>
                                    </div>
                                ))}
                                {card.count > 3 && (
                                    <Button
                                        size="small"
                                        fullWidth
                                        variant="text"
                                        color="inherit"
                                        className="mt-2"
                                        onClick={() => navigate("/dashboard#my-tasks")}
                                        endIcon={<ArrowRight className="w-3 h-3" />}
                                    >
                                        View {card.count - 3} more
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
