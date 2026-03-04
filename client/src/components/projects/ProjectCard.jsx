import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectTeamById } from '../../store';

const statusColors = {
    active: "text-gray-900 dark:text-gray-100",
    completed: "text-gray-900 dark:text-gray-100",
    deprecated: "text-gray-900 dark:text-gray-100",
};

const ProjectCard = ({ project }) => {
    const team = useSelector((state) => selectTeamById(state, project.teamId));

    return (
        <Link to={`/projectsDetail?id=${project.id}&tab=tasks`} className="bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 rounded-lg p-5 transition-all duration-200 group">
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
                <span className={`px-2 py-0.5 rounded text-xs ${statusColors[project.status] || statusColors.active}`} style={{backgroundColor: 'var(--color-surface-variant)'}}>
                    {(project.status || "active").replace("_", " ")}
                </span>
                <span className="text-xs text-gray-500 dark:text-zinc-500 capitalize">
                    {project.priority} priority
                </span>
            </div>

            <p className="text-xs text-gray-500 dark:text-zinc-500 mb-3">
                Team: {team?.name || "Unknown team"}
            </p>

            {/* Progress */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-zinc-500">Progress</span>
                    <span className="text-gray-400 dark:text-zinc-400">{project.progress || 0}%</span>
                </div>
                <div className="w-full h-1.5 rounded" style={{backgroundColor: 'var(--color-border)'}}>
                    <div className="h-1.5 rounded" style={{ width: `${project.progress || 0}%`, backgroundColor: 'var(--color-primary)' }} />
                </div>
            </div>

            </Link>
    );
};

export default ProjectCard;
