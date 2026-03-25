import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, TextField } from '@mui/material';

import {
    useCreateTeamChatMessageMutation,
    useCreateTeamNotesMessageMutation,
    useGetCurrentUserQuery,
    useGetTeamChatMessagesQuery,
    useGetTeamNotesMessagesQuery,
} from '../../store/slices/apiSlice';

const formatDateTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString([], {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function TeamMessagesPanel({ teamId, mode = 'notes' }) {
    const isNotesMode = mode === 'notes';
    const { data: currentUserData } = useGetCurrentUserQuery();

    const {
        data: notesData,
        isLoading: isNotesLoading,
    } = useGetTeamNotesMessagesQuery(teamId, { skip: !teamId || !isNotesMode });

    const {
        data: chatData,
        isLoading: isChatLoading,
    } = useGetTeamChatMessagesQuery(teamId, { skip: !teamId || isNotesMode });

    const [createTeamNotesMessage] = useCreateTeamNotesMessageMutation();
    const [createTeamChatMessage] = useCreateTeamChatMessageMutation();

    const [messageInput, setMessageInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const messagesContainerRef = useRef(null);

    const messages = useMemo(
        () => (isNotesMode ? notesData?.messages || [] : chatData?.messages || []),
        [isNotesMode, notesData?.messages, chatData?.messages]
    );

    const isLoading = isNotesMode ? isNotesLoading : isChatLoading;

    useEffect(() => {
        if (!messagesContainerRef.current) return;
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }, [messages.length]);

    const handleSendMessage = async () => {
        if (!teamId || !messageInput.trim()) return;

        setError('');
        setIsSending(true);

        try {
            const payload = { teamId, content: messageInput.trim() };
            if (isNotesMode) {
                await createTeamNotesMessage(payload).unwrap();
            } else {
                await createTeamChatMessage(payload).unwrap();
            }
            setMessageInput('');
        } catch (err) {
            setError(err?.data?.message || 'Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    const handleMessageKeyDown = (event) => {
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            if (!isSending && messageInput.trim()) {
                handleSendMessage();
            }
        }
    };

    const currentUserId = currentUserData?.user?.id;
    const panelTitle = isNotesMode ? 'Team Notes' : 'Team Chat';
    const inputPlaceholder = isNotesMode ? 'Write a team note...' : 'Write a chat message...';

    return (
        <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
            <h2 className="font-semibold mb-4">{panelTitle}</h2>

            <div
                ref={messagesContainerRef}
                className="rounded-md border border-zinc-200 dark:border-zinc-700 p-4 h-104 overflow-y-auto no-scrollbar bg-white dark:bg-zinc-900/70"
            >
                {isLoading ? (
                    <p className="text-sm text-zinc-500">Loading messages...</p>
                ) : messages.length === 0 ? (
                    <p className="text-sm text-zinc-500">No messages yet. Start collaborating with your team.</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {messages.map((item) => {
                            const isMine = item.user?.id === currentUserId;

                            return (
                                <div
                                    key={item.id}
                                    className={`max-w-[90%] rounded-md border p-3 ${
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
                                    <p className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap wrap-break-word">
                                        {item.content}
                                    </p>
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
                    onChange={(event) => setMessageInput(event.target.value)}
                    onKeyDown={handleMessageKeyDown}
                    placeholder={inputPlaceholder}
                />
                <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={isSending || !messageInput.trim()}
                    sx={{ minWidth: '110px' }}
                >
                    {isSending ? 'Sending...' : 'Send'}
                </Button>
            </div>

            {error && <p className="text-red-500 text-xs mt-4 font-medium">{error}</p>}
        </section>
    );
}
