import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { FolderOpenIcon, LayoutDashboardIcon, SettingsIcon, UsersIcon } from 'lucide-react';

import MyTasksSidebar from './MyTasksSidebar';
import ProjectSidebar from './ProjectsSidebar';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {

    const menuItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboardIcon },
        { name: 'Projects', href: '/projects', icon: FolderOpenIcon },
        { name: 'Teams', href: '/teams', icon: UsersIcon },
        { name: 'Settings', href: '/settings', icon: SettingsIcon },
    ]

    const sidebarRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSidebarOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setIsSidebarOpen]);

    return (
        <div ref={sidebarRef} className={`z-10 bg-white dark:bg-black min-w-68 flex flex-col h-screen border-r border-gray-200 dark:border-white/10 max-sm:absolute transition-all ${isSidebarOpen ? 'left-0' : '-left-full'} `} >
            <div className='flex-1 overflow-y-scroll no-scrollbar flex flex-col'>
                <div>
                    <div className='p-4'>
                        {menuItems.map((item) => (
                            <NavLink to={item.href} key={item.name} className={({ isActive }) => `flex items-center gap-3 py-2 px-4 text-gray-800 dark:text-zinc-100 cursor-pointer rounded transition-all  ${isActive ? 'bg-gray-100 dark:bg-white/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`} >
                                <item.icon size={16} />
                                <p className='text-sm truncate'>{item.name}</p>
                            </NavLink>
                        ))}
                    </div>
                    <MyTasksSidebar />
                    <ProjectSidebar />
                </div>


            </div>

        </div>
    )
}

export default Sidebar
