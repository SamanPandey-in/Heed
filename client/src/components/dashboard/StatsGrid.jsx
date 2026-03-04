import { useSelector } from 'react-redux';
import { FolderOpen, CheckCircle, Users, AlertTriangle } from 'lucide-react';
import { selectDashboardStats } from '../../store';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { MediumAvatar } from '../ui/ReusableStyled';
import tokens from '../../theme/tokens';

export default function StatsGrid() {
    const stats = useSelector(selectDashboardStats);

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

    const StatIconBox = styled(Box)(({ theme }) => ({
        padding: theme.spacing(1.5),
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-9">
            {statCards.map(
                ({ icon: Icon, title, value, subtitle }, i) => (
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
                                <StatIconBox>
                                    <Icon size={20} style={{ color: 'white' }} />
                                </StatIconBox>
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}
