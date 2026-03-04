import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  TextField,
} from '@mui/material';
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

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Add Members (optional)
                </label>
                <div className="flex gap-2">
                  <TextField
                    list="team-member-suggestions"
                    name="memberInput"
                    value={formData.memberInput}
                    onChange={handleInputChange}
                    placeholder="Enter user ID or email"
                    className="flex-1"
                    disabled={isSubmitting}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <UserPlus className="size-4" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddMember}
                    disabled={isSubmitting || !formData.memberInput.trim()}
                    variant="contained"
                    startIcon={<UserPlus className="size-4" />}
                  >
                    Add
                  </Button>
                </div>
                <datalist id="team-member-suggestions">
                  {memberSuggestions.map((member) => (
                    <option key={member.id} value={member.id} label={member.label} />
                  ))}
                </datalist>

                {formData.memberIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formData.memberIds.map((memberId) => (
                      <Chip
                        key={memberId}
                        label={memberId}
                        size="small"
                        onDelete={() => handleRemoveMember(memberId)}
                        deleteIcon={<X className="size-3" />}
                      />
                    ))}
                  </div>
                )}
              </div>

              {(teamsError || warningMessage) && (
                <p className={`text-sm ${teamsError ? 'text-red-500' : 'text-amber-600 dark:text-amber-400'}`}>
                  {teamsError || warningMessage}
                </p>
              )}

              <DialogActions sx={{ px: 0, pt: 2 }}>
                <Button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                    dispatch(clearTeamsError());
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
