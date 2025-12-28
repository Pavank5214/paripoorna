import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home,
    Briefcase,
    Package,
    IndianRupee,
    CheckSquare,
    FileText,
    LogOut,
    Shield,
    Users,
    Database,
    Menu,
    X,
    Map,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { AuthContext } from '../private/AuthContext';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, setUser } = useContext(AuthContext);

    const toggleSidebar = () => setIsOpen(!isOpen);
    const toggleMobile = () => setMobileOpen(!mobileOpen);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: Home },
        { name: 'Projects', path: '/projects', icon: Briefcase },
        { name: 'Materials', path: '/materials', icon: Package },
        { name: 'Costs', path: '/costs', icon: IndianRupee },
        { name: 'Tasks', path: '/tasks', icon: CheckSquare },
        { name: 'Documents', path: '/documents', icon: FileText },
        { name: 'Map View', path: '/projects/map', icon: Map },
    ];

    const adminItems = [
        { name: 'Admin Dashboard', path: '/admin/dashboard', icon: Shield },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Audit Logs', path: '/admin/audit-logs', icon: Database },
    ];

    const isActive = (path) => location.pathname === path;

    const NavItem = ({ item }) => (
        <Link
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-lg mx-2 mb-1 border-l-4 
            ${isActive(item.path)
                    ? 'bg-slate-800 border-amber-500 text-white shadow-md'
                    : 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-amber-400'
                }`}
            onClick={() => setMobileOpen(false)}
        >
            <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive(item.path) ? 'text-amber-500' : 'text-slate-500 group-hover:text-amber-400'}`} />
            <span className={`${!isOpen && 'hidden'} md:${!isOpen && 'hidden'} whitespace-nowrap font-medium tracking-wide`}>
                {item.name}
            </span>
        </Link>
    );

    return (
        <>
            {/* Mobile Hamburger */}
            <button
                className="md:hidden fixed top-4 right-4 z-50 p-2 bg-slate-900 text-amber-500 rounded-md shadow-lg border border-slate-700"
                onClick={toggleMobile}
            >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Container */}
            <div className={`
        fixed inset-y-0 left-0 z-50 transition-all duration-300 transform 
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 
        ${isOpen ? 'w-72' : 'w-20'}
        flex flex-col shadow-2xl h-screen
        bg-slate-900 text-slate-300 border-r border-slate-800
      `}>

                {/* Header/Logo */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950">
                    <Link to="/" className={`font-bold text-2xl tracking-tighter uppercase flex items-center gap-2 ${!isOpen && 'md:hidden'}`}>
                        <div className="bg-amber-500 p-1.5 rounded text-slate-900">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <span className="text-white">Build<span className="text-amber-500">Track</span></span>
                    </Link>
                    <button
                        onClick={toggleSidebar}
                        className="hidden md:flex p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-amber-500 transition-colors items-center justify-center"
                    >
                        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-6 custom-scrollbar bg-slate-900">
                    <div className="mb-3 px-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        {(isOpen || mobileOpen) ? 'Site Navigation' : '...'}
                    </div>
                    {navItems.map((item) => <NavItem key={item.path} item={item} />)}

                    {/* Admin Section */}
                    {user && (user.role === 'admin' || user.role === 'super_admin') && (
                        <>
                            <div className="mt-8 mb-3 px-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                {(isOpen || mobileOpen) ? 'Admin Tools' : '...'}
                            </div>
                            {adminItems.map((item) => <NavItem key={item.path} item={item} />)}
                        </>
                    )}
                </div>

                {/* User Profile / Logout */}
                <div className="border-t border-slate-800 p-4 bg-slate-950">
                    <div className={`flex items-center gap-2 ${!isOpen ? 'justify-center' : ''}`}>
                        <Link
                            to="/profile"
                            className={`flex items-center gap-3 flex-1 min-w-0 group cursor-pointer p-1 rounded-lg hover:bg-slate-900 transition-colors ${!isOpen ? 'justify-center' : ''}`}
                            title="Go to Profile"
                        >
                            <div className="h-10 w-10 rounded bg-slate-800 text-amber-500 group-hover:text-amber-400 group-hover:border-amber-500/50 flex flex-shrink-0 items-center justify-center text-lg font-bold border border-slate-700 transition-colors">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className={`${!isOpen && 'hidden'} md:${!isOpen && 'hidden'} flex-1 min-w-0`}>
                                <p className="text-sm font-bold truncate text-slate-200 group-hover:text-white transition-colors">{user?.name}</p>
                                <p className="text-xs text-slate-500 truncate capitalize group-hover:text-slate-400 transition-colors">{user?.role?.replace('_', ' ')}</p>
                            </div>
                        </Link>

                        <div className={`${!isOpen && 'hidden'} md:${!isOpen && 'hidden'} flex items-center`}>
                            <button
                                onClick={handleLogout}
                                className="text-slate-500 hover:text-rose-500 hover:bg-slate-900 p-2 rounded-lg transition-all"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
