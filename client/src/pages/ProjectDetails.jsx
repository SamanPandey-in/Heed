import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, Chip, IconButton } from '@mui/material';
import {
    ActivityIcon,
    ArrowLeftIcon,
    BarChart3Icon,
    CalendarIcon,
    FileStackIcon,
    FileTextIcon,
    PlusIcon,
    SettingsIcon,
    ZapIcon,
} from 'lucide-react';

import { KanbanBoard, PresenceIndicator } from '../components';
import { CreateTaskDialog, ProjectActivity, ProjectAnalytics, ProjectCalendar, ProjectNotes, ProjectSettings, ProjectTasks } from '../components';
import { selectProjectById, selectTasksByProjectId, selectTeamById } from '../store';

export default function ProjectDetail() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { projectId } = useParams();
    const navigate = useNavigate();

    const project = useSelector((state) => selectProjectById(state, projectId));
    const team = useSelector((state) => selectTeamById(state, project?.teamId));

    const [showCreateTask, setShowCreateTask] = useState(false);
    const activeTab = searchParams.get('tab') || 'tasks';

    const tasks = useSelector((state) => selectTasksByProjectId(state, projectId));

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
                    <IconButton size="small" onClick={() => navigate('/projects')}>
                        <ArrowLeftIcon className="w-4 h-4" />
                    </IconButton>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-xl font-medium">{project.name}</h1>
                        <Chip
                            size="small"
                            label={(project.status || 'active').replace('_', ' ')}
                            color={
                                project.status === 'completed'
                                    ? 'success'
                                    : project.status === 'deprecated'
                                        ? 'error'
                                        : 'default'
                            }
                        />
                        {project.status === 'completed' && (
                            <Chip
                                size="small"
                                label={`Result: ${project.result || 'not set'}`}
                                color={project.result === 'success' ? 'success' : project.result === 'failed' ? 'error' : 'warning'}
                            />
                        )}
                        <Link
                            to={project.teamId ? `/teams/${project.teamId}` : '/teams'}
                            className="px-2 py-1 rounded text-xs bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:opacity-90"
                        >
                            Team: {team?.name || 'Unknown team'}
                        </Link>
                        <PresenceIndicator projectId={projectId} />
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
                        value: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
                        color: 'text-amber-700 dark:text-amber-400',
                    },
                    {
                        label: 'To Do',
                        value: tasks.filter((t) => t.status === 'TODO').length,
                        color: 'text-slate-700 dark:text-slate-400',
                    },
                ].map((card, idx) => (
                    <div
                        key={idx}
                        className="dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex justify-between sm:min-w-60 p-4 py-2.5 rounded"
                    >
                        <div>
                            <div className="text-sm text-zinc-600 dark:text-zinc-400">{card.label}</div>
                            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                        </div>
                        <ZapIcon className={`size-4 ${card.color}`} />
                    </div>
                ))}
            </div>

            <div>
                <div className="flex overflow-x-auto no-scrollbar border border-zinc-200 dark:border-zinc-800 rounded divide-x divide-zinc-200 dark:divide-zinc-800">
                    {[
                        { key: 'tasks', label: 'Tasks', short: 'Tasks', icon: FileStackIcon },
                        { key: 'notes', label: 'Notes', short: 'Notes', icon: FileTextIcon },
                        { key: 'calendar', label: 'Calendar', short: 'Cal', icon: CalendarIcon },
                        { key: 'analytics', label: 'Analytics', short: 'Stats', icon: BarChart3Icon },
                        { key: 'activity', label: 'Activity', short: 'Act', icon: ActivityIcon },
                        { key: 'settings', label: 'Settings', short: 'Cfg', icon: SettingsIcon },
                        { key: 'kanban', label: 'Kanban', short: 'Kanban', icon: FileStackIcon },
                    ].map((tabItem) => (
                        <Button
                            key={tabItem.key}
                            size="small"
                            variant={activeTab === tabItem.key ? 'contained' : 'text'}
                            onClick={() => {
                                setSearchParams({ tab: tabItem.key });
                            }}
                            className="flex-1 min-w-[100px] flex items-center justify-center gap-2 rounded-none py-2.5"
                        >
                            <tabItem.icon className="size-3.5" />
                            <span className="max-sm:hidden">{tabItem.label}</span>
                            <span className="sm:hidden">{tabItem.short}</span>
                        </Button>
                    ))}
                </div>

                <div className="mt-6">
                    {activeTab === 'tasks' && (
                        <div className="dark:bg-zinc-900/40 rounded max-w-6xl">
                            <ProjectTasks tasks={tasks} projectId={projectId} />
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
                    {activeTab === 'notes' && (
                        <div className="dark:bg-zinc-900/40 rounded max-w-6xl">
                            <ProjectNotes project={project} />
                        </div>
                    )}
                    {activeTab === 'activity' && (
                        <div className="dark:bg-zinc-900/40 rounded max-w-6xl">
                            <ProjectActivity projectId={projectId} />
                        </div>
                    )}
                    {activeTab === 'settings' && (
                        <div className="dark:bg-zinc-900/40 rounded max-w-6xl">
                            <ProjectSettings key={project.id} project={project} />
                        </div>
                    )}
                    {activeTab === 'kanban' && (
                        <div className="dark:bg-zinc-900/40 rounded max-w-6xl">
                            <KanbanBoard tasks={tasks} />
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
