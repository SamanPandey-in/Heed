import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FolderOpen, CheckCircle, Users, AlertTriangle } from 'lucide-react';

export default function StatsGrid() {
    const projects = useSelector(
        (state) => state?.projects?.projects || []
    );

    const [stats, setStats] = useState({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        myTasks: 0,
        overdueIssues: 0,
    });

    const statCards = [
        {
            icon: FolderOpen,
            title: "Total Projects",
            value: stats.totalProjects,
            subtitle: `projects in your workspace`,
            bgStyle: { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
            textStyle: { color: 'white' },
        },
        {
            icon: CheckCircle,
            title: "Completed Projects",
            value: stats.completedProjects,
            subtitle: `of ${stats.totalProjects} total`,
            bgStyle: { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
            textStyle: { color: 'white' },
        },
        {
            icon: Users,
            title: "My Tasks",
            value: stats.myTasks,
            subtitle: "assigned to me",
            bgStyle: { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
            textStyle: { color: 'white' },
        },
        {
            icon: AlertTriangle,
            title: "Overdue",
            value: stats.overdueIssues,
            subtitle: "need attention",
            bgStyle: { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
            textStyle: { color: 'white' },
        },
    ];

    useEffect(() => {
        if (projects && projects.length > 0) {
            const currentUser = { email: "alexsmith@example.com" }; // Default to first user
            setStats({
                totalProjects: projects.length,
                activeProjects: projects.filter(
                    (p) => p.status !== "CANCELLED" && p.status !== "COMPLETED"
                ).length,
                completedProjects: projects
                    .filter((p) => p.status === "COMPLETED")
                    .reduce((acc, project) => acc + (project.tasks?.length || 0), 0),
                myTasks: projects.reduce(
                    (acc, project) =>
                        acc +
                        (project.tasks?.filter(
                            (t) => t.assignee?.email === currentUser.email
                        ).length || 0),
                    0
                ),
                overdueIssues: projects.reduce(
                    (acc, project) =>
                        acc + (project.tasks?.filter((t) => new Date(t.due_date) < new Date()).length || 0),
                    0
                ),
            });
        }
    }, [projects]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-9">
            {statCards.map(
                ({ icon: Icon, title, value, subtitle, bgStyle, textStyle }, i) => (
                    <div key={i} className="bg-white dark:bg-black border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition duration-200 rounded-md" >
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
                                <div className="p-3 rounded-xl" style={bgStyle}>
                                    <Icon size={20} style={textStyle} />
                                </div>
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}