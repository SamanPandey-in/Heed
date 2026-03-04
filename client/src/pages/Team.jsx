import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Activity, FolderOpen, Shield, UserPlus, UsersIcon } from 'lucide-react';

import { Button, InviteMemberDialog, ProjectSection, TeamMembersSection } from '../components';
import {
    selectTeamById,
    selectTeamMembers,
    selectTeamProjects,
    selectTeamProjectsByStatus,
} from '../store';

const Team = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const currentTeamId = useSelector((state) => state.user.currentTeamId);
    const currentTeam = useSelector((state) => selectTeamById(state, currentTeamId));
    const teamMembers = useSelector((state) => selectTeamMembers(state, currentTeamId));
    const teamProjects = useSelector((state) => selectTeamProjects(state, currentTeamId));
    const teamProjectsByStatus = useSelector((state) => selectTeamProjectsByStatus(state, currentTeamId));

    const filteredMembers = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        if (!normalizedSearch) return teamMembers;

        return teamMembers.filter(
            (member) =>
                member?.name?.toLowerCase().includes(normalizedSearch) ||
                member?.email?.toLowerCase().includes(normalizedSearch)
        );
    }, [teamMembers, searchTerm]);

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">Team</h1>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm">
                        Manage team members and team-owned projects
                    </p>
                </div>
                <Button
                    variant='contained'
                    color='primary'
                    startIcon={<UserPlus size={16} />}
                    onClick={() => setIsDialogOpen(true)}
                >
                    Invite Member
                </Button>
                <InviteMemberDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            </div>

            <div className="flex flex-wrap gap-4">
                <div className="max-sm:w-full dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-300 dark:border-zinc-800 rounded-lg p-6">
                    <div className="flex items-center justify-between gap-8 md:gap-22">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Team Members</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{teamMembers.length}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/10">
                            <UsersIcon className="size-4 text-blue-500 dark:text-blue-200" />
                        </div>
                    </div>
                </div>

                <div className="max-sm:w-full dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-300 dark:border-zinc-800 rounded-lg p-6">
                    <div className="flex items-center justify-between gap-8 md:gap-22">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Current Team</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {currentTeam?.name || "No Team"}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
                            <Activity className="size-4 text-emerald-500 dark:text-emerald-200" />
                        </div>
                    </div>
                </div>

                <div className="max-sm:w-full dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-300 dark:border-zinc-800 rounded-lg p-6">
                    <div className="flex items-center justify-between gap-8 md:gap-22">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Team Projects</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{teamProjects.length}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-500/10">
                            <FolderOpen className="size-4 text-purple-500 dark:text-purple-200" />
                        </div>
                    </div>
                </div>

                <div className="max-sm:w-full dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-300 dark:border-zinc-800 rounded-lg p-6">
                    <div className="flex items-center justify-between gap-8 md:gap-22">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Team Description</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white text-ellipsis line-clamp-1">
                                {currentTeam?.description || "No description"}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-500/10">
                            <Shield className="size-4 text-amber-500 dark:text-amber-200" />
                        </div>
                    </div>
                </div>
            </div>

            <TeamMembersSection
                members={teamMembers}
                filteredMembers={filteredMembers}
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
            />

            <div className="grid lg:grid-cols-3 gap-4">
                <ProjectSection title="Active Projects" projects={teamProjectsByStatus.active} />
                <ProjectSection title="Completed Projects" projects={teamProjectsByStatus.completed} />
                <ProjectSection title="Deprecated Projects" projects={teamProjectsByStatus.deprecated} />
            </div>
        </div>
    );
};

export default Team;
