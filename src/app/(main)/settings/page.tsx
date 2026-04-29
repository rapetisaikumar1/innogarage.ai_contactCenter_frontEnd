'use client';

import { useState } from 'react';
import React from 'react';
import ProfileTab from './ProfileTab';
import TeamTab from './TeamTab';
import DepartmentsTab from './DepartmentsTab';
import { useAuth } from '@/hooks/useAuth';

type Tab = 'profile' | 'team' | 'departments';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'profile',
    label: 'My Profile',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: 'team',
    label: 'Team Members',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'departments',
    label: 'Create Departments',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M5 7v12h14V7M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
      </svg>
    ),
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { user } = useAuth();
  const visibleTabs = user?.role === 'ADMIN' ? TABS : TABS.filter((tab) => tab.id === 'profile');

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center px-6 py-4 border-b border-slate-200 bg-white">
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">Settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage your account and team settings</p>
        </div>
      </div>

      <div className="p-6">
        {/* Tab navigation */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm w-fit mb-7">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'team' && user?.role === 'ADMIN' && <TeamTab />}
          {activeTab === 'departments' && user?.role === 'ADMIN' && <DepartmentsTab />}
        </div>
      </div>
    </div>
  );
}
