import { useState, useEffect } from 'react';
import { Button, TextField, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Divider, InputAdornment } from '@mui/material';
import { Save, Plus, Trash2, Link as LinkIcon, FileText, ExternalLink, Pencil } from 'lucide-react';
import { useUpdateProjectMutation } from '../../store/slices/apiSlice';

export default function ProjectNotes({ project }) {
    const [updateProject] = useUpdateProjectMutation();
    const [notes, setNotes] = useState(project?.notes || '');
    const [links, setLinks] = useState(project?.links || []);
    const [newLink, setNewLink] = useState({ label: '', url: '' });
    const [editingLink, setEditingLink] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setNotes(project?.notes || '');
        setLinks(project?.links || []);
    }, [project]);

    const persistChanges = async (updatedNotes, updatedLinks) => {
        setIsSaving(true);
        setError('');
        try {
            await updateProject({
                id: project.id,
                notes: updatedNotes,
                links: updatedLinks,
            }).unwrap();
        } catch (err) {
            setError(err?.data?.message || 'Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveNotes = () => {
        persistChanges(notes, links);
    };

    const sanitizeUrl = (url) => {
        let trimmed = url.trim();
        if (!trimmed) return '';
        if (!/^https?:\/\//i.test(trimmed)) {
            return `https://${trimmed}`;
        }
        return trimmed;
    };

    const addLink = async () => {
        const url = sanitizeUrl(newLink.url);
        if (!url) return;

        const updatedLinks = [...links, { ...newLink, url, id: crypto.randomUUID() }];
        setLinks(updatedLinks);
        setNewLink({ label: '', url: '' });
        await persistChanges(notes, updatedLinks);
    };

    const removeLink = async (id) => {
        const updatedLinks = links.filter(l => l.id !== id);
        setLinks(updatedLinks);
        await persistChanges(notes, updatedLinks);
    };

    const startEdit = (link) => {
        setEditingLink({ ...link });
    };

    const saveEdit = async () => {
        if (!editingLink || !editingLink.url.trim()) return;
        const sanitizedUrl = sanitizeUrl(editingLink.url);
        const updatedLinks = links.map(l =>
            l.id === editingLink.id ? { ...editingLink, url: sanitizedUrl } : l
        );
        setLinks(updatedLinks);
        setEditingLink(null);
        await persistChanges(notes, updatedLinks);
    };

    const cardClasses = "rounded-lg border p-6 not-dark:bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-sm";
    const labelClasses = "text-sm text-zinc-600 dark:text-zinc-400 font-medium mb-1.5 block";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={`${cardClasses} lg:col-span-2`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <FileText className="size-5 text-zinc-500" />
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Project Notes</h2>
                    </div>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<Save className="size-4" />}
                        onClick={handleSaveNotes}
                        disabled={isSaving}
                        sx={{ borderRadius: '8px', textTransform: 'none' }}
                    >
                        {isSaving ? 'Saving...' : 'Save Notes'}
                    </Button>
                </div>

                <TextField
                    fullWidth
                    multiline
                    rows={15}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Document project-wide information..."
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(0,0,0,0.02)',
                            borderRadius: '8px',
                            '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' },
                        },
                        '& .MuiInputBase-input': { fontSize: '0.925rem', lineHeight: 1.6 }
                    }}
                />

                {error && <p className="text-red-500 text-xs mt-4 font-medium">{error}</p>}
            </div>

            <div className="space-y-8 lg:col-span-1">
                <div className={cardClasses}>
                    <div className="flex items-center gap-2 mb-6">
                        <LinkIcon className="size-5 text-zinc-500" />
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Useful Links</h2>
                    </div>

                    <div className="space-y-4">
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Label (e.g. Repo)"
                            value={newLink.label}
                            onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                        />
                        <div className="flex gap-2 mt-2">
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="URL (e.g. github.com)"
                                value={newLink.url}
                                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                            />
                            <Button
                                variant="contained"
                                onClick={addLink}
                                disabled={isSaving || !newLink.url.trim()}
                                sx={{ minWidth: 'auto', borderRadius: '8px' }}
                            >
                                <Plus className="size-4" />
                            </Button>
                        </div>
                        </div>

                        {/* spacer between URL input and links list */}
                        <div className="mt-4" />

                    <Divider className="my-8" />

                    <div className="space-y-3 max-h-[500px] overflow-y-auto no-scrollbar pr-1">
                        {!links || links.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-zinc-500 text-xs italic">No project links yet.</p>
                            </div>
                        ) : (
                            links.map((link) => (
                                <div
                                    key={link.id}
                                    className="group p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all"
                                >
                                    {editingLink?.id === link.id ? (
                                        <div className="space-y-2">
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={editingLink.label}
                                                onChange={(e) => setEditingLink({ ...editingLink, label: e.target.value })}
                                            />
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={editingLink.url}
                                                onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button size="small" onClick={() => setEditingLink(null)}>Cancel</Button>
                                                <Button size="small" variant="contained" onClick={saveEdit}>Save</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 truncate">
                                                        {link.label || 'Direct Link'}
                                                    </span>
                                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-primary">
                                                        <ExternalLink className="size-3" />
                                                    </a>
                                                </div>
                                                <p className="text-[11px] text-zinc-500 truncate overflow-hidden whitespace-nowrap block max-w-full">
                                                    {link.url}
                                                </p>
                                            </div>
                                            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                                <IconButton size="small" onClick={() => startEdit(link)}>
                                                    <Pencil className="size-3.5 text-zinc-400" />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => removeLink(link.id)}>
                                                    <Trash2 className="size-3.5 text-zinc-400 hover:text-red-500" />
                                                </IconButton>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
