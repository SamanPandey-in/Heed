import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { XIcon } from 'lucide-react';
import { dummyUsers } from '../../assets/assets';
import { addProject, selectUserTeamObjects } from '../../store';

const CreateProjectDialog = ({ isDialogOpen, setIsDialogOpen }) => {

    const dispatch = useDispatch();

    // Get user's teams
    const userTeams = useSelector(selectUserTeamObjects);
    const currentTeamId = useSelector((state) => state.user.currentTeamId);
    const projectsError = useSelector((state) => state.projects.error);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        teamId: currentTeamId || "",
        status: "PLANNING",
        priority: "MEDIUM",
        start_date: "",
        end_date: "",
        team_members: [],
        team_lead: "",
        progress: 0,
        result: null,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const selectedTeam = useMemo(
        () => userTeams.find((team) => team.id === formData.teamId),
        [formData.teamId, userTeams]
    );

    const teamUserOptions = useMemo(() => {
        const teamMemberIds = selectedTeam?.members || [];
        return teamMemberIds.map((id) => {
            const profile = dummyUsers.find((user) => user.id === id);
            return {
                id,
                name: profile?.name || id,
            };
        });
    }, [selectedTeam]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");

        if (userTeams.length === 0) {
            setSubmitError("You must join a team before creating a project");
            return;
        }

        const validTeamIds = userTeams.map((team) => team.id);
        if (!validTeamIds.includes(formData.teamId)) {
            setSubmitError("Please select a valid team");
            return;
        }

        setIsSubmitting(true);
        const now = new Date().toISOString();
        const memberIds = [...new Set(
            formData.team_lead
                ? [...formData.team_members, formData.team_lead]
                : formData.team_members
        )];

        dispatch(
            addProject({
                id: `project_${Date.now()}`,
                name: formData.name,
                description: formData.description,
                teamId: formData.teamId,
                status: formData.status,
                priority: formData.priority,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
                team_lead: formData.team_lead || null,
                memberIds,
                progress: formData.progress || 0,
                result: formData.result,
                tasks: [],
                createdAt: now,
                updatedAt: now,
                validTeamIds,
            })
        );

        setIsSubmitting(false);
        setIsDialogOpen(false);
        setFormData({
            name: "",
            description: "",
            teamId: currentTeamId || "",
            status: "PLANNING",
            priority: "MEDIUM",
            start_date: "",
            end_date: "",
            team_members: [],
            team_lead: "",
            progress: 0,
            result: null,
        });
    };

    const removeTeamMember = (email) => {
        setFormData((prev) => ({ ...prev, team_members: prev.team_members.filter(m => m !== email) }));
    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur flex items-center justify-center text-left z-50">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-lg text-zinc-900 dark:text-zinc-200 relative">
                <button className="absolute top-3 right-3 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200" onClick={() => setIsDialogOpen(false)} >
                    <XIcon className="size-5" />
                </button>

                <h2 className="text-xl font-medium mb-1">Create New Project</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    Add a new project to your workspace
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Team Selection */}
                    <div>
                        <label className="block text-sm mb-1">Team *</label>
                        <select 
                            value={formData.teamId} 
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    teamId: e.target.value,
                                    team_members: [],
                                    team_lead: "",
                                })
                            } 
                            className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm"
                            required
                        >
                            <option value="">Select a team</option>
                            {userTeams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                        {userTeams.length === 0 && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                You must be a member of a team to create a project
                            </p>
                        )}
                    </div>

                    {/* Project Name */}
                    <div>
                        <label className="block text-sm mb-1">Project Name</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter project name" className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm" required />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm mb-1">Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe your project" className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm h-20" />
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1">Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm" >
                                <option value="PLANNING">Planning</option>
                                <option value="ACTIVE">Active</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm mb-1">Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm" >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1">Start Date</label>
                            <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">End Date</label>
                            <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} min={formData.start_date && new Date(formData.start_date).toISOString().split('T')[0]} className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm" />
                        </div>
                    </div>

                    {/* Lead */}
                    <div>
                        <label className="block text-sm mb-1">Project Lead</label>
                        <select value={formData.team_lead} onChange={(e) => setFormData({ ...formData, team_lead: e.target.value, team_members: e.target.value ? [...new Set([...formData.team_members, e.target.value])] : formData.team_members, })} className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm" >
                            <option value="">No lead</option>
                            {teamUserOptions.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Team Members */}
                    <div>
                        <label className="block text-sm mb-1">Team Members</label>
                        <select className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm"
                            onChange={(e) => {
                                if (e.target.value && !formData.team_members.includes(e.target.value)) {
                                    setFormData((prev) => ({ ...prev, team_members: [...prev.team_members, e.target.value] }));
                                }
                            }}
                        >
                            <option value="">Add team members</option>
                            {teamUserOptions
                                ?.filter((user) => !formData.team_members.includes(user.id))
                                .map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                        </select>

                        {formData.team_members.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.team_members.map((email) => (
                                    <div key={email} className="flex items-center gap-1 bg-blue-200/50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-md text-sm" >
                                        {email}
                                        <button type="button" onClick={() => removeTeamMember(email)} className="ml-1 hover:bg-blue-300/30 dark:hover:bg-blue-500/30 rounded" >
                                            <XIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {(submitError || projectsError) && (
                        <p className="text-sm text-red-600 dark:text-red-400">{submitError || projectsError}</p>
                    )}
                    <div className="flex justify-end gap-3 pt-2 text-sm">
                        <button type="button" onClick={() => setIsDialogOpen(false)} className="px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800" >
                            Cancel
                        </button>
                        <button disabled={isSubmitting || userTeams.length === 0} className="px-4 py-2 rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white dark:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed" >
                            {isSubmitting ? "Creating..." : "Create Project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectDialog;
