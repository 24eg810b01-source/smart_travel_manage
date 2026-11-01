import React, { useState } from 'react';
import { User } from '../../types/travel';
import { storageService } from '../../services/storageService';
import { Database, ShieldCheck, UserCheck, ChevronDown, Check } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User;
  onUserChanged: () => void;
  onOpenDatabaseModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onUserChanged,
  onOpenDatabaseModal,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const users = storageService.getUsers();

  const handleSwitchUser = (userId: string) => {
    storageService.setCurrentUserId(userId);
    setUserDropdownOpen(false);
    onUserChanged();
  };

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'trips', label: 'Trips & Planner' },
    { id: 'calendar', label: 'Trip Calendar' },
    { id: 'bookings', label: 'Live Bookings' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'destinations', label: 'Destinations' },
  ];

  if (currentUser.role === 'ADMIN') {
    navLinks.push({ id: 'admin', label: 'Admin Console' });
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('dashboard')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors whitespace-nowrap">
              Smart Travel System
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (single-line text with subtle hover underlines) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {navLinks.slice(0, 5).map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onSelectTab(link.id)}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 text-sm ${
                  isActive
                    ? 'text-sky-600 font-semibold border-b-2 border-sky-600'
                    : 'text-slate-600 hover:text-slate-900 hover:border-b-2 hover:border-slate-300'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action Area & User Context */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Spring Boot / MySQL status indicator & button */}
          <button
            onClick={onOpenDatabaseModal}
            title="Inspect Spring Boot REST APIs & MySQL 8.0 Engine"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <Database className="w-3.5 h-3.5 text-sky-600" />
            <span className="font-mono text-[11px] tabular-nums">MySQL: root@localhost</span>
          </button>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 text-left transition-colors whitespace-nowrap shrink-0 border border-transparent hover:border-slate-200"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
              />
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-900 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  {currentUser.role === 'ADMIN' ? (
                    <span className="text-amber-600 font-medium">Administrator</span>
                  ) : (
                    <span>Traveler</span>
                  )}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-xs font-semibold text-slate-900">Switch Active Account</div>
                  <div className="text-[11px] text-slate-500">Test roles & permission scopes</div>
                </div>

                <div className="py-1">
                  {users.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => handleSwitchUser(u.id)}
                        className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-slate-50 transition-colors ${
                          isSelected ? 'bg-sky-50 text-sky-900 font-medium' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            referrerPolicy="no-referrer"
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div>
                            <div className="leading-tight">{u.name}</div>
                            <div className="text-[10px] text-slate-400">{u.role} · {u.email}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-sky-600" />}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 px-3 pt-2 pb-1">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenDatabaseModal();
                    }}
                    className="w-full text-left text-[11px] text-sky-600 hover:text-sky-800 font-medium py-1"
                  >
                    Configure MySQL Credentials & Schema
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
