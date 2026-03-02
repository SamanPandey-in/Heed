import { useState, useEffect, useRef } from 'react';
import { MessageSquareIcon, SendIcon } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui';

const ProjectChat = ({ projectId }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const { joinProject, leaveProject, onMessage, offMessage } = useSocket();
    const { user } = useAuth();
    const bottomRef = useRef(null);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // Load existing messages
    useEffect(() => {
        const loadMessages = async () => {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_URL}/messages/project/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setMessages(data.data || []);
        };
        loadMessages();
        joinProject(projectId);
        return () => leaveProject(projectId);
    }, [projectId]);

    // Listen for real-time messages
    useEffect(() => {
        const handler = (msg) => setMessages(prev => [...prev, msg]);
        onMessage(handler);
        return () => offMessage(handler);
    }, [onMessage, offMessage]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const currentInput = input;
        setInput(''); // Optimistic UI: clear input early

        const token = localStorage.getItem('accessToken');
        try {
            await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ projectId, content: currentInput }),
            });
        } catch (error) {
            console.error('Failed to send message:', error);
            // Optionally could add retry logic or show error
        }
    };

    return (
        <div className="flex flex-col h-[500px] border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900/40">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                <MessageSquareIcon className="size-4 text-primary-500" />
                <span className="font-medium text-sm">Project Chat</span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-2">
                        <MessageSquareIcon className="size-8 opacity-20" />
                        <p className="text-xs">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map(m => (
                        <div key={m.id} className={`flex gap-3 ${m.author.id === user?.id ? 'flex-row-reverse' : ''}`}>
                            <div className="size-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0">
                                {m.author.imageUrl ? (
                                    <img src={m.author.imageUrl} alt={m.author.name} className="size-full rounded-full object-cover" />
                                ) : (
                                    m.author.name[0]?.toUpperCase()
                                )}
                            </div>
                            <div className="flex flex-col space-y-1 max-w-[80%]">
                                <div className={`flex items-center gap-2 ${m.author.id === user?.id ? 'flex-row-reverse' : ''}`}>
                                    <span className="text-[10px] font-medium text-zinc-500">{m.author.name}</span>
                                    <span className="text-[10px] text-zinc-400">
                                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className={`px-3 py-2 rounded-2xl text-sm ${m.author.id === user?.id
                                    ? 'bg-primary-600 text-white rounded-tr-none'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 rounded-tl-none border border-zinc-200 dark:border-zinc-700/50'
                                    }`}>
                                    {m.content}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-full dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim()}
                        className="p-2.5 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <SendIcon className="size-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectChat;
