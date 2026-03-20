import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppShellSkeleton } from '../ui';

import { loadTheme } from '../../store';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const { loading } = useSelector((state) => state.projects)
    const dispatch = useDispatch()

    // Initial load of theme
    useEffect(() => {
        dispatch(loadTheme())
    }, [])

    if (loading) return <AppShellSkeleton />

    return (
        <div className="flex bg-white dark:bg-black text-gray-900 dark:text-slate-100">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col h-screen">
                <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <div className="flex-1 h-full p-6 xl:p-10 xl:px-16 overflow-y-scroll">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Layout