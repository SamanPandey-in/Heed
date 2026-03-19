import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { Button } from '@mui/material';
import { ArrowRight, Calendar, UsersIcon, FolderOpen } from 'lucide-react';
import { selectAllTeams, selectProjectsForUserTeams, selectUserTeams } from '../../store';
import { LinearProgressRounded } from '../ui/ReusableStyled';
import CreateProjectDialog from './CreateProjectDialog';
import tokens from '../../theme/tokens';

const ProjectOverview = () => {
    const statusColors = {
        active: "bg-zinc-200 text-zinc-900 dark:bg-white/10 dark:text-white",
        completed: "bg-zinc-900 text-white dark:bg-white dark:text-black",
        deprecated: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
    };

    const priorityColors = {
        LOW: "border-zinc-300 text-zinc-600 dark:border-white/10 dark:text-zinc-500",
        MEDIUM: "border-zinc-400 text-zinc-700 dark:border-white/20 dark:text-zinc-400",
        HIGH: "border-zinc-900 text-zinc-900 dark:border-white dark:text-white",
    };

    const userTeamIds = useSelector(selectUserTeams);
    const projects = useSelector((state) => selectProjectsForUserTeams(state, userTeamIds));
    const teams = useSelector(selectAllTeams);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const toSafeDate = (value) => {
        if (!value) return null;
        const parsedDate = new Date(value);
        return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
    };

    return (
        <div className={tokens.cardBgClass + " overflow-hidden"}>
            <div className="border-b border-zinc-200 dark:border-white/10 p-4 flex items-center justify-between">
                <h2 className="text-md text-zinc-800 dark:text-zinc-300">Project Overview</h2>
                <Link to={'/projects'} className="text-sm text-zinc-600 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 flex items-center">
                    View all <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
            </div>

            <div className="p-0">
                {projects.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-500 rounded-full flex items-center justify-center">
                            <FolderOpen size={32} />
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400">No projects yet</p>
                        <Button onClick={() => setIsDialogOpen(true)} variant="contained" sx={{ mt: 2 }}>
                            Create your First Project
                        </Button>
                        <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-200 dark:divide-white/10">
                        {projects.slice(0, 5).map((project) => {
                            const teamName = teams.find((team) => team.id === project.teamId)?.name || 'Unknown team';
                            const memberCount = project?.memberIds?.length ?? project?.members?.length ?? 0;

                            return (
                                <Link key={project.id} to={`/projects/${project.id}?tab=tasks`} className="block p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-zinc-800 dark:text-zinc-300 mb-1">
                                            {project.name}
                                        </h3>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                            {project.description || 'No description'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <span className={`text-xs px-2 py-1 rounded ${statusColors[project.status] || statusColors.active}`}>
                                            {(project.status || "active").replace('_', ' ').replaceAll(/\b\w/g, c => c.toUpperCase())}
                                        </span>
                                        <div className={`w-2 h-2 rounded-full border-2 ${priorityColors[project.priority]}`} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500 mb-3">
                                    <div className="flex items-center gap-4">
                                        {memberCount > 0 && (
                                            <div className="flex items-center gap-1">
                                                <UsersIcon className="w-3 h-3" />
                                                {memberCount} members
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            Team: {teamName}
                                        </div>
                                        {toSafeDate(project.endDate || project.end_date) && (
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {format(toSafeDate(project.endDate || project.end_date), "MMM d, yyyy")}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-500 dark:text-zinc-500">Progress</span>
                                        <span className="text-zinc-600 dark:text-zinc-400">{project.progress || 0}%</span>
                                    </div>
                                    <LinearProgressRounded
                                        variant="determinate"
                                        value={project.progress || 0}
                                    />
                                </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProjectOverview;
