import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button, IconButton, MenuItem, TextField } from '@mui/material';
import { Plus, Save, Trash2, UserMinus } from 'lucide-react';
import {
    useDeleteProjectMutation,
    useGetProjectByIdQuery,
    useRemoveProjectMemberMutation,
    useUpdateProjectMutation,
} from '../../store/slices/apiSlice';
import { selectCurrentUserId } from '../../store';
import { ConfirmDialog } from '../ui';
import AddProjectMember from './AddProjectMember';

const allowedStatuses = new Set(['ACTIVE', 'COMPLETED', 'DEPRECATED']);

const normalizeStatus = (status) => {
    const normalized = String(status || 'ACTIVE').trim().toUpperCase();
    return allowedStatuses.has(normalized) ? normalized : 'ACTIVE';
};

const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'DEPRECATED', label: 'Deprecated' },
];

const resultOptions = [
    { value: '', label: 'Not Set' },
    { value: 'success', label: 'Success' },
    { value: 'failed', label: 'Failed' },
    { value: 'ongoing', label: 'Ongoing' },
];

const buildFormData = (project) => ({
    id: project?.id || '',
    name: project?.name || '',
    description: project?.description || '',
    status: normalizeStatus(project?.status),
    result: project?.result || '',
});

const toMemberLabel = (member) => {
    const memberUser = member?.user || member;
    return memberUser?.fullName || memberUser?.username || memberUser?.email || member?.userId || 'Unknown';
};

const toMemberId = (member) => {
    const memberUser = member?.user || member;
    return memberUser?.id || member?.userId || null;
};

export default function ProjectSettings({ project }) {
    const currentUserId = useSelector(selectCurrentUserId);
    const navigate = useNavigate();
    const [updateProject] = useUpdateProjectMutation();
    const [removeProjectMember] = useRemoveProjectMemberMutation();
    const [deleteProjectMutation] = useDeleteProjectMutation();
    const { data: projectData, isLoading: isProjectLoading, isFetching: isProjectFetching, refetch } = useGetProjectByIdQuery(project?.id, {
        skip: !project?.id,
    });

    const activeProject = projectData?.project || project;

    const [formData, setFormData] = useState(() => buildFormData(activeProject));

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null);
    const [isRemovingMember, setIsRemovingMember] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setFormData(buildFormData(activeProject));
    }, [activeProject]);

    const isProjectCreator = activeProject?.createdBy === currentUserId;

    const memberRows = useMemo(() => {
        if (Array.isArray(activeProject?.members) && activeProject.members.length > 0) {
            return activeProject.members
                .map((member) => {
                    const id = toMemberId(member);
                    if (!id) return null;

                    return {
                        id,
                        label: toMemberLabel(member),
                    };
                })
                .filter(Boolean);
        }

        return (activeProject?.memberIds || []).map((memberId) => ({
            id: memberId,
            label: memberId,
        }));
    }, [activeProject]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.id) return;

        setIsSubmitting(true);
        setError('');

        try {
            await updateProject({
                id: formData.id,
                name: formData.name,
                description: formData.description,
                status: formData.status,
                result: formData.status === 'COMPLETED' ? (formData.result || null) : null,
            }).unwrap();
            await refetch();
        } catch (apiError) {
            setError(apiError?.data?.message || 'Failed to update project');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLeaveProjectConfirm = async () => {
        if (!formData.id || !currentUserId) return;

        setLeaveConfirmOpen(false);
        setIsSubmitting(true);
        setError('');

        try {
            await removeProjectMember({ projectId: formData.id, userId: currentUserId }).unwrap();
            navigate('/projects');
        } catch (apiError) {
            setError(apiError?.data?.message || 'Failed to leave project');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLeaveProject = () => {
        setLeaveConfirmOpen(true);
    };

    const handleDeleteProjectConfirm = async () => {
        if (!formData.id) return;

        setDeleteConfirmOpen(false);
        setIsDeleting(true);
        setError('');

        try {
            await deleteProjectMutation(formData.id).unwrap();
            navigate('/projects');
        } catch (apiError) {
            setError(apiError?.data?.message || 'Failed to delete project');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRemoveMemberConfirm = async () => {
        if (!formData.id || !memberToRemove?.id) return;

        setIsRemovingMember(true);
        setError('');

        try {
            await removeProjectMember({ projectId: formData.id, userId: memberToRemove.id }).unwrap();
            await refetch();
            setMemberToRemove(null);
        } catch (apiError) {
            setError(apiError?.data?.message || 'Failed to remove member');
        } finally {
            setIsRemovingMember(false);
        }
    };

    const handleDeleteProject = () => {
        setDeleteConfirmOpen(true);
    };

    const cardClasses = 'rounded-lg border p-6 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800';

    const labelClasses = 'text-sm text-zinc-600 dark:text-zinc-400';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={cardClasses}>
                <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-300 mb-4">Project Details</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className={labelClasses}>Project Name</label>
                        <TextField fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>

                    <div className="space-y-2">
                        <label className={labelClasses}>Description</label>
                        <TextField
                            fullWidth
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            multiline
                            rows={4}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className={labelClasses}>Status</label>
                            <TextField
                                select
                                fullWidth
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        status: e.target.value,
                                        result: e.target.value === 'COMPLETED' ? prev.result : '',
                                    }))
                                }
                            >
                                {statusOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </div>

                        <div className="space-y-2">
                            <label className={labelClasses}>Result</label>
                            <TextField
                                select
                                fullWidth
                                value={formData.result || ""}
                                onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                                disabled={formData.status !== 'COMPLETED'}
                            >
                                {resultOptions.map((option) => (
                                    <MenuItem key={option.value || "not-set"} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {isProjectLoading || isProjectFetching ? <p className="text-xs text-zinc-500">Syncing latest project data...</p> : null}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            {!isProjectCreator && (
                                <Button
                                    type="button"
                                    disabled={isSubmitting || isDeleting || isRemovingMember}
                                    onClick={handleLeaveProject}
                                    variant="outlined"
                                    className="sm:flex-1"
                                >
                                    Leave Project
                                </Button>
                            )}
                            {isProjectCreator && (
                                <Button
                                    type="button"
                                    disabled={isSubmitting || isRemovingMember}
                                    onClick={handleDeleteProject}
                                    variant="outlined"
                                    color="error"
                                    startIcon={<Trash2 className="size-4" />}
                                    className="sm:flex-1"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete Project'}
                                </Button>
                            )}
                        </div>
                        <Button type="submit" disabled={isSubmitting || isDeleting || isRemovingMember} variant="contained" startIcon={<Save className="size-4" />} className="w-full sm:w-auto">
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="space-y-6">
                <div className={cardClasses}>
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-300 mb-4">
                            Team Members <span className="text-sm text-zinc-600 dark:text-zinc-400">({memberRows.length})</span>
                        </h2>
                        <IconButton type="button" onClick={() => setIsDialogOpen(true)} size="small">
                            <Plus className="size-4 text-zinc-900 dark:text-zinc-300" />
                        </IconButton>
                        <AddProjectMember
                            isDialogOpen={isDialogOpen}
                            setIsDialogOpen={setIsDialogOpen}
                            projectId={activeProject?.id}
                        />
                    </div>

                    {memberRows.length > 0 && (
                        <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                            {memberRows.map((member) => (
                                <div key={member.id} className="flex items-center justify-between px-3 py-2 rounded dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-300" >
                                    <span>{member.label}</span>
                                    {isProjectCreator && member.id !== activeProject?.createdBy && (
                                        <Button
                                            type="button"
                                            size="small"
                                            color="error"
                                            variant="text"
                                            startIcon={<UserMinus className="size-4" />}
                                            disabled={isSubmitting || isDeleting || isRemovingMember}
                                            onClick={() => setMemberToRemove(member)}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={leaveConfirmOpen}
                title="Leave Project?"
                message="You will be removed from this project and may not be able to re-join without an invite."
                onConfirm={handleLeaveProjectConfirm}
                onCancel={() => setLeaveConfirmOpen(false)}
            />

            <ConfirmDialog
                open={Boolean(memberToRemove)}
                title="Remove Member?"
                message={memberToRemove ? `Remove ${memberToRemove.label} from this project?` : ''}
                onConfirm={handleRemoveMemberConfirm}
                onCancel={() => setMemberToRemove(null)}
                danger={true}
            />

            <ConfirmDialog
                open={deleteConfirmOpen}
                title="Delete Project?"
                message="This project will be permanently deleted along with all its tasks and data. This action cannot be undone."
                onConfirm={handleDeleteProjectConfirm}
                onCancel={() => setDeleteConfirmOpen(false)}
                danger={true}
            />
        </div>
    );
}
