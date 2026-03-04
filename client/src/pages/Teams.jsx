import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, InputAdornment, TextField } from '@mui/material';
import { KeyRound, PlusCircle, UsersIcon } from 'lucide-react';
import tokens from '../theme/tokens';

import CreateTeamForm from '../components/team/CreateTeamForm';
import {
    clearTeamsError,
    joinTeamByIdentifierAtomic,
    selectCurrentUserId,
    selectTeamsByUser,
    selectTeamsError,
} from '../store';

export const Teams = () => {
    const dispatch = useDispatch();
    const currentUserId = useSelector(selectCurrentUserId);
    const userTeams = useSelector((state) => selectTeamsByUser(state, currentUserId));
    const teamsError = useSelector(selectTeamsError);

    const [joinIdentifier, setJoinIdentifier] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    const teamsWithProjectCount = useMemo(
        () =>
            userTeams.map((team) => ({
                ...team,
                projectsCount: team.projectIds?.length || 0,
            })),
        [userTeams]
    );

    const handleJoinTeam = (e) => {
        e.preventDefault();

        if (!joinIdentifier.trim()) return;
        if (!currentUserId) return;

        setIsJoining(true);
        const actionResult = dispatch(
            joinTeamByIdentifierAtomic({ identifier: joinIdentifier.trim(), userId: currentUserId })
        );

        setIsJoining(false);

        if (actionResult) {
            setJoinIdentifier('');
            dispatch(clearTeamsError());
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">Teams</h1>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm">
                        Teams where you are a member
                    </p>
                </div>
                <CreateTeamForm userId={currentUserId} />
            </div>

            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                <form onSubmit={handleJoinTeam} className="flex flex-col md:flex-row gap-3 md:items-end">
                    <div className="flex-1">
                        <label className="text-sm text-zinc-700 dark:text-zinc-300">Join Existing Team</label>
                        <TextField
                            value={joinIdentifier}
                            onChange={(e) => setJoinIdentifier(e.target.value)}
                            placeholder="Enter team ID or invite code"
                            sx={{ mt: 1 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <KeyRound className="size-4" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isJoining || !joinIdentifier.trim()}
                        variant="contained"
                    >
                        {isJoining ? 'Joining...' : 'Join Team'}
                    </Button>
                </form>
                {teamsError && <p className="text-sm text-red-500 mt-2">{teamsError}</p>}
            </div>

            {teamsWithProjectCount.length === 0 ? (
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center space-y-3">
                    <UsersIcon className="size-10 mx-auto text-zinc-400 mb-3" />
                    <p className="text-zinc-600 dark:text-zinc-400">You are not part of any team yet.</p>
                    <div className="flex justify-center">
                        <CreateTeamForm userId={currentUserId} />
                    </div>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamsWithProjectCount.map((team) => (
                        <Link
                            key={team.id}
                            to={`/teams/${team.id}`}
                            className={tokens.cardBgClass}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-200">{team.name}</h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                                        {team.description || 'No description'}
                                    </p>
                                </div>
                                <PlusCircle className="size-4 text-zinc-400" />
                            </div>
                            <div className="mt-4 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                                <p>Members: {team.members?.length || 0}</p>
                                <p>Projects: {team.projectsCount}</p>
                                <p>Invite Code: {team.inviteCode || 'N/A'}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Teams;
