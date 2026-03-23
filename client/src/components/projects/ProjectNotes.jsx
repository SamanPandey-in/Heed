import { useMemo, useState, useEffect } from 'react';
import { Button, TextField, IconButton, Divider, MenuItem } from '@mui/material';
import { Save, Plus, Trash2, Link as LinkIcon, FileText, ExternalLink, Pencil, Eye, PenSquare, AtSign } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { useGetTeamByIdQuery, useUpdateProjectMutation } from '../../store/slices/apiSlice';

export default function ProjectNotes({ project }) {
    const [updateProject] = useUpdateProjectMutation();
    const { data: teamData } = useGetTeamByIdQuery(project?.teamId, { skip: !project?.teamId });
    const [notes, setNotes] = useState(project?.notes || '');
    const [links, setLinks] = useState(project?.links || []);
    const [notesMode, setNotesMode] = useState('write');
    const [selectedMentionId, setSelectedMentionId] = useState('');
    const [newLink, setNewLink] = useState({ label: '', url: '' });
    const [editingLink, setEditingLink] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const teamMembers = useMemo(() => {
        const rawMembers = teamData?.team?.members || [];
        const membersById = new Map();

        rawMembers.forEach((member) => {
            const memberUser = member?.user || member;
            const memberId = memberUser?.id || member?.userId || null;
            if (!memberId || membersById.has(memberId)) return;

            membersById.set(memberId, {
                id: memberId,
                username: memberUser?.username || '',
                displayName: memberUser?.fullName || memberUser?.username || memberUser?.email || memberId,
            });
        });

        return Array.from(membersById.values());
    }, [teamData]);

    const membersByUsername = useMemo(() => {
        const map = new Map();
        teamMembers.forEach((member) => {
            if (member.username) {
                map.set(member.username.toLowerCase(), member);
            }
        });
        return map;
    }, [teamMembers]);

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

    const normalizeMentionsToLinks = (rawMarkdown) => {
        if (!rawMarkdown) return '';

        return rawMarkdown.replace(/(^|[^\w])@([a-zA-Z0-9_.-]+)/g, (match, prefix, username) => {
            const member = membersByUsername.get(username.toLowerCase());
            if (!member) return match;
            return `${prefix}[@${username}](/profile?userId=${member.id})`;
        });
    };

    const handleSaveNotes = () => {
        const normalizedNotes = normalizeMentionsToLinks(notes);
        setNotes(normalizedNotes);
        persistChanges(normalizedNotes, links);
    };

    const insertMention = (memberId) => {
        const member = teamMembers.find((m) => m.id === memberId);
        if (!member) return;

        const mentionUsername = member.username || member.displayName.replace(/\s+/g, '').toLowerCase();
        const mentionMarkdown = `[@${mentionUsername}](/profile?userId=${member.id})`;
        setNotes((prev) => `${prev}${prev && !prev.endsWith(' ') && !prev.endsWith('\n') ? ' ' : ''}${mentionMarkdown}`);
        setSelectedMentionId('');
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
    const notesNavBtn = (active) => `px-3 py-1.5 text-sm rounded-md border transition ${
        active
            ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100 border-zinc-300 dark:border-zinc-600'
            : 'bg-transparent text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
    }`;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={`${cardClasses} lg:col-span-2`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <FileText className="size-5 text-zinc-500" />
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Project Notes</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                className={notesNavBtn(notesMode === 'write')}
                                onClick={() => setNotesMode('write')}
                            >
                                <span className="inline-flex items-center gap-1"><PenSquare className="size-3.5" /> Write</span>
                            </button>
                            <button
                                type="button"
                                className={notesNavBtn(notesMode === 'preview')}
                                onClick={() => setNotesMode('preview')}
                            >
                                <span className="inline-flex items-center gap-1"><Eye className="size-3.5" /> Preview</span>
                            </button>
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
                </div>

                {notesMode === 'write' ? (
                    <div data-color-mode="light" className="rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-700" style={{ minHeight: 380 }}>
                        <MDEditor
                            value={notes}
                            onChange={(value) => setNotes(value || '')}
                            preview="edit"
                            height={380}
                            visibleDragbar={false}
                            textareaProps={{ placeholder: 'Document project-wide information in Markdown...' }}
                        />
                    </div>
                ) : (
                    <div className="rounded-md border border-zinc-200 dark:border-zinc-700 p-4 min-h-95 bg-white dark:bg-zinc-900/70">
                        <MDEditor.Markdown source={normalizeMentionsToLinks(notes)} style={{ background: 'transparent' }} />
                    </div>
                )}

                <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-zinc-500 inline-flex items-center gap-1"><AtSign className="size-3.5" /> Mention:</span>
                    <TextField
                        size="small"
                        select
                        value={selectedMentionId}
                        onChange={(e) => insertMention(e.target.value)}
                        placeholder="Insert @mention"
                        sx={{ minWidth: 240 }}
                    >
                        <MenuItem value="" disabled>Select team member</MenuItem>
                        {teamMembers.map((member) => (
                            <MenuItem key={member.id} value={member.id}>
                                @{member.username || member.displayName} ({member.displayName})
                            </MenuItem>
                        ))}
                    </TextField>
                </div>

                <p className="text-xs text-zinc-500 mt-2">
                    Type <strong>@username</strong> and save, or use the mention selector to insert a profile link.
                </p>

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

                    <div className="space-y-3 max-h-125 overflow-y-auto no-scrollbar pr-1">
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
