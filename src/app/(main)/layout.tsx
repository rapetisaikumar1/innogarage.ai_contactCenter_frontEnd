'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SoftphoneProvider, useSoftphone } from '@/hooks/useSoftphone';
import Softphone from '@/components/voice/Softphone';
import NotificationBell from '@/components/layout/NotificationBell';
import { User } from '@/types';
import { useNotifications } from '@/hooks/useNotifications';

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>) },
  { label: 'Candidates', href: '/candidates', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>) },
  { label: 'WhatsApp Inbox', href: '/inbox', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" /></svg>) },
  { label: 'Call Logs', href: '/calls', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>) },
  { label: 'Follow-ups', href: '/follow-ups', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>) },
  { label: 'Agents', href: '/agents', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>) },
];

const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Available', color: 'bg-emerald-500' },
  { value: 'busy',      label: 'Busy',      color: 'bg-amber-500'  },
  { value: 'away',      label: 'Away',      color: 'bg-slate-400'  },
  { value: 'offline',   label: 'Offline',   color: 'bg-red-500'    },
];

// ─── Sidebar nav (needs unread count for WhatsApp badge) ─────────────────────
function SidebarNav({ pathname }: { pathname: string }) {
  const { unreadCount } = useNotifications();

  return (
    <nav className="flex-1 px-3 pt-4 space-y-0.5 overflow-y-auto pb-4">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        const isInbox = item.href === '/inbox';
        return (
          <a
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              isActive
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className={isActive ? 'text-slate-900' : 'text-slate-400'}>{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {isInbox && unreadCount > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </a>
        );
      })}
    </nav>
  );
}

// ─── Sidebar bottom: Agent + Softphone (inside SoftphoneProvider) ─────────────
function SidebarBottom() {
  const sp = useSoftphone();
  const isReady      = sp.status === 'ready';
  const isConnecting = sp.status === 'initializing';

  return (
    <div className="flex-shrink-0 border-t border-slate-200">
      {/* Softphone */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Softphone</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isReady ? 'bg-emerald-500' : isConnecting ? 'bg-amber-400 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs text-slate-500">
              {isReady ? 'Ready to receive calls' : isConnecting ? 'Connecting…' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Top navbar ───────────────────────────────────────────────────────────────
function TopNav({ user }: { user: User }) {
  const { logout } = useAuth();
  const router     = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [availability, setAvailability] = useState('available');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentAvail = AVAILABILITY_OPTIONS.find((o) => o.value === availability)!;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-end px-6 bg-white border-b border-slate-200 z-20">
      <div className="flex items-center gap-2">
        {/* Bell */}
        <NotificationBell />

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 leading-tight">{user.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${currentAvail.color}`} />
                <p className="text-xs text-slate-500 leading-none">{currentAvail.label}</p>
              </div>
            </div>
            <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
              {/* User info */}
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white text-base font-bold flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role?.toLowerCase()}</p>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Availability</p>
                <div className="space-y-0.5">
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAvailability(opt.value)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                        availability === opt.value ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${opt.color}`} />
                      {opt.label}
                      {availability === opt.value && (
                        <svg className="w-4 h-4 ml-auto text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="pt-1">
                <a
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Main layout ──────────────────────────────────────────────────────────────
export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <SoftphoneProvider>
      <div className="h-screen flex overflow-hidden bg-slate-50">

        {/* ── Light Sidebar ────────────────────────────────────────────── */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 overflow-hidden"
          style={{ height: '100vh', position: 'sticky', top: 0, alignSelf: 'flex-start' }}>
          {/* Logo */}
          <div className="px-4 py-4 flex-shrink-0 border-b border-slate-100">
            <div className="flex items-center gap-2.5">

              {/* ── Brand icon: circular speech-bubble + gradient headset ── */}
              <svg viewBox="0 0 68 58" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-11 h-9 flex-shrink-0">
                <defs>
                  {/* Gradient matches the logo: violet left → teal right */}
                  <linearGradient id="ig-band" x1="5" y1="0" x2="63" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#7C3AED" />
                    <stop offset="0.5" stopColor="#9333EA" />
                    <stop offset="1" stopColor="#0D9488" />
                  </linearGradient>
                </defs>

                {/* Speech bubble — rounded rect with bottom-left tail */}
                <path
                  d="M18 4H48Q54 4 54 10V37Q54 43 48 43H36L31 56L29 43H18Q12 43 12 37V10Q12 4 18 4Z"
                  fill="white"
                  stroke="#E2E8F0"
                  strokeWidth="1.5"
                />

                {/* Three typing dots */}
                <circle cx="24" cy="25" r="2.5" fill="#1E293B" />
                <circle cx="33" cy="25" r="2.5" fill="#1E293B" />
                <circle cx="42" cy="25" r="2.5" fill="#1E293B" />

                {/* Headset band arc — gradient violet → teal, sits OVER the bubble */}
                <path
                  d="M9 27C9 14 19 4 33 4C47 4 57 14 57 27"
                  stroke="url(#ig-band)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Left ear cup — dark navy */}
                <rect x="5" y="22" width="8" height="13" rx="4" fill="#1E293B" />

                {/* Right ear cup — dark navy */}
                <rect x="55" y="22" width="8" height="13" rx="4" fill="#1E293B" />

                {/* Mic boom — curves from right ear cup */}
                <path d="M63 27Q66 27 66 31" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </svg>

              {/* ── Brand text ── */}
              <div className="min-w-0">
                {/* "inno" dark navy + "garage" violet→teal gradient */}
                <p className="font-extrabold text-[15px] leading-none tracking-tight">
                  <span className="text-slate-900">inno</span><span className="bg-gradient-to-r from-violet-600 to-teal-500 bg-clip-text text-transparent">garage</span>
                </p>
                {/* "— CONTACT CENTER —" with brand-coloured accent lines */}
                <div className="flex items-center gap-1 mt-1.5">
                  <span className="h-px w-4 bg-violet-500 rounded-full flex-shrink-0" />
                  <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-slate-500 leading-none whitespace-nowrap">
                    Contact Center
                  </p>
                  <span className="h-px w-4 bg-teal-500 rounded-full flex-shrink-0" />
                </div>
              </div>

            </div>
          </div>

          {/* Nav */}
          <SidebarNav pathname={pathname} />


          {/* Agent + Softphone */}
          <SidebarBottom />
        </aside>

        {/* ── Right: topnav + page content ─────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopNav user={user} />
          <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>
        </div>

        <Softphone />
      </div>
    </SoftphoneProvider>
  );
}
