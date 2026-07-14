'use client';
import React, { useState } from 'react';
import { Menu, Search, Bell, ChevronRight, ChevronDown, Settings, Users, LogOut } from 'lucide-react';

interface HeaderProps {
  activeId: string;
  user: { name: string; role: string; email: string; avatar: string };
  currentDate: string;
}

export const Header: React.FC<HeaderProps> = ({ activeId, user, currentDate }) => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="h-20 border-b border-border bg-white px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded-lg border border-border hover:bg-bg text-gray-500">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 font-medium">
          <span>Jogjagem</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-600 capitalize">{activeId}</span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative hidden lg:block w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search operations..." className="w-full bg-bg text-xs pl-9 pr-12 py-2.5 rounded-xl border border-transparent focus:border-border outline-none" />
        </div>

        <div className="hidden xl:flex flex-col text-right">
          <span className="text-xs font-semibold text-gray-800">{currentDate}</span>
        </div>

        <div className="relative">
          <button onClick={() => setNotificationOpen(!notificationOpen)} className="p-2.5 rounded-xl border border-border hover:bg-bg relative">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white"></span>
          </button>
        </div>

        <div className="relative">
          <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-3 p-1.5 pr-3 rounded-xl border border-border hover:bg-bg">
            <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-lg object-cover" />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-gray-800">{user.name}</span>
              <span className="text-[10px] text-gray-500">{user.role}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
          
          {profileOpen && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-white border border-border shadow-soft p-2 flex flex-col z-50">
              <div className="p-3 border-b border-border">
                <p className="text-xs font-bold text-gray-800">{user.name}</p>
                <p className="text-[10px] text-gray-500">{user.email}</p>
              </div>
              <a href="/settings" className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-600 hover:bg-bg">
                <Settings className="w-4 h-4" /> Account Settings
              </a>
              <a href="/login" className="flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-red-50">
                <LogOut className="w-4 h-4" /> Log Out
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
