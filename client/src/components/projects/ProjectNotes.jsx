import { useEffect, useRef, useState } from 'react';
import { Button, TextField, IconButton, Divider } from '@mui/material';
import { Plus, Trash2, Link as LinkIcon, MessageCircle, ExternalLink, Pencil } from 'lucide-react';
import {
    useCreateProjectNotesMessageMutation,
    useGetCurrentUserQuery,
    useGetProjectNotesMessagesQuery,
    useUpdateProjectMutation,
} from '../../store/slices/apiSlice';

export default function ProjectNotes({ project }) {
    const [updateProject] = useUpdateProjectMutation();
    const { data: currentUserData } = useGetCurrentUserQuery();
    const { data: messagesData, isLoading: isMessagesLoading } = useGetProjectNotesMessagesQuery(project?.id, {
        skip: !project?.id,
    });
    const [createProjectNotesMessage] = useCreateProjectNotesMessageMutation();

    const [messageInput, setMessageInput] = useState('');
    const [links, setLinks] = useState(project?.links || []);
    const [newLink, setNewLink] = useState({ label: '', url: '' });
    const [editingLink, setEditingLink] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [error, setError] = useState('');
    const messagesContainerRef = useRef(null);

    const messages = messagesData?.messages || [];
    const currentUser = currentUserData?.user;

    useEffect(() => {
        setLinks(project?.links || []);
    }, [project]);

    useEffect(() => {
        if (!messagesContainerRef.current) return;
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }, [messages.length]);

    const persistLinks = async (updatedLinks) => {
        setIsSaving(true);
        setError('');
        try {
            await updateProject({
                id: project.id,
                links: updatedLinks,
            }).unwrap();
        } catch (err) {
            setError(err?.data?.message || 'Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendMessage = async () => {
        if (!project?.id || !messageInput.trim()) return;
        setError('');
        setIsSendingMessage(true);
        try {
            await createProjectNotesMessage({
                projectId: project.id,
                content: messageInput,
            }).unwrap();
            setMessageInput('');
        } catch (err) {
            setError(err?.data?.message || 'Failed to send message');
        } finally {
            setIsSendingMessage(false);
        }
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
        await persistLinks(updatedLinks);
    };

    const removeLink = async (id) => {
        const updatedLinks = links.filter(l => l.id !== id);
        setLinks(updatedLinks);
        await persistLinks(updatedLinks);
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
        await persistLinks(updatedLinks);
    };

    const cardClasses = "rounded-lg border p-6 not-dark:bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-sm";

    const formatDateTime = (value) => {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return date.toLocaleString([], {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={`${cardClasses} lg:col-span-2`}>
                <div className="flex items-center gap-2 mb-6">
                    <div className="flex items-center gap-2">
                        <MessageCircle className="size-5 text-zinc-500" />
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Project Chat</h2>
                    </div>
                </div>

                <div
                    ref={messagesContainerRef}
                    className="rounded-md border border-zinc-200 dark:border-zinc-700 p-4 h-100 overflow-y-auto no-scrollbar bg-white dark:bg-zinc-900/70"
                >
                    {isMessagesLoading ? (
                        <p className="text-sm text-zinc-500">Loading messages...</p>
                    ) : messages.length === 0 ? (
                        <p className="text-sm text-zinc-500">No messages yet. Start the conversation.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {messages.map((item) => {
                                const isMine = item.user?.id === currentUser?.id;

                                return (
                                    <div
                                        key={item.id}
                                        className={`max-w-[85%] rounded-md border p-3 ${
                                            isMine
                                                ? 'ml-auto border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80'
                                                : 'mr-auto border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                {item.user?.fullName || item.user?.username || 'Unknown User'}
                                            </span>
                                            <span className="text-xs text-zinc-500">{formatDateTime(item.createdAt)}</span>
                                        </div>
                                        <p className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap wrap-break-word">{item.content}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-end gap-3">
                    <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        maxRows={6}
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Write a message..."
                    />
                    <Button
                        variant="contained"
                        onClick={handleSendMessage}
                        disabled={isSendingMessage || !messageInput.trim()}
                        sx={{ borderRadius: '8px', textTransform: 'none', minWidth: '110px' }}
                    >
                        {isSendingMessage ? 'Sending...' : 'Send'}
                    </Button>
                </div>

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
