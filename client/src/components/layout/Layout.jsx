/**
 * BREAKPOINT STRATEGY
 * (default) : 0-639px      | Mobile portrait. No sidebar. Stack everything. Table -> card swap.
 * sm:        : 640-767px    | Mobile landscape/small tablet. Sidebar slides in. 2-col grids.
 * md:        : 768-1023px   | Tablet portrait. Sidebar visible at icon width. 2-3 col grids.
 * lg:        : 1024-1279px  | Tablet landscape. Full sidebar visible with text. 3-col grids.
 * xl:        : 1280-1535px  | Desktop. Max-width container kicks in (max-w-6xl).
 * 2xl:       : >=1536px     | Wide desktop/4K. Comfortable whitespace.
 */

import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppShellSkeleton } from '../ui';

import { loadTheme } from '../../store';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { loading } = useSelector((state) => state.projects);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(loadTheme());
    }, [dispatch]);

    if (loading) return <AppShellSkeleton />;

    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-black">
            {/* Backdrop - mobile only, closes sidebar on tap */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-20 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 xl:px-12">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
