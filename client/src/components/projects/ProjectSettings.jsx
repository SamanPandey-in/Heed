import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Save, Trash2 } from 'lucide-react';
import { dummyUsers } from '../../assets/assets';

import { deleteProjectAtomic, updateProjectAtomic } from '../../store';
import AddProjectMember from './AddProjectMember';

const toDateInputValue = (value) => {
    if (!value) return "";

    const nextDate = new Date(value);
    if (Number.isNaN(nextDate.getTime())) return "";

    return format(nextDate, "yyyy-MM-dd");
};

const statusOptions = [
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "deprecated", label: "Deprecated" },
];

const resultOptions = [
    { value: "", label: "Not Set" },
    { value: "success", label: "Success" },
    { value: "failed", label: "Failed" },
    { value: "ongoing", label: "Ongoing" },
];

const buildFormData = (project) => ({
    id: project?.id || "",
    name: project?.name || "",
    description: project?.description || "",
    status: project?.status || "active",
    result: project?.result || "",
    priority: project?.priority || "MEDIUM",
    start_date: toDateInputValue(project?.start_date),
    end_date: toDateInputValue(project?.end_date),
    progress: Number(project?.progress || 0),
});

export default function ProjectSettings({ project }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState(() => buildFormData(project));

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        const actionResult = dispatch(
            updateProjectAtomic({
                id: formData.id,
                name: formData.name,
                description: formData.description,
                status: formData.status,
                result: formData.status === "completed" ? (formData.result || null) : null,
                priority: formData.priority,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
                progress: Number(formData.progress || 0),
                updatedAt: new Date().toISOString(),
            })
        );

        setIsSubmitting(false);

        if (!actionResult?.ok) {
            setError(actionResult?.error || "Failed to update project");
        }
    };

    const handleDeleteProject = () => {
        if (!formData.id) return;

        const shouldDelete = window.confirm("Delete this project? This action cannot be undone.");
        if (!shouldDelete) return;

        setIsDeleting(true);
        setError("");

        const actionResult = dispatch(deleteProjectAtomic(formData.id));

        setIsDeleting(false);

        if (!actionResult?.ok) {
            setError(actionResult?.error || "Failed to delete project");
            return;
        }

        navigate("/projects");
    };

    const inputClasses = "w-full px-3 py-2 rounded mt-2 border text-sm dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-300";

    const cardClasses = "rounded-lg border p-6 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800";

    const labelClasses = "text-sm text-zinc-600 dark:text-zinc-400";
    const memberRows = Array.isArray(project?.members)
        ? project.members.map((member) => ({
            id: member?.user?.id || member?.userId,
            label: member?.user?.email || member?.user?.name || member?.userId || "Unknown",
        }))
        : (project?.memberIds || []).map((memberId) => {
            const profile = dummyUsers.find((user) => user.id === memberId);
            return {
                id: memberId,
                label: profile?.email || profile?.name || memberId,
            };
        });

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            <div className={cardClasses}>
                <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-300 mb-4">Project Details</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className={labelClasses}>Project Name</label>
                        <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClasses} required />
                    </div>

                    <div className="space-y-2">
                        <label className={labelClasses}>Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputClasses + " h-24"} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className={labelClasses}>Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        status: e.target.value,
                                        result: e.target.value === "completed" ? prev.result : "",
                                    }))
                                }
                                className={inputClasses}
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className={labelClasses}>Result</label>
                            <select
                                value={formData.result || ""}
                                onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                                className={inputClasses}
                                disabled={formData.status !== "completed"}
                            >
                                {resultOptions.map((option) => (
                                    <option key={option.value || "not-set"} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className={labelClasses}>Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={inputClasses} >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className={labelClasses}>Progress: {formData.progress}%</label>
                            <input type="range" min="0" max="100" step="5" value={formData.progress} onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })} className="w-full accent-blue-500 dark:accent-blue-400" />
                        </div>
                    </div>

                    <div className="space-y-4 grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className={labelClasses}>Start Date</label>
                            <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className={inputClasses} />
                        </div>
                        <div className="space-y-2">
                            <label className={labelClasses}>End Date</label>
                            <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className={inputClasses} />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="flex items-center justify-between gap-2">
                        <button
                            type="button"
                            disabled={isDeleting}
                            onClick={handleDeleteProject}
                            className="flex items-center text-sm justify-center gap-2 border border-red-300 text-red-600 px-4 py-2 rounded disabled:opacity-60"
                        >
                            <Trash2 className="size-4" /> {isDeleting ? "Deleting..." : "Delete Project"}
                        </button>
                        <button type="submit" disabled={isSubmitting || isDeleting} className="flex items-center text-sm justify-center gap-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2 rounded disabled:opacity-60" >
                            <Save className="size-4" /> {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>

            <div className="space-y-6">
                <div className={cardClasses}>
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-300 mb-4">
                            Team Members <span className="text-sm text-zinc-600 dark:text-zinc-400">({memberRows.length})</span>
                        </h2>
                        <button type="button" onClick={() => setIsDialogOpen(true)} className="p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800" >
                            <Plus className="size-4 text-zinc-900 dark:text-zinc-300" />
                        </button>
                        <AddProjectMember
                            isDialogOpen={isDialogOpen}
                            setIsDialogOpen={setIsDialogOpen}
                            projectId={project?.id}
                        />
                    </div>

                    {memberRows.length > 0 && (
                        <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                            {memberRows.map((member) => (
                                <div key={member.id} className="flex items-center justify-between px-3 py-2 rounded dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-300" >
                                    <span>{member.label}</span>
                                    {project.team_lead === member.id && <span className="px-2 py-0.5 rounded-xs ring ring-zinc-200 dark:ring-zinc-600">Team Lead</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
