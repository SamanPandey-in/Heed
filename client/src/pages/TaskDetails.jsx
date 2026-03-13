import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button, Chip, TextField, Typography } from '@mui/material';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { CalendarIcon, MessageCircle, PenIcon } from 'lucide-react';

import { assets } from '../assets/assets';
import { selectProjectById, selectTaskById } from '../store';

const TaskDetails = () => {

    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("projectId");
    const taskId = searchParams.get("taskId");

    const user = { id : 'user_1'}
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    const project = useSelector((state) => selectProjectById(state, projectId));
    const task = useSelector((state) => selectTaskById(state, taskId));
    const loading = !task;

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {

            toast.loading("Adding comment...");

            //  Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const dummyComment = { id: Date.now(), user: { id: 1, name: "User", image: assets.profile_img_a }, content: newComment, createdAt: new Date() };
            
            setComments((prev) => [...prev, dummyComment]);
            setNewComment("");
            toast.dismiss();
            toast.success("Comment added.");
        } catch (error) {
            toast.dismiss();
            toast.error(error?.response?.data?.message || error.message);
            console.error(error);
        }
    };

    // Removed fetchTaskDetails effect - data comes directly from selectors

    // Comments polling removed - can be re-added when backend supports it

    if (loading) return <div className="text-gray-500 dark:text-zinc-400 px-4 py-6">Loading task details...</div>;
    if (!task) return <Typography color="error" sx={{ px: 2, py: 3 }}>Task not found.</Typography>;

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-6 sm:p-4 text-gray-900 dark:text-zinc-100 max-w-6xl mx-auto">
            {/* Left: Comments / Chatbox */}
            <div className="w-full lg:w-2/3">
                <div className="p-5 rounded-md  border border-gray-300 dark:border-zinc-800  flex flex-col lg:h-[80vh]">
                    <h2 className="text-base font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                        <MessageCircle className="size-5" /> Task Discussion ({comments.length})
                    </h2>

                    <div className="flex-1 md:overflow-y-scroll no-scrollbar">
                        {comments.length > 0 ? (
                            <div className="flex flex-col gap-4 mb-6 mr-2">
                                {comments.map((comment) => (
                                    <div key={comment.id} className={`sm:max-w-4/5 dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-900 border border-gray-300 dark:border-zinc-700 p-3 rounded-md ${comment.user.id === user?.id ? "ml-auto" : "mr-auto"}`} >
                                        <div className="flex items-center gap-2 mb-1 text-sm text-gray-500 dark:text-zinc-400">
                                            <img src={comment.user.image} alt="avatar" className="size-5 rounded-full" />
                                            <span className="font-medium text-gray-900 dark:text-white">{comment.user.name}</span>
                                            <span className="text-xs text-gray-400 dark:text-zinc-600">
                                                • {format(new Date(comment.createdAt), "dd MMM yyyy, HH:mm")}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-900 dark:text-zinc-200">{comment.content}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-zinc-500 mb-4 text-sm">No comments yet. Be the first!</p>
                        )}
                    </div>

                    {/* Add Comment */}
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
                        >
                            Post
                        </Button>
                    </div>
                </div>
            </div>

            {/* Right: Task + Project Info */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6">
                {/* Task Info */}
                <div className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 ">
                    <div className="mb-3">
                        <h1 className="text-lg font-medium text-gray-900 dark:text-zinc-100">{task.title}</h1>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <Chip label={task.status} size="small" />
                            <Chip label={task.type} size="small" />
                            <Chip label={task.priority} size="small" />
                        </div>
                    </div>

                    {task.description && (
                        <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed mb-4">{task.description}</p>
                    )}

                    <hr className="border-zinc-200 dark:border-zinc-700 my-3" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-zinc-300">
                        <div className="flex items-center gap-2">
                            <img src={task.assignee?.image} className="size-5 rounded-full" alt="avatar" />
                            {task.assignee?.name || "Unassigned"}
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="size-4 text-gray-500 dark:text-zinc-500" />
                            Due : {task.due_date ? format(new Date(task.due_date), "dd MMM yyyy") : "No date set"}
                        </div>
                    </div>
                </div>

                {/* Project Info */}
                {project && (
                    <div className="p-4 rounded-md bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-gray-300 dark:border-zinc-800 ">
                        <p className="text-xl font-medium mb-4">Project Details</p>
                        <h2 className="text-gray-900 dark:text-zinc-100 flex items-center gap-2"> <PenIcon className="size-4" /> {project.name}</h2>
                        <p className="text-xs mt-3">Project Start Date: {project.start_date ? format(new Date(project.start_date), "dd MMM yyyy") : "No date set"}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-zinc-400 mt-3">
                            <span>Status: {project.status}</span>
                            <span>Priority: {project.priority}</span>
                            <span>Progress: {project.progress}%</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskDetails;
