import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectTeamById } from '../../store';
import { styled } from '@mui/material/styles';
import tokens from '../../theme/tokens';

const ProgressBarBg = styled('div')(() => ({
    width: '100%',
    height: 6,
    borderRadius: 6,
    backgroundColor: 'var(--color-border)',
    overflow: 'hidden',
}));

const ProgressBarFill = styled('div')(() => ({
    height: 6,
    borderRadius: 6,
    backgroundColor: 'var(--color-primary)',
    transition: 'width 0.3s',
}));

const ProjectCard = ({ project }) => {
    const team = useSelector((state) => selectTeamById(state, project.teamId));

    return (
        <Link to={`/projects/${project.id}?tab=tasks`} className={tokens.cardBgClass}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-zinc-200 mb-1 truncate group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                        {project.name}
                    </h3>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm line-clamp-2 mb-3">
                        {project.description || "No description"}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-0.5 rounded text-xs capitalize ${tokens.cardStatusColors[project.status] || tokens.cardStatusColors.active}`}>
                    {(project.status || "active").replace("_", " ")}
                </span>
                <span className="text-xs text-gray-500 dark:text-zinc-500 capitalize">
                    {project.priority} priority
                </span>
            </div>

            {project.status === "completed" && (
                <p className="mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded capitalize ${tokens.cardResultColors[project.result] || "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"}`}>
                        Result: {project.result || "not set"}
                    </span>
                </p>
            )}

            <p className="text-xs text-gray-500 dark:text-zinc-500 mb-3">
                Team: {team?.name || "Unknown team"}
            </p>

            {/* Progress */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-zinc-500">Progress</span>
                    <span className="text-gray-400 dark:text-zinc-400">{project.progress || 0}%</span>
                </div>
                <ProgressBarBg>
                  <ProgressBarFill style={{ width: `${project.progress || 0}%` }} />
                </ProgressBarBg>
            </div>

            </Link>
    );
};

export default ProjectCard;
