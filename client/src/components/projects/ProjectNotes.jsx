import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Button, TextField, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Divider, InputAdornment } from '@mui/material';
import { Save, Plus, Trash2, Link as LinkIcon, FileText, ExternalLink } from 'lucide-react';
import { useUpdateProjectMutation } from '../../store/slices/apiSlice';
import { fetchProjects } from '../../store/slices/projectsSlice';

export default function ProjectNotes({ project }) {
    const dispatch = useDispatch();
    const [updateProject] = useUpdateProjectMutation();
    const [notes, setNotes] = useState(project?.notes || '');
    const [links, setLinks] = useState(project?.links || []);
    const [newLink, setNewLink] = useState({ label: '', url: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setNotes(project?.notes || '');
        setLinks(project?.links || []);
    }, [project]);

    const handleSave = async () => {
        setIsSaving(true);
        setError('');
        
        try {
            await updateProject({
                id: project.id,
                notes,
                links,
            }).unwrap();
            // Refresh entity store so other tabs see updated data
            dispatch(fetchProjects());
        } catch (err) {
            setError(err?.data?.message || 'Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    const addLink = () => {
        let url = newLink.url.trim();
        if (!url) return;
        
        // Ensure URLs have protocol to prevent relative redirection
        if (!/^https?:\/\//i.test(url)) {
            url = `https://${url}`;
        }
        
        setLinks([...links, { ...newLink, url, id: Date.now() }]);
        setNewLink({ label: '', url: '' });
    };

    const removeLink = (id) => {
        setLinks(links.filter(l => l.id !== id));
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
                </div>
                
                <TextField
                    fullWidth
                    multiline
                    rows={15}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Document project-wide information, meeting minutes, or technical specs..."
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(0,0,0,0.02)',
                            dark: { backgroundColor: 'rgba(255,255,255,0.02)' },
                            borderRadius: '8px',
                            '& fieldset': { borderColor: 'rgba(0,0,0,0.1)', dark: { borderColor: 'rgba(255,255,255,0.1)' } },
                        },
                        '& .MuiInputBase-input': {
                            fontSize: '0.925rem',
                            lineHeight: 1.6,
                        }
                    }}
                />
                
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {error ? (
                        <p className="text-red-500 text-xs font-medium">{error}</p>
                    ) : (
                        <p className="text-zinc-500 text-xs">Visible to all project members.</p>
                    )}
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<Save className="size-4" />}
                        onClick={handleSave}
                        disabled={isSaving}
                        sx={{ px: 4, borderRadius: '8px', textTransform: 'none' }}
                    >
                        {isSaving ? 'Saving Changes...' : 'Save Project Data'}
                    </Button>
                </div>
            </div>

            <div className="space-y-8 lg:col-span-1">
                <div className={cardClasses}>
                    <div className="flex items-center gap-2 mb-6">
                        <LinkIcon className="size-5 text-zinc-500" />
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Useful Links</h2>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className={labelClasses}>Label</label>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Documentation, Repo, staging, etc."
                                value={newLink.label}
                                onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>URL</label>
                            <div className="flex gap-2">
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="google.com"
                                    value={newLink.url}
                                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                />
                                <Button
                                    variant="outlined"
                                    onClick={addLink}
                                    sx={{ minWidth: 'auto', borderRadius: '8px' }}
                                >
                                    <Plus className="size-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Divider className="my-8" />

                    <div className="space-y-1 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
                        {!links || links.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="bg-zinc-100 dark:bg-zinc-800 size-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <LinkIcon className="size-5 text-zinc-400" />
                                </div>
                                <p className="text-zinc-500 text-xs">No project links yet.</p>
                            </div>
                        ) : (
                            links.map((link) => (
                                <div 
                                    key={link.id} 
                                    className="group flex flex-col p-3 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all relative"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 truncate">
                                                    {link.label || 'Direct Link'}
                                                </span>
                                                <a 
                                                    href={link.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-zinc-400 hover:text-primary transition-colors"
                                                >
                                                    <ExternalLink className="size-3" />
                                                </a>
                                            </div>
                                            <p className="text-[11px] text-zinc-500 truncate">{link.url}</p>
                                        </div>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => removeLink(link.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            sx={{ ml: 1, p: 0.5 }}
                                        >
                                            <Trash2 className="size-3.5 text-zinc-400 hover:text-red-500" />
                                        </IconButton>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
