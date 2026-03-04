import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    ArrowLeftIcon,
    BarChart3Icon,
    CalendarIcon,
    FileStackIcon,
    PlusIcon,
    SettingsIcon,
    UsersIcon,
    ZapIcon,
} from 'lucide-react';

import {
    Button,
    CreateTaskDialog,
    ProjectAnalytics,
    ProjectCalendar,
    ProjectSettings,
    ProjectTasks,
} from '../components';
import { selectProjectById, selectTeamById } from '../store';

const statusColors = {
    active: 'bg-emerald-200 text-emerald-900 dark:bg-emerald-500 dark:text-emerald-900',
    completed: 'bg-blue-200 text-blue-900 dark:bg-blue-500 dark:text-blue-900',
    deprecated: 'bg-red-200 text-red-900 dark:bg-red-500 dark:text-red-900',
};

const resultColors = {
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
    ongoing: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
};

export default function ProjectDetail() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { projectId } = useParams();
    const navigate = useNavigate();

    const project = useSelector((state) => selectProjectById(state, projectId));
    const team = useSelector((state) => selectTeamById(state, project?.teamId));

    const [showCreateTask, setShowCreateTask] = useState(false);
    const activeTab = searchParams.get('tab') || 'tasks';

    const tasks = useMemo(() => project?.tasks || [], [project]);
    const memberCount = project?.memberIds?.length ?? project?.members?.length ?? 0;

    if (!project) {
        return (
            <div className="p-6 text-center text-zinc-900 dark:text-zinc-200">
                <p className="text-3xl md:text-5xl mt-40 mb-10">Project not found</p>
                <Button variant="contained" color="primary" onClick={() => navigate('/projects')}>
                    Back to Projects
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-5 max-w-6xl mx-auto text-zinc-900 dark:text-white">
            <div className="flex max-md:flex-col gap-4 flex-wrap items-start justify-between max-w-6xl">
                <div className="flex items-center gap-4 flex-wrap">
                    <button className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400" onClick={() => navigate('/projects')}>
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-xl font-medium">{project.name}</h1>
                        <span className={`px-2 py-1 rounded text-xs capitalize ${statusColors[project.status] || statusColors.active}`}>
                            {(project.status || 'active').replace('_', ' ')}
                        </span>
                        {project.status === 'completed' && (
                            <span className={`px-2 py-1 rounded text-xs capitalize ${resultColors[project.result] || 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300'}`}>
                                Result: {project.result || 'not set'}
                            </span>
                        )}
                        <Link
                            to={project.teamId ? `/teams/${project.teamId}` : '/teams'}
                            className="px-2 py-1 rounded text-xs bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:opacity-90"
                        >
                            Team: {team?.name || 'Unknown team'}
                        </Link>
                    </div>
                </div>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PlusIcon size={16} />}
                    onClick={() => setShowCreateTask(true)}
                >
                    New Task
                </Button>
            </div>

            <div className="grid grid-cols-2 sm:flex flex-wrap gap-6">
                {[
                    { label: 'Total Tasks', value: tasks.length, color: 'text-zinc-900 dark:text-white' },
                    {
                        label: 'Completed',
                        value: tasks.filter((t) => t.status === 'DONE').length,
                        color: 'text-emerald-700 dark:text-emerald-400',
                    },
                    {
                        label: 'In Progress',
                        value: tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'TODO').length,
                        color: 'text-amber-700 dark:text-amber-400',
                    },
                    { label: 'Team Members', value: memberCount, color: 'text-blue-700 dark:text-blue-400' },
                ].map((card, idx) => (
                    <div
                        key={idx}
                        className="dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex justify-between sm:min-w-60 p-4 py-2.5 rounded"
                    >
                        <div>
                            <div className="text-sm text-zinc-600 dark:text-zinc-400">{card.label}</div>
                            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                        </div>
                        {card.label === 'Team Members' ? (
                            <UsersIcon className={`size-4 ${card.color}`} />
                        ) : (
                            <ZapIcon className={`size-4 ${card.color}`} />
                        )}
                    </div>
                ))}
            </div>

            <div>
                <div className="inline-flex flex-wrap max-sm:grid grid-cols-3 gap-2 border border-zinc-200 dark:border-zinc-800 rounded overflow-hidden">
                    {[
                        { key: 'tasks', label: 'Tasks', icon: FileStackIcon },
                        { key: 'calendar', label: 'Calendar', icon: CalendarIcon },
                        { key: 'analytics', label: 'Analytics', icon: BarChart3Icon },
                        { key: 'settings', label: 'Settings', icon: SettingsIcon },
                    ].map((tabItem) => (
                        <button
                            key={tabItem.key}
                            onClick={() => {
                                setSearchParams({ tab: tabItem.key });
                            }}
                            className={`flex items-center gap-2 px-4 py-2 text-sm transition-all ${
                                activeTab === tabItem.key
                                    ? 'bg-zinc-100 dark:bg-zinc-800/80'
                                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-700'
                            }`}
                        >
                            <tabItem.icon className="size-3.5" />
                            {tabItem.label}
                        </button>
                    ))}
                </div>

                <div className="mt-6">
                    {activeTab === 'tasks' && (
                        <div className="dark:bg-zinc-900/40 rounded max-w-6xl">
                            <ProjectTasks tasks={tasks} />
                        </div>
                    )}
                    {activeTab === 'analytics' && (
                        <div className="dark:bg-zinc-900/40 rounded max-w-6xl">
                            <ProjectAnalytics tasks={tasks} project={project} />
                        </div>
                    )}
                    {activeTab === 'calendar' && (
                        <div className="dark:bg-zinc-900/40 rounded max-w-6xl">
                            <ProjectCalendar tasks={tasks} />
                        </div>
                    )}
                    {activeTab === 'settings' && (
                        <div className="dark:bg-zinc-900/40 rounded max-w-6xl">
                            <ProjectSettings key={project.id} project={project} />
                        </div>
                    )}
                </div>
            </div>

            {showCreateTask && (
                <CreateTaskDialog
                    showCreateTask={showCreateTask}
                    setShowCreateTask={setShowCreateTask}
                    projectId={projectId}
                />
            )}
        </div>
    );
}
