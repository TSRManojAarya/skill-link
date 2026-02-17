import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Menu, Briefcase, Settings } from 'lucide-react';
import { UserRole } from '../types';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18 py-3">
          <div className="flex items-center">
            <Link to={user?.role === UserRole.PROVIDER ? "/dashboard" : "/search"} className="flex items-center gap-2.5 group">
              <div className="bg-emerald-600 p-2 rounded-lg group-hover:bg-emerald-700 transition-colors">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                Skill-Link
              </span>
            </Link>
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-1">
            {isAuthenticated ? (
              <>
                {/* Logic Change: Hide Search for Providers */}
                {user?.role !== UserRole.PROVIDER && (
                   <NavLink to="/search" active={isActive('/search')} label="Find Services" />
                )}
                
                <NavLink to="/dashboard" active={isActive('/dashboard')} label={user?.role === UserRole.ADMIN ? "Admin Console" : "Dashboard"} />
                <NavLink to="/messages" active={isActive('/messages')} label="Messages" />
                
                <div className="h-8 w-px bg-gray-200 mx-3"></div>

                <div className="flex items-center gap-3 pl-1">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-800 leading-none">{user?.name}</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 mt-1">
                      {user?.role.toLowerCase()}
                    </span>
                  </div>
                  
                  {/* Settings / Profile Dropdown Trigger */}
                  <div className="relative group">
                    <div className="cursor-pointer">
                        <img 
                        src={user?.avatarUrl} 
                        alt="Profile" 
                        className="h-10 w-10 rounded-lg object-cover border-2 border-gray-100 group-hover:border-emerald-200 transition-all"
                        />
                    </div>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                        <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-600 font-medium">
                            <Settings size={16} /> Settings
                        </Link>
                        <button
                        onClick={logout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-slate-600 hover:text-emerald-600 px-2 py-2 text-sm font-bold transition-colors">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald-600 text-white hover:bg-emerald-700 px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
             <Link to="/settings" className="p-2 mr-2 text-slate-500">
                <Settings className="h-6 w-6" />
             </Link>
            <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, active, label }: { to: string; active: boolean; label: string }) => (
  <Link
    to={to}
    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
      active
        ? 'bg-emerald-50 text-emerald-700'
        : 'text-slate-500 hover:text-slate-900 hover:bg-gray-50'
    }`}
  >
    {label}
  </Link>
);