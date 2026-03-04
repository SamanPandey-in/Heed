import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, KeyRound, UserPlus, UsersIcon } from 'lucide-react';

import {
    inviteMemberAtomic,
    joinTeamAtomic,
    selectCurrentUserId,
    selectIsUserInTeam,
    selectProjectsByTeamAndStatus,
    selectTeamById,
    selectTeamMembers,
} from '../store';

const statusColors = {
    active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
    deprecated: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
};

const resultColors = {
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    failed: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
    ongoing: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
};

const filterButtons = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'deprecated', label: 'Deprecated' },
];

const TeamDetails = () => {
    const { teamId } = useParams();
    const dispatch = useDispatch();

    const currentUserId = useSelector(selectCurrentUserId);
    const team = useSelector((state) => selectTeamById(state, teamId));
    const isUserInTeam = useSelector((state) => selectIsUserInTeam(state, teamId));
    const members = useSelector((state) => selectTeamMembers(state, teamId));

    const [statusFilter, setStatusFilter] = useState('all');
    const projects = useSelector((state) =>
        selectProjectsByTeamAndStatus(state, teamId, statusFilter)
    );

    const [inviteUserId, setInviteUserId] = useState('');
    const [actionMessage, setActionMessage] = useState('');

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

    const handleJoinTeam = () => {
        if (!currentUserId) return;

        const success = dispatch(joinTeamAtomic({ teamId, userId: currentUserId }));
        setActionMessage(success ? 'Joined team successfully.' : 'Failed to join team.');
    };

    const handleInviteMember = (e) => {
        e.preventDefault();
        if (!inviteUserId.trim()) return;

        const success = dispatch(
            inviteMemberAtomic({ teamId, userId: inviteUserId.trim() })
        );

        if (success) {
            setInviteUserId('');
            setActionMessage('Member invited successfully.');
            return;
        }

        setActionMessage('Failed to invite member.');
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <Link to="/teams" className="text-sm text-zinc-600 dark:text-zinc-400 inline-flex items-center gap-2">
                        <ArrowLeft className="size-4" /> Teams
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                        {team.name}
                    </h1>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm">
                        {team.description || 'No description'}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Invite Code: {team.inviteCode || 'N/A'}
                    </p>
                </div>

                {!isUserInTeam && (
                    <button
                        onClick={handleJoinTeam}
                        className="px-4 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                    >
                        Join Team
                    </button>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <UsersIcon className="size-4" />
                        <h2 className="font-semibold">Members ({members.length})</h2>
                    </div>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                        {members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between rounded border border-zinc-200 dark:border-zinc-800 p-2"
                            >
                                <div>
                                    <p className="text-sm text-zinc-900 dark:text-zinc-200">{member.name}</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{member.email}</p>
                                </div>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">{member.role}</span>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleInviteMember} className="mt-4 flex gap-2">
                        <div className="relative flex-1">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                            <input
                                value={inviteUserId}
                                onChange={(e) => setInviteUserId(e.target.value)}
                                placeholder="Invite user by userId"
                                className="w-full pl-9 pr-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-3 py-2 text-sm rounded bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900 inline-flex items-center gap-1"
                        >
                            <UserPlus className="size-4" /> Invite
                        </button>
                    </form>
                </section>

                <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
                    <div className="flex items-center justify-between gap-2 mb-4">
                        <h2 className="font-semibold">Projects</h2>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{projects.length} shown</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {filterButtons.map((button) => (
                            <button
                                key={button.key}
                                type="button"
                                onClick={() => setStatusFilter(button.key)}
                                className={`px-3 py-1.5 text-xs rounded border ${
                                    statusFilter === button.key
                                        ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-200 dark:text-zinc-900 dark:border-zinc-200'
                                        : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                                }`}
                            >
                                {button.label}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto">
                        {projects.length === 0 ? (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">No projects found for this filter.</p>
                        ) : (
                            projects.map((project) => (
                                <Link
                                    key={project.id}
                                    to={`/projects/${project.id}?tab=tasks`}
                                    className="block rounded border border-zinc-200 dark:border-zinc-800 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{project.name}</p>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                                                {project.description || 'No description'}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-1 items-end">
                                            <span className={`text-xs px-2 py-0.5 rounded capitalize ${statusColors[project.status] || statusColors.active}`}>
                                                {project.status}
                                            </span>
                                            {project.status === 'completed' && (
                                                <span className={`text-xs px-2 py-0.5 rounded capitalize ${resultColors[project.result] || 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                                                    {project.result || 'not set'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </section>
            </div>

            {actionMessage && <p className="text-sm text-zinc-600 dark:text-zinc-300">{actionMessage}</p>}
        </div>
    );
};

export default TeamDetails;
