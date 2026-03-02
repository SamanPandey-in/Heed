import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Search, FolderOpen } from 'lucide-react';

import { ProjectCard, CreateProjectDialog, Button } from '../components';
import { useGetProjectsQuery } from '../store/slices/apiSlice';

export default function Projects() {
    const { currentWorkspace } = useSelector((state) => state.workspace);
    const { data: projects = [], isLoading } = useGetProjectsQuery(
        currentWorkspace?.id,
        { skip: !currentWorkspace?.id }
    );

    const [filteredProjects, setFilteredProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: "ALL",
        priority: "ALL",
    });

    const filterProjects = () => {
        let filtered = projects;

        if (searchTerm) {
            filtered = filtered.filter(
                (project) =>
                    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filters.status !== "ALL") {
            filtered = filtered.filter((project) => project.status === filters.status);
        }

        if (filters.priority !== "ALL") {
            filtered = filtered.filter(
                (project) => project.priority === filters.priority
            );
        }

        setFilteredProjects(filtered);
    };

    useEffect(() => {
        filterProjects();
    }, [projects, searchTerm, filters]);

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1"> Projects </h1>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm"> Manage and track your projects </p>
                </div>
                <Button
                    variant='contained'
                    color='primary'
                    startIcon={<Plus size={16} />}
                    onClick={() => setIsDialogOpen(true)}
                >
                    New Project
                </Button>
                <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-zinc-400 w-4 h-4" />
                    <input onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} className="w-full pl-10 text-sm pr-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:border-blue-500 outline-none" placeholder="Search projects..." />
                </div>
                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white text-sm" >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PLANNING">Planning</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
                <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white text-sm" >
                    <option value="ALL">All Priority</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                </select>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                            <FolderOpen className="w-12 h-12 text-gray-400 dark:text-zinc-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            No projects found
                        </h3>
                        <p className="text-gray-500 dark:text-zinc-400 mb-6 text-sm">
                            Create your first project to get started
                        </p>
                        <button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-1.5 text-white px-4 py-2 rounded mx-auto text-sm" style={{ backgroundColor: 'var(--color-btn-bg)' }}>
                            <Plus className="size-4" />
                            Create Project
                        </button>
                    </div>
                ) : (
                    filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))
                )}
            </div>
        </div>
    );
}
