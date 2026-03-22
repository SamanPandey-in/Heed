import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { MessageCircle, PenIcon, SquarePen, Trash2 } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { CommentsSkeleton, TaskDetailsSkeleton } from '../components/ui';
import { fetchTasks } from '../store';
import {
    useCreateCommentMutation,
    useDeleteCommentMutation,
    useGetCommentsQuery,
    useGetProjectByIdQuery,
    useGetTaskByIdQuery,
    useGetTeamByIdQuery,
    useUpdateTaskMutation,
} from '../store/slices/apiSlice';

const statusOptions = [
    { label: 'Backlog', value: 'BACKLOG' },
    { label: 'To Do', value: 'TODO' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'In Review', value: 'IN_REVIEW' },
    { label: 'Done', value: 'DONE' },
];

const typeOptions = [
    { value: "BUG", label: "Bug" },
    { value: "FEATURE", label: "Feature" },
    { value: "TASK", label: "Task" },
    { value: "IMPROVEMENT", label: "Improvement" },
    { value: "EPIC", label: "Epic" },
    { value: "STORY", label: "Story" },
    { value: "SUB_TASK", label: "Sub-task" },
];

const priorityOptions = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "URGENT", label: "Urgent" },
];

const toSafeDate = (value) => {
    if (!value) return null;
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const toDateInputValue = (value) => {
    const parsed = toSafeDate(value);
    return parsed ? format(parsed, 'yyyy-MM-dd') : '';
};

const getPersonLabel = (person, fallback = 'Unknown') =>
    person?.fullName || person?.username || person?.email || fallback;

const TaskDetails = () => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("projectId");
    const taskId = searchParams.get("taskId");

    const { data: taskData, isLoading: taskLoading, refetch: refetchTask } = useGetTaskByIdQuery(taskId, { skip: !taskId });
    const { data: projectData } = useGetProjectByIdQuery(projectId, { skip: !projectId });
    const { data: commentsData, isLoading: commentsLoading } = useGetCommentsQuery(taskId, { skip: !taskId });

    const task = taskData?.task;
    const project = projectData?.project;
    const comments = commentsData?.comments || [];

    const resolvedTeamId = project?.teamId || task?.project?.teamId;
    const { data: teamData } = useGetTeamByIdQuery(resolvedTeamId, { skip: !resolvedTeamId });

    const teamMembers = useMemo(() => {
        const rawMembers = teamData?.team?.members || [];
        const membersById = new Map();

        rawMembers.forEach((member) => {
            const memberUser = member?.user || member;
            const memberId = memberUser?.id || member?.userId || null;

            if (!memberId || membersById.has(memberId)) return;

            membersById.set(memberId, {
                id: memberId,
                label: getPersonLabel(memberUser, memberId),
            });
        });

        return Array.from(membersById.values());
    }, [teamData]);

    const taskProperties = useMemo(() => {
        if (!task) return [];

        return [
            { label: 'Project', value: project?.name || task.project?.name || '-' },
            { label: 'Assignee', value: getPersonLabel(task.assignee, 'Unassigned') },
            { label: 'Created By', value: getPersonLabel(task.creator, '-') },
            { label: 'Due Date', value: toSafeDate(task.dueDate || task.due_date) ? format(toSafeDate(task.dueDate || task.due_date), "dd MMM yyyy") : 'Not set' },
            { label: 'Created At', value: toSafeDate(task.createdAt) ? format(toSafeDate(task.createdAt), "dd MMM yyyy, HH:mm") : '-' },
            { label: 'Updated At', value: toSafeDate(task.updatedAt) ? format(toSafeDate(task.updatedAt), "dd MMM yyyy, HH:mm") : '-' },
        ];
    }, [project?.name, task]);

    const { user } = useAuth();
    const [newComment, setNewComment] = useState("");
    const [isPostingComment, setIsPostingComment] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState('');
    const [createComment] = useCreateCommentMutation();
    const [deleteComment] = useDeleteCommentMutation();
    const [updateTask] = useUpdateTaskMutation();

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isUpdatingTask, setIsUpdatingTask] = useState(false);
    const [editError, setEditError] = useState('');
    const [editFormData, setEditFormData] = useState({
        title: '',
        description: '',
        status: 'BACKLOG',
        type: 'TASK',
        priority: 'MEDIUM',
        assigneeId: '',
        due_date: '',
    });

    const handleAddComment = async () => {
        if (!newComment.trim() || !taskId) return;

        let loadingToast;

        try {
            setIsPostingComment(true);
            loadingToast = toast.loading("Adding comment...");
            await createComment({ taskId, content: newComment }).unwrap();
            setNewComment("");
            toast.success("Comment added.");
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to add comment');
        } finally {
            if (loadingToast) {
                toast.dismiss(loadingToast);
            }
            setIsPostingComment(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        let loadingToast;

        try {
            setDeletingCommentId(commentId);
            loadingToast = toast.loading('Deleting comment...');
            await deleteComment({ commentId, taskId }).unwrap();
            toast.success("Comment deleted.");
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to delete comment');
        } finally {
            if (loadingToast) {
                toast.dismiss(loadingToast);
            }
            setDeletingCommentId('');
        }
    };

    const openTaskEditDialog = () => {
        if (!task) return;

        setEditFormData({
            title: task.title || '',
            description: task.description || '',
            status: task.status || 'BACKLOG',
            type: task.type || 'TASK',
            priority: task.priority || 'MEDIUM',
            assigneeId: task.assigneeId || '',
            due_date: toDateInputValue(task.dueDate || task.due_date),
        });
        setEditError('');
        setIsEditDialogOpen(true);
    };

    const handleTaskUpdate = async (e) => {
        e.preventDefault();
        if (!taskId || !editFormData.title.trim()) return;

        let loadingToast;

        try {
            setIsUpdatingTask(true);
            setEditError('');
            loadingToast = toast.loading('Saving task changes...');

            await updateTask({
                id: taskId,
                title: editFormData.title,
                description: editFormData.description,
                status: editFormData.status,
                type: editFormData.type,
                priority: editFormData.priority,
                assigneeId: editFormData.assigneeId || null,
                dueDate: editFormData.due_date || null,
            }).unwrap();

            await refetchTask();
            await dispatch(fetchTasks());

            setIsEditDialogOpen(false);
            toast.success('Task updated successfully.');
        } catch (error) {
            const message = error?.data?.message || 'Failed to update task';
            setEditError(message);
            toast.error(message);
        } finally {
            if (loadingToast) {
                toast.dismiss(loadingToast);
            }
            setIsUpdatingTask(false);
        }
    };

    if (taskLoading) return <TaskDetailsSkeleton />;
    if (!task) return <Typography color="error" sx={{ px: 2, py: 3 }}>Task not found.</Typography>;

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-6 sm:p-4 text-gray-900 dark:text-zinc-100 max-w-6xl mx-auto">
            <div className="w-full lg:w-2/3">
                <div className="p-5 rounded-md border border-gray-300 dark:border-zinc-800 flex flex-col lg:h-[80vh]">
                    <h2 className="text-base font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                        <MessageCircle className="size-5" /> Task Discussion ({comments.length})
                    </h2>

                    <div className="flex-1 md:overflow-y-scroll no-scrollbar">
                        {comments.length > 0 ? (
                            <div className="flex flex-col gap-4 mb-6 mr-2">
                                {comments.map((comment) => {
                                    const createdAtDate = toSafeDate(comment.createdAt);

                                    return (
                                        <div key={comment.id} className={`sm:max-w-4/5 dark:bg-linear-to-br dark:from-zinc-800 dark:to-zinc-900 border border-gray-300 dark:border-zinc-700 p-3 rounded-md ${comment.user?.id === user?.id ? "ml-auto" : "mr-auto"}`} >
                                            <div className="flex items-center justify-between gap-2 mb-1 text-sm text-gray-500 dark:text-zinc-400">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900 dark:text-white">{comment.user?.fullName || comment.user?.username}</span>
                                                    <span className="text-xs text-gray-400 dark:text-zinc-600">
                                                        {createdAtDate ? format(createdAtDate, "dd MMM yyyy, HH:mm") : 'Unknown time'}
                                                    </span>
                                                </div>
                                                {comment.user?.id === user?.id && (
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        disabled={deletingCommentId === comment.id}
                                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-900 dark:text-zinc-200">{comment.content}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : commentsLoading ? (
                            <CommentsSkeleton />
                        ) : (
                            <p className="text-gray-600 dark:text-zinc-500 mb-4 text-sm">No comments yet. Be the first!</p>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
                        <TextField
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full"
                            multiline
                            rows={3}
                        />
                        <Button
                            variant='contained'
                            color='primary'
                            onClick={handleAddComment}
                            disabled={isPostingComment || !newComment.trim()}
                        >
                            {isPostingComment ? 'Posting...' : 'Post'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/3 flex flex-col gap-6">
                <div className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                            <h1 className="text-lg font-medium text-gray-900 dark:text-zinc-100">{task.title}</h1>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <Chip label={task.status} size="small" />
                                <Chip label={task.type} size="small" />
                                <Chip label={task.priority} size="small" />
                            </div>
                        </div>
                        <Button
                            type="button"
                            size="small"
                            variant="outlined"
                            startIcon={<SquarePen className="size-4" />}
                            onClick={openTaskEditDialog}
                        >
                            Edit
                        </Button>
                    </div>

                    <div className="mb-4">
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-zinc-500 mb-1">Description</p>
                        <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">
                            {task.description?.trim() || 'No description provided.'}
                        </p>
                    </div>

                    <hr className="border-zinc-200 dark:border-zinc-700 my-3" />

                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-zinc-500">Task Properties</p>
                        {taskProperties.map((prop) => (
                            <div key={prop.label} className="flex items-start justify-between gap-3 py-1.5 border-b border-gray-100 dark:border-zinc-800 last:border-b-0">
                                <span className="text-xs text-gray-500 dark:text-zinc-500">{prop.label}</span>
                                <span className="text-sm text-right text-gray-800 dark:text-zinc-200 break-all">{prop.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {project && (
                    <div className="p-4 rounded-md bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-gray-300 dark:border-zinc-800">
                        <p className="text-xl font-medium mb-4">Project Details</p>
                        <h2 className="text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                            <PenIcon className="size-4" /> {project.name}
                        </h2>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-zinc-400 mt-3">
                            <span>Status: {project.status}</span>
                            <span>Project ID: {project.id}</span>
                        </div>
                    </div>
                )}
            </div>

            <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Edit Task</DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleTaskUpdate} sx={{ mt: 1, display: 'grid', gap: 2 }}>
                        <TextField
                            label="Title"
                            value={editFormData.title}
                            onChange={(e) => setEditFormData((prev) => ({ ...prev, title: e.target.value }))}
                            required
                        />

                        <TextField
                            label="Description"
                            value={editFormData.description}
                            onChange={(e) => setEditFormData((prev) => ({ ...prev, description: e.target.value }))}
                            multiline
                            rows={3}
                        />

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <TextField
                                select
                                label="Status"
                                value={editFormData.status}
                                onChange={(e) => setEditFormData((prev) => ({ ...prev, status: e.target.value }))}
                            >
                                {statusOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                label="Type"
                                value={editFormData.type}
                                onChange={(e) => setEditFormData((prev) => ({ ...prev, type: e.target.value }))}
                            >
                                {typeOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <TextField
                                select
                                label="Priority"
                                value={editFormData.priority}
                                onChange={(e) => setEditFormData((prev) => ({ ...prev, priority: e.target.value }))}
                            >
                                {priorityOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                label="Assignee"
                                value={editFormData.assigneeId}
                                onChange={(e) => setEditFormData((prev) => ({ ...prev, assigneeId: e.target.value }))}
                            >
                                <MenuItem value="">Unassigned</MenuItem>
                                {teamMembers.map((member) => (
                                    <MenuItem key={member.id} value={member.id}>
                                        {member.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <TextField
                            type="date"
                            label="Due Date"
                            value={editFormData.due_date}
                            onChange={(e) => setEditFormData((prev) => ({ ...prev, due_date: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                        />

                        {editError && (
                            <Typography color="error" variant="body2">
                                {editError}
                            </Typography>
                        )}

                        <DialogActions sx={{ px: 0 }}>
                            <Button type="button" variant="outlined" onClick={() => setIsEditDialogOpen(false)} disabled={isUpdatingTask}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" disabled={isUpdatingTask || !editFormData.title.trim()}>
                                {isUpdatingTask ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogActions>
                    </Box>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TaskDetails;
