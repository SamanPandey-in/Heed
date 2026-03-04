import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectTeamById } from '../../store';

const statusColors = {
    active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
    completed: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
    deprecated: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300",
};

const resultColors = {
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    failed: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
    ongoing: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
};

const ProjectCard = ({ project }) => {
    const team = useSelector((state) => selectTeamById(state, project.teamId));

    return (
        <Link to={`/projects/${project.id}?tab=tasks`} className="bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 rounded-lg p-5 transition-all duration-200 group">
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
                <span className={`px-2 py-0.5 rounded text-xs capitalize ${statusColors[project.status] || statusColors.active}`}>
                    {(project.status || "active").replace("_", " ")}
                </span>
                <span className="text-xs text-gray-500 dark:text-zinc-500 capitalize">
                    {project.priority} priority
                </span>
            </div>

            {project.status === "completed" && (
                <p className="mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded capitalize ${resultColors[project.result] || "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"}`}>
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
                <div className="w-full h-1.5 rounded" style={{backgroundColor: 'var(--color-border)'}}>
                    <div className="h-1.5 rounded" style={{ width: `${project.progress || 0}%`, backgroundColor: 'var(--color-primary)' }} />
                </div>
            </div>

            </Link>
    );
};

export default ProjectCard;
