import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  selectUserTeamObjects,
  selectCurrentTeamId,
} from '../../store/selectors';
import { Users, Settings, ArrowRight } from 'lucide-react';
import CreateTeamForm from './CreateTeamForm';

const TeamsList = ({ userId, maxTeams = 6 }) => {
  const userTeams = useSelector(selectUserTeamObjects);
  const currentTeamId = useSelector(selectCurrentTeamId);

  const displayTeams = userTeams.slice(0, maxTeams);

  return (
    <div className="bg-white dark:bg-black border border-zinc-200 dark:border-white/10 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          <h2 className="text-md font-semibold text-zinc-800 dark:text-zinc-300">
            Your Teams
          </h2>
          <span className="bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-400 text-xs px-2 py-1 rounded">
            {userTeams.length}
          </span>
        </div>
        <Link
          to="/teams"
          className="text-sm text-zinc-600 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 flex items-center gap-1"
        >
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Teams List or Empty State */}
      <div className="p-4">
        {userTeams.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              You haven't joined any teams yet
            </p>
            <CreateTeamForm userId={userId} />
          </div>
        ) : (
          <div className="space-y-3">
            {displayTeams.map((team) => (
              <Link
                to={`/teams/${team.id}`}
                key={team.id}
                className={`block p-3 rounded-lg border transition-colors ${
                  currentTeamId === team.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                    : 'bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-zinc-900 dark:text-white truncate">
                      {team.name}
                    </h3>
                    {team.description && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate mt-1">
                        {team.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                      <Users className="w-3 h-3" />
                      <span>{team.members.length} member{team.members.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 p-1.5 rounded">
                    <Settings className="w-4 h-4 text-zinc-500 dark:text-zinc-500" />
                  </div>
                </div>
              </Link>
            ))}

            {/* Show "more teams" indicator */}
            {userTeams.length > maxTeams && (
              <div className="p-3 text-center text-sm text-zinc-600 dark:text-zinc-400">
                +{userTeams.length - maxTeams} more team{userTeams.length - maxTeams !== 1 ? 's' : ''}
              </div>
            )}

            {/* Create Team Button */}
            <div className="pt-2 border-t border-zinc-200 dark:border-white/10">
              <CreateTeamForm userId={userId} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsList;
