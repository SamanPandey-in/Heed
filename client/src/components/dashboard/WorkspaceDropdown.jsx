import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, Check, Plus } from 'lucide-react';

import { setCurrentWorkspace } from '../../store';
import { useCreateWorkspaceMutation } from '../../store/slices/apiSlice';
import toast from 'react-hot-toast';

function WorkspaceDropdown() {

    const { workspaces } = useSelector((state) => state.workspace);
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const [isOpen, setIsOpen] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const dropdownRef = useRef(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [createWorkspace, { isLoading: isCreating }] = useCreateWorkspaceMutation();

    const onSelectWorkspace = (organizationId) => {
        dispatch(setCurrentWorkspace(organizationId))
        setIsOpen(false);
        navigate('/')
    }

    const handleCreateWorkspace = async (e) => {
        e.preventDefault();
        if (!newWorkspaceName.trim()) return;
        try {
            await createWorkspace({ name: newWorkspaceName.trim() }).unwrap();
            setNewWorkspaceName('');
            setShowCreateForm(false);
            setIsOpen(false);
            toast.success('Workspace created');
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to create workspace');
        }
    };

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setShowCreateForm(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative m-4" ref={dropdownRef}>
            <button onClick={() => setIsOpen(prev => !prev)} className="w-full flex items-center justify-between p-3 h-auto text-left rounded hover:bg-gray-100 dark:hover:bg-white/5" >
                <div className="flex items-center gap-3">
                    <img src={currentWorkspace?.imageUrl} alt={currentWorkspace?.name} className="w-8 h-8 rounded shadow" />
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                            {currentWorkspace?.name || "Select Workspace"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                            {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-zinc-400 flex-shrink-0" />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-64 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded shadow-lg top-full left-0">
                    <div className="p-2">
                        <p className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2 px-2">
                            Workspaces
                        </p>
                        {workspaces.map((ws) => (
                            <div key={ws.id} onClick={() => onSelectWorkspace(ws.id)} className="flex items-center gap-3 p-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-white/5" >
                                <img src={ws.imageUrl} alt={ws.name} className="w-6 h-6 rounded" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                        {ws.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                                        {ws._count?.members || 0} members
                                    </p>
                                </div>
                                {currentWorkspace?.id === ws.id && (
                                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                                )}
                            </div>
                        ))}
                    </div>

                    <hr className="border-gray-200 dark:border-white/10" />

                    {showCreateForm ? (
                        <form onSubmit={handleCreateWorkspace} className="p-2">
                            <input
                                type="text"
                                value={newWorkspaceName}
                                onChange={(e) => setNewWorkspaceName(e.target.value)}
                                placeholder="Workspace name"
                                className="w-full px-3 py-1.5 text-sm rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                autoFocus
                                required
                            />
                            <div className="flex gap-2 mt-2">
                                <button type="submit" disabled={isCreating} className="flex-1 px-3 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50">
                                    {isCreating ? 'Creating...' : 'Create'}
                                </button>
                                <button type="button" onClick={() => { setShowCreateForm(false); setNewWorkspaceName(''); }} className="px-3 py-1 text-xs rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="p-2 cursor-pointer rounded group hover:bg-gray-100 dark:hover:bg-white/5" onClick={() => setShowCreateForm(true)} >
                            <p className="flex items-center text-xs gap-2 my-1 w-full group-hover:text-gray-700 dark:group-hover:text-gray-300" style={{ color: 'var(--color-primary)' }}>
                                <Plus className="w-4 h-4" /> Create Workspace
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default WorkspaceDropdown;