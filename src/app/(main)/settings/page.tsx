'use client';

import { useState } from 'react';
import ProfileTab from './ProfileTab';
import PasswordTab from './PasswordTab';
import TeamTab from './TeamTab';

type Tab = 'profile' | 'password' | 'team';

const TABS: { id: Tab; label: string }[] = [
  { id: 'profile', label: 'My Profile' },
  { id: 'password', label: 'Change Password' },
  { id: 'team', label: 'Team Members' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and team</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'password' && <PasswordTab />}
        {activeTab === 'team' && <TeamTab />}
      </div>
    </div>
  );
}
