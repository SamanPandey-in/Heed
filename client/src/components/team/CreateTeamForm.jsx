import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, UserPlus, X } from 'lucide-react';

import { dummyUsers } from '../../assets/assets';
import {
  clearTeamsError,
  createTeamAtomic,
  selectCurrentUserId,
  selectTeamsError,
  setTeamsError,
} from '../../store';

const CreateTeamForm = ({ onTeamCreated, userId }) => {
  const dispatch = useDispatch();
  const currentUserId = useSelector(selectCurrentUserId);
  const teamsError = useSelector(selectTeamsError);
  const ownerId = userId || currentUserId;

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    memberInput: '',
    memberIds: [],
  });

  const memberSuggestions = useMemo(
    () =>
      dummyUsers
        .filter((user) => user.id !== ownerId)
        .map((user) => ({ id: user.id, label: `${user.name} (${user.id})` })),
    [ownerId]
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const normalizeMemberId = (value) => {
    const normalized = String(value || '').trim();
    if (!normalized) return '';

    const knownUser = dummyUsers.find(
      (user) =>
        user.id.toLowerCase() === normalized.toLowerCase() ||
        user.email.toLowerCase() === normalized.toLowerCase()
    );

    return knownUser?.id || normalized;
  };

  const handleAddMember = () => {
    const normalizedMemberId = normalizeMemberId(formData.memberInput);

    if (!normalizedMemberId) return;

    if (!ownerId) {
      dispatch(setTeamsError('A valid user is required to create a team'));
      return;
    }

    if (normalizedMemberId === ownerId) {
      dispatch(setTeamsError('Team creator is already included as a member'));
      return;
    }

    if (formData.memberIds.includes(normalizedMemberId)) {
      dispatch(setTeamsError(`${normalizedMemberId} is already added`));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      memberIds: [...prev.memberIds, normalizedMemberId],
      memberInput: '',
    }));
    dispatch(clearTeamsError());
  };

  const handleRemoveMember = (memberId) => {
    setFormData((prev) => ({
      ...prev,
      memberIds: prev.memberIds.filter((id) => id !== memberId),
    }));
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', memberInput: '', memberIds: [] });
    setWarningMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      dispatch(setTeamsError('Team name is required'));
      return;
    }

    if (!ownerId) {
      dispatch(setTeamsError('A valid user is required to create a team'));
      return;
    }

    setIsSubmitting(true);

    const result = dispatch(
      createTeamAtomic({
        id: `team_${Date.now()}`,
        name: formData.name.trim(),
        description: formData.description.trim(),
        createdBy: ownerId,
        initialMemberIds: formData.memberIds,
      })
    );

    setIsSubmitting(false);

    if (!result?.ok) {
      return;
    }

    if (result.warning) {
      setWarningMessage(result.warning);
    } else {
      setWarningMessage('');
    }

    resetForm();
    setIsOpen(false);
    dispatch(clearTeamsError());

    if (onTeamCreated) {
      onTeamCreated(result.teamId);
    }
  };

  return (
    <div>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm rounded-lg hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" />
          Create Team
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg max-w-md w-full border border-zinc-200 dark:border-zinc-700">
            <div className="border-b border-zinc-200 dark:border-zinc-700 p-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Create New Team</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Team Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Marketing Team"
                  maxLength={50}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the purpose of this team..."
                  maxLength={200}
                  rows={3}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{formData.description.length}/200</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Add Members (optional)
                </label>
                <div className="flex gap-2">
                  <input
                    list="team-member-suggestions"
                    name="memberInput"
                    value={formData.memberInput}
                    onChange={handleInputChange}
                    placeholder="Enter user ID or email"
                    className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={handleAddMember}
                    disabled={isSubmitting || !formData.memberInput.trim()}
                    className="px-3 py-2 text-sm rounded bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900 disabled:opacity-50 inline-flex items-center gap-1"
                  >
                    <UserPlus className="size-4" /> Add
                  </button>
                </div>
                <datalist id="team-member-suggestions">
                  {memberSuggestions.map((member) => (
                    <option key={member.id} value={member.id} label={member.label} />
                  ))}
                </datalist>

                {formData.memberIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formData.memberIds.map((memberId) => (
                      <span
                        key={memberId}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 text-xs"
                      >
                        {memberId}
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(memberId)}
                          className="hover:opacity-70"
                          aria-label={`Remove ${memberId}`}
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {(teamsError || warningMessage) && (
                <p className={`text-sm ${teamsError ? 'text-red-500' : 'text-amber-600 dark:text-amber-400'}`}>
                  {teamsError || warningMessage}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                    dispatch(clearTeamsError());
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.name.trim()}
                  className="px-4 py-2 text-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTeamForm;
