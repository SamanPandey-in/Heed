import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, UserPlus } from 'lucide-react';

import { dummyUsers } from '../../assets/assets';
import {
    clearTeamsError,
    inviteMemberAtomic,
    selectTeamById,
    selectTeamsError,
} from '../../store';

const InviteMemberDialog = ({ isDialogOpen, setIsDialogOpen, teamId, onInviteSuccess }) => {
    const dispatch = useDispatch();
    const team = useSelector((state) => selectTeamById(state, teamId));
    const teamsError = useSelector(selectTeamsError);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userIdentifier, setUserIdentifier] = useState('');

    const suggestedUsers = useMemo(() => {
        const memberSet = new Set(team?.members || []);
        return dummyUsers.filter((user) => !memberSet.has(user.id));
    }, [team?.members]);

    const resolveUserId = (value) => {
        const normalized = String(value || '').trim();
        if (!normalized) return '';

        const knownUser = dummyUsers.find(
            (user) =>
                user.id.toLowerCase() === normalized.toLowerCase() ||
                user.email.toLowerCase() === normalized.toLowerCase()
        );

        return knownUser?.id || normalized;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const resolvedUserId = resolveUserId(userIdentifier);
        if (!resolvedUserId || !teamId) return;

        setIsSubmitting(true);

        const success = dispatch(inviteMemberAtomic({ teamId, userId: resolvedUserId }));

        setIsSubmitting(false);

        if (success) {
            setUserIdentifier('');
            dispatch(clearTeamsError());
            setIsDialogOpen(false);

            if (onInviteSuccess) {
                onInviteSuccess(resolvedUserId);
            }
        }
    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200">
                <div className="mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <UserPlus className="size-5 text-zinc-900 dark:text-zinc-200" /> Add Team Member
                    </h2>
                    <p className="text-sm text-zinc-700 dark:text-zinc-400">
                        Add a member to <span className="font-medium">{team?.name || 'this team'}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="member-id" className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                            User ID or Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 w-4 h-4" />
                            <input
                                id="member-id"
                                list="team-invite-suggestions"
                                value={userIdentifier}
                                onChange={(e) => setUserIdentifier(e.target.value)}
                                placeholder="e.g. user_2 or john@example.com"
                                className="pl-10 mt-1 w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 text-sm placeholder-zinc-400 dark:placeholder-zinc-500 py-2 focus:outline-none"
                                required
                            />
                            <datalist id="team-invite-suggestions">
                                {suggestedUsers.map((user) => (
                                    <option key={user.id} value={user.id} label={`${user.name} (${user.email})`} />
                                ))}
                            </datalist>
                        </div>
                    </div>

                    {teamsError && <p className="text-sm text-red-500">{teamsError}</p>}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsDialogOpen(false);
                                setUserIdentifier('');
                                dispatch(clearTeamsError());
                            }}
                            className="px-5 py-2 rounded text-sm border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !teamId || !userIdentifier.trim()}
                            className="px-5 py-2 rounded text-sm text-white disabled:opacity-50 hover:opacity-90 transition bg-gradient-to-br from-blue-500 to-blue-600"
                        >
                            {isSubmitting ? 'Adding...' : 'Add Member'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteMemberDialog;
