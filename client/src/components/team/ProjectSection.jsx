import { Link } from 'react-router-dom';

const statusColors = {
    ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    PLANNING: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    ON_HOLD: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    COMPLETED: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
    CANCELLED: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
    DEPRECATED: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

const ProjectSection = ({ title, projects = [] }) => {
    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {projects.length}
                </span>
            </div>

            {projects.length === 0 ? (
                <div className="rounded-lg border border-gray-200 dark:border-zinc-800 p-6 text-sm text-gray-500 dark:text-zinc-400">
                    No {title.toLowerCase()}.
                </div>
            ) : (
                <div className="space-y-2">
                    {projects.map((project) => (
                        <Link
                            key={project.id}
                            to={`/projectsDetail?id=${project.id}&tab=tasks`}
                            className="block rounded-lg border border-gray-200 dark:border-zinc-800 p-4 hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{project.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 line-clamp-1">
                                        {project.description || "No description"}
                                    </p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${statusColors[project.status] || statusColors.PLANNING}`}>
                                    {(project.status || "PLANNING").replace("_", " ")}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
};

export default ProjectSection;
