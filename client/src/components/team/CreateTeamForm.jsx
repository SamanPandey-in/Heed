import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { Plus } from 'lucide-react';
import { useCreateTeamMutation } from '../../store/slices/apiSlice';

const CreateTeamForm = ({ onTeamCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [createTeam] = useCreateTeamMutation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Team name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await createTeam({
        name: formData.name.trim(),
        description: formData.description.trim(),
      }).unwrap();

      resetForm();
      setIsOpen(false);

      if (onTeamCreated) {
        onTeamCreated(result.team);
      }
    } catch (err) {
      setError(err?.data?.message || 'Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          variant="contained"
          startIcon={<Plus className="w-4 h-4" />}
        >
          Create Team
        </Button>
      )}

      {isOpen && (
        <Dialog open={isOpen} onClose={() => setIsOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>Create New Team</DialogTitle>
            <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, display: 'grid', gap: 2 }}>
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Team Name *
                </label>
                <TextField
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Marketing Team"
                  inputProps={{ maxLength: 50 }}
                  disabled={isSubmitting}
                  autoFocus={true}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Description (optional)
                </label>
                <TextField
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the purpose of this team..."
                  inputProps={{ maxLength: 200 }}
                  multiline
                  rows={3}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{formData.description.length}/200</p>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <DialogActions sx={{ px: 0, pt: 2 }}>
                <Button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.name.trim()}
                  variant="contained"
                >
                  {isSubmitting ? 'Creating...' : 'Create Team'}
                </Button>
              </DialogActions>
            </Box>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CreateTeamForm;
