import React from 'react';
import { Activity, LogOut, User, Stethoscope, UserCircle } from 'lucide-react';

interface HeaderProps {
  user?: {
    email: string;
    full_name?: string;
    role?: 'patient' | 'doctor';
  } | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg p-2 shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-linear-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                MedAssist
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">Clinical AI Decision Support</p>
            </div>
          </div>

          {/* User Info & Actions */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                {user.role === 'doctor' ? (
                  <Stethoscope className="w-5 h-5 text-indigo-600" />
                ) : (
                  <UserCircle className="w-5 h-5 text-blue-600" />
                )}
                <div className="text-sm">
                  <div className="font-medium text-slate-800">
                    {user.role === 'doctor' && user.full_name ? `Dr. ${user.full_name}` : (user.full_name || user.email)}
                  </div>
                  <div className="text-xs text-slate-500 capitalize">{user.role || 'User'}</div>
                </div>
              </div>
              
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
