import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createTeam, setError, clearError } from '../../store';
import { Plus } from 'lucide-react';

const CreateTeamForm = ({ onTeamCreated, userId }) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      dispatch(setError('Team name is required'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Generate a simple ID for the new team
      const teamId = `team_${Date.now()}`;
      
      dispatch(createTeam({
        id: teamId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        createdBy: userId,
      }));

      // Reset form
      setFormData({ name: '', description: '' });
      setIsOpen(false);
      dispatch(clearError());

      if (onTeamCreated) {
        onTeamCreated(teamId);
      }
    } catch (error) {
      dispatch(setError('Failed to create team'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Create Team Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm rounded-lg hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" />
          Create Team
        </button>
      )}

      {/* Create Team Form */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg max-w-md w-full border border-zinc-200 dark:border-zinc-700">
            {/* Header */}
            <div className="border-b border-zinc-200 dark:border-zinc-700 p-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Create New Team
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Team Name */}
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
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              {/* Description */}
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
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 resize-none"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {formData.description.length}/200
                </p>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setFormData({ name: '', description: '' });
                    dispatch(clearError());
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
