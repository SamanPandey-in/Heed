import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FolderOpen, ShieldAlert, UserPlus, UsersIcon } from 'lucide-react';

import { InviteMemberDialog } from '../components';

import {
    selectCurrentUserId,
    selectIsUserInTeam,
    selectProjectsByTeam,
    selectTeamById,
    selectTeamMembers,
} from '../store';

const statusColors = {
    active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
    deprecated: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
};

const normalizeStatus = (status) => {
    const normalized = String(status || '').trim().toLowerCase();
    if (normalized === 'completed' || normalized === 'done') return 'completed';
    if (normalized === 'deprecated' || normalized === 'cancelled' || normalized === 'archived') {
        return 'deprecated';
    }
    return 'active';
};

const TeamDetails = () => {
    const { teamId } = useParams();
    const currentUserId = useSelector(selectCurrentUserId);

    const team = useSelector((state) => selectTeamById(state, teamId));
    const isUserInTeam = useSelector((state) => selectIsUserInTeam(state, teamId));
    const teamMembers = useSelector((state) => selectTeamMembers(state, teamId));
    const teamProjects = useSelector((state) => selectProjectsByTeam(state, teamId));

    const [statusFilter, setStatusFilter] = useState('all');
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

    const filteredProjects = useMemo(() => {
        if (statusFilter === 'all') return teamProjects;
        return teamProjects.filter((project) => normalizeStatus(project.status) === statusFilter);
    }, [teamProjects, statusFilter]);

    if (!team) {
        return (
            <div className="max-w-6xl mx-auto py-10">
                <p className="text-zinc-600 dark:text-zinc-300">Team not found.</p>
                <Link to="/teams" className="text-blue-500 text-sm inline-flex items-center gap-2 mt-3">
                    <ArrowLeft className="size-4" /> Back to Teams
                </Link>
            </div>
        );
    }

    if (!currentUserId || !isUserInTeam) {
        return (
            <div className="max-w-6xl mx-auto py-10 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded border border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300">
                    <ShieldAlert className="size-4" /> Access denied: you are not a member of this team.
                </div>
                <div>
                    <Link to="/teams" className="text-blue-500 text-sm inline-flex items-center gap-2">
                        <ArrowLeft className="size-4" /> Back to Teams
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div>
                <Link to="/teams" className="text-sm text-zinc-600 dark:text-zinc-400 inline-flex items-center gap-2">
                    <ArrowLeft className="size-4" /> Teams
                </Link>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mt-1">{team.name}</h1>
                <p className="text-gray-500 dark:text-zinc-400 text-sm">{team.description || 'No description'}</p>
                <button
                    type="button"
                    onClick={() => setIsInviteDialogOpen(true)}
                    className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded text-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                >
                    <UserPlus className="size-4" />
                    Add Member
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <UsersIcon className="size-4" />
                        <h2 className="font-semibold">Members ({teamMembers.length})</h2>
                    </div>

                    {teamMembers.length === 0 ? (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">No members found for this team.</p>
                    ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {teamMembers.map((member) => (
                                <div key={member.id} className="flex items-center justify-between rounded border border-zinc-200 dark:border-zinc-800 p-2">
                                    <div>
                                        <p className="text-sm text-zinc-900 dark:text-zinc-200">{member.name}</p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{member.email}</p>
                                    </div>
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{member.role}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
                    <div className="flex items-center justify-between gap-2 mb-4">
                        <h2 className="font-semibold">Projects</h2>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{filteredProjects.length} shown</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {['all', 'active', 'completed', 'deprecated'].map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setStatusFilter(filter)}
                                className={`px-3 py-1.5 text-xs rounded border ${
                                    statusFilter === filter
                                        ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-200 dark:text-zinc-900 dark:border-zinc-200'
                                        : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                                }`}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                        ))}
                    </div>

                    {filteredProjects.length === 0 ? (
                        <div className="rounded border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-center">
                            <FolderOpen className="size-8 mx-auto text-zinc-400 mb-2" />
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">No projects found for this team.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {filteredProjects.map((project) => {
                                const normalizedStatus = normalizeStatus(project.status);

                                return (
                                    <Link
                                        key={project.id}
                                        to={`/projects/${project.id}`}
                                        className="block rounded border border-zinc-200 dark:border-zinc-800 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{project.name}</p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                                                    {project.description || 'No description'}
                                                </p>
                                            </div>
                                            <span className={`text-xs px-2 py-0.5 rounded capitalize ${statusColors[normalizedStatus]}`}>
                                                {normalizedStatus}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            <InviteMemberDialog
                isDialogOpen={isInviteDialogOpen}
                setIsDialogOpen={setIsInviteDialogOpen}
                teamId={teamId}
            />
        </div>
    );
};

export default TeamDetails;
