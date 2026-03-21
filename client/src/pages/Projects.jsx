import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, ButtonGroup } from '@mui/material';
import { Plus, FolderOpen } from 'lucide-react';

import { ProjectCard, CreateProjectDialog } from '../components';
import { selectProjectsByStatus, selectUserTeams } from '../store';

export default function Projects() {
    
    const userTeamIds = useSelector(selectUserTeams);
    const [statusFilter, setStatusFilter] = useState("all");
    const projects = useSelector((state) =>
        selectProjectsByStatus(state, statusFilter, userTeamIds)
    );

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const statusButtons = [
        { key: "all", label: "All" },
        { key: "active", label: "Active" },
        { key: "completed", label: "Completed" },
        { key: "deprecated", label: "Deprecated" },
    ];

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
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

            <div className="flex flex-wrap items-center gap-2">
                <ButtonGroup size="small" variant="outlined">
                {statusButtons.map((filter) => (
                    <Button
                        key={filter.key}
                        type="button"
                        onClick={() => setStatusFilter(filter.key)}
                        variant={statusFilter === filter.key ? 'contained' : 'outlined'}
                    >
                        {filter.label}
                    </Button>
                ))}
                </ButtonGroup>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.length === 0 ? (
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
                        <Button
                            variant="contained"
                            onClick={() => setIsDialogOpen(true)}
                            startIcon={<Plus className="size-4" />}
                        >
                            Create Project
                        </Button>
                    </div>
                ) : (
                    projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))
                )}
            </div>
        </div>
    );
}
