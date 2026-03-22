import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Chip, Skeleton, Tooltip } from '@mui/material';
import { ArrowLeft, Check, Copy, FolderOpen, Share2, ShieldAlert, UserPlus, UsersIcon } from 'lucide-react';

import { InviteMemberDialog } from '../components';
import { useRemoveTeamMemberMutation } from '../store/slices/apiSlice';

import {
    selectCurrentUserId,
    selectIsUserInTeam,
    selectProjectsByTeam,
    selectTeamById,
    selectTeamMembers,
    selectTeamsLoading,
} from '../store';

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
    const navigate = useNavigate();
    const currentUserId = useSelector(selectCurrentUserId);
    const [removeTeamMember] = useRemoveTeamMemberMutation();

    const team = useSelector((state) => selectTeamById(state, teamId));
    const isUserInTeam = useSelector((state) => selectIsUserInTeam(state, teamId));
    const teamMembers = useSelector((state) => selectTeamMembers(state, teamId));
    const teamProjects = useSelector((state) => selectProjectsByTeam(state, teamId));
    const teamsLoading = useSelector(selectTeamsLoading);

    const [statusFilter, setStatusFilter] = useState('all');
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [leaveError, setLeaveError] = useState('');
    const [codeCopied, setCodeCopied] = useState(false);

    const handleLeaveTeam = async () => {
        if (!teamId || !currentUserId) return;

        const shouldLeave = window.confirm('Leave this team?');
        if (!shouldLeave) return;

        setIsLeaving(true);
        setLeaveError('');

        try {
            await removeTeamMember({ teamId, userId: currentUserId }).unwrap();
            navigate('/teams');
        } catch (error) {
            setLeaveError(error?.data?.message || 'Failed to leave team');
        } finally {
            setIsLeaving(false);
        }
    };

    const handleCopyInviteCode = async () => {
        if (!team?.inviteCode) return;
        try {
            await navigator.clipboard.writeText(team.inviteCode);
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 2000);
        } catch {
            // clipboard access denied or failed silently
        }
    };

    const handleShareInvite = async () => {
        if (!team?.inviteCode) return;
        const inviteUrl = `${window.location.origin}/teams?invite=${team.inviteCode}`;
        const shareMessage = `Join my team "${team.name}" on Heed! Click the link to join: ${inviteUrl}`;
        if (navigator.share) {
            try {
                await navigator.share({ title: `Join ${team.name} on Heed`, text: shareMessage, url: inviteUrl });
            } catch {
                // user cancelled or share failed
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareMessage);
            } catch {
                // clipboard access denied or failed silently
            }
        }
    };

    const filteredProjects = useMemo(() => {
        if (statusFilter === 'all') return teamProjects;
        return teamProjects.filter((project) => normalizeStatus(project.status) === statusFilter);
    }, [teamProjects, statusFilter]);

    if (teamsLoading) return (
        <div className="max-w-6xl mx-auto space-y-6 py-6">
            <Skeleton variant="rectangular" width="50%" height={36} />
            <Skeleton variant="rectangular" width="100%" height={200} />
            <Skeleton variant="rectangular" width="100%" height={200} />
        </div>
    );
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

                {team.inviteCode && (
                    <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">Invite Code:</span>
                        <span className="font-mono text-xs bg-zinc-100 dark:bg-white/5 px-2 py-1 rounded select-all">
                            {team.inviteCode}
                        </span>
                        <Tooltip title={codeCopied ? 'Copied!' : 'Copy invite code'}>
                            <button
                                type="button"
                                onClick={handleCopyInviteCode}
                                className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                            >
                                {codeCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
                            </button>
                        </Tooltip>
                        <Tooltip title="Share invite link">
                            <button
                                type="button"
                                onClick={handleShareInvite}
                                className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                            >
                                <Share2 className="size-4" />
                            </button>
                        </Tooltip>
                    </div>
                )}

                <Button
                    type="button"
                    onClick={() => setIsInviteDialogOpen(true)}
                    variant="contained"
                    startIcon={<UserPlus className="size-4" />}
                    sx={{ mt: 2 }}
                >
                    Add Member
                </Button>
                <Button
                    type="button"
                    onClick={handleLeaveTeam}
                    variant="outlined"
                    disabled={isLeaving}
                    sx={{ mt: 2, ml: 1 }}
                >
                    {isLeaving ? 'Leaving...' : 'Leave Team'}
                </Button>
                {leaveError && <p className="text-sm text-red-500 mt-2">{leaveError}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <UsersIcon className="size-4" />
                        <h2 className="font-semibold">Members ({teamMembers.length})</h2>
                    </div>

                    {teamMembers.length === 0 ? (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">No members found for this team.</p>
                    ) : (
                        <div className="space-y-2 max-h-none md:max-h-80 overflow-y-auto">
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
                            <Button
                                key={filter}
                                type="button"
                                variant={statusFilter === filter ? 'contained' : 'outlined'}
                                size="small"
                                onClick={() => setStatusFilter(filter)}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </Button>
                        ))}
                    </div>

                    {filteredProjects.length === 0 ? (
                        <div className="rounded border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-center">
                            <FolderOpen className="size-8 mx-auto text-zinc-400 mb-2" />
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">No projects found for this team.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-none md:max-h-80 overflow-y-auto">
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
                                            <Chip
                                                size="small"
                                                label={normalizedStatus}
                                                color={
                                                    normalizedStatus === 'completed'
                                                        ? 'success'
                                                        : normalizedStatus === 'deprecated'
                                                            ? 'error'
                                                            : 'default'
                                                }
                                            />
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
