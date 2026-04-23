'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ReactNode } from 'react';
import { SoftphoneProvider } from '@/hooks/useSoftphone';
import Softphone from '@/components/voice/Softphone';

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <SoftphoneProvider>
      <div className="min-h-screen flex bg-gray-100">
        {/* Sidebar placeholder — will be built in layout module */}
        <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
          <div className="px-4 py-5 border-b border-gray-200">
            <span className="font-semibold text-gray-800 text-sm">Contact Center</span>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1 text-sm text-gray-600">
            <a href="/dashboard" className="block px-3 py-2 rounded-lg hover:bg-gray-100">Dashboard</a>
            <a href="/candidates" className="block px-3 py-2 rounded-lg hover:bg-gray-100">Candidates</a>
            <a href="/inbox" className="block px-3 py-2 rounded-lg hover:bg-gray-100">WhatsApp Inbox</a>
            <a href="/calls" className="block px-3 py-2 rounded-lg hover:bg-gray-100">Call Logs</a>
            <a href="/follow-ups" className="block px-3 py-2 rounded-lg hover:bg-gray-100">Follow-ups</a>
            <a href="/reports" className="block px-3 py-2 rounded-lg hover:bg-gray-100">Reports</a>
            <a href="/settings" className="block px-3 py-2 rounded-lg hover:bg-gray-100">Settings</a>
          </nav>
          <div className="px-4 py-4 border-t border-gray-200 text-xs text-gray-500">
            {user.name} · {user.role}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>

        {/* Floating softphone widget */}
        <Softphone />
      </div>
    </SoftphoneProvider>
  );
}
