import { useSelector } from 'react-redux';
import { FolderOpen, CheckCircle, Users, AlertTriangle } from 'lucide-react';
import { selectDashboardStats } from '../../store';
import { Box, useTheme } from '@mui/material';
import tokens from '../../theme/tokens';

const CARD_ACCENTS = [
    { lightBg: '#dbeafe', lightIcon: '#2563eb', darkBg: 'rgba(37,99,235,0.18)',   darkIcon: '#60a5fa' }, // blue
    { lightBg: '#d1fae5', lightIcon: '#059669', darkBg: 'rgba(5,150,105,0.18)',   darkIcon: '#34d399' }, // green
    { lightBg: '#ede9fe', lightIcon: '#7c3aed', darkBg: 'rgba(124,58,237,0.18)', darkIcon: '#a78bfa' }, // purple
    { lightBg: '#fee2e2', lightIcon: '#dc2626', darkBg: 'rgba(220,38,38,0.18)',   darkIcon: '#f87171' }, // red
];

export default function StatsGrid() {
    const stats = useSelector(selectDashboardStats);
    const theme = useTheme();

    const statCards = [
        {
            icon: FolderOpen,
            title: "Total Projects",
            value: stats.totalProjects,
            subtitle: `projects in your teams`,
        },
        {
            icon: CheckCircle,
            title: "Completed Projects",
            value: stats.completedProjects,
            subtitle: `of ${stats.totalProjects} total`,
        },
        {
            icon: Users,
            title: "My Tasks",
            value: stats.myTasks,
            subtitle: "assigned to me",
        },
        {
            icon: AlertTriangle,
            title: "Overdue",
            value: stats.overdueIssues,
            subtitle: "need attention",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-9">
            {statCards.map(({ icon: Icon, title, value, subtitle }, i) => {
                const accent = CARD_ACCENTS[i];
                const isDark = theme.palette.mode === 'dark';
                const iconBg = isDark ? accent.darkBg : accent.lightBg;
                const iconColor = isDark ? accent.darkIcon : accent.lightIcon;

                return (
                    <div key={i} className={tokens.cardBgClass}>
                        <div className="p-6 py-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                                        {title}
                                    </p>
                                    <p className="text-3xl font-bold text-zinc-800 dark:text-white">
                                        {value}
                                    </p>
                                    {subtitle && (
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                                <Box
                                    sx={{
                                        padding: 1.5,
                                        borderRadius: 2,
                                        backgroundColor: iconBg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Icon size={20} style={{ color: iconColor }} />
                                </Box>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
