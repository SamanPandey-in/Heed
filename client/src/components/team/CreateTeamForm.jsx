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
import { useDispatch, useSelector } from 'react-redux';
import { createTeam, selectTeamsLoading, selectTeamsError } from '../../store';

const CreateTeamForm = ({ onTeamCreated }) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const isSubmitting = useSelector(selectTeamsLoading);
  const serverError = useSelector(selectTeamsError);
  const [localError, setLocalError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLocalError('');
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setLocalError('Team name is required');
      return;
    }

    setLocalError('');

    try {
      const result = await dispatch(createTeam({
        name: formData.name.trim(),
        description: formData.description.trim(),
      })).unwrap();

      resetForm();
      setIsOpen(false);

      if (onTeamCreated) {
        onTeamCreated(result);
      }
    } catch (err) {
      // Error is handled by Redux state (selectTeamsError), 
      // but we can also catch it here if we want local feedback.
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

              {localError && (
                <p className="text-sm text-red-500 mb-2">{localError}</p>
              )}
              {serverError && (
                <p className="text-sm text-red-500 mb-2">{serverError}</p>
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
