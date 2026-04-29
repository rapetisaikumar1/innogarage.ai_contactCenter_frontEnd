'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SoftphoneProvider, useSoftphone } from '@/hooks/useSoftphone';
import Softphone from '@/components/voice/Softphone';
import NotificationBell from '@/components/layout/NotificationBell';
import TransferRequestAlert from '@/components/layout/TransferRequestAlert';
import { User } from '@/types';
import { useNotifications } from '@/hooks/useNotifications';
import { updateMyAvailability, type Availability } from '@/hooks/useAgents';
import { useProfile } from '@/hooks/useSettings';
import { useSocket } from '@/hooks/useSocket';
import Image from 'next/image';
import Link from 'next/link';

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS: Array<{ label: string; href: string; icon: ReactNode; roles?: User['role'][]; canShow?: (user: User) => boolean }> = [
  { label: 'Dashboard', href: '/dashboard', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>) },
  { label: 'Candidates', href: '/candidates', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>) },
  { label: 'WhatsApp Inbox', href: '/inbox', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" /></svg>) },
  { label: 'Call Logs', href: '/calls', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>) },
  { label: 'Follow-ups', href: '/follow-ups', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>) },
  { label: 'Mentors', href: '/agents', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>) },
  { label: 'Available Technologies', href: '/available-technologies', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M20 7L12 3 4 7m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M8 5l8 4" /></svg>) },
  { label: 'BGC', href: '/bgc', canShow: (user) => user.role === 'ADMIN' || Boolean(user.canAccessBgc), icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 12.75L11.25 15 15 9.75M12 3.75l7.5 3v5.25c0 4.52-3.15 7.95-7.5 9-4.35-1.05-7.5-4.48-7.5-9V6.75l7.5-3z" /></svg>) },
  { label: 'Payment History', href: '/payment-history', canShow: (user) => user.role === 'ADMIN' || Boolean(user.canAccessPaymentHistory), icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M7.5 4.5h9A2.25 2.25 0 0118.75 6.75v10.5A2.25 2.25 0 0116.5 19.5h-9a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 017.5 4.5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M8.75 9.25h6.5M8.75 13h6.5M8.75 16.75h4" /></svg>) },
];

const AVAILABILITY_OPTIONS: { value: Availability; label: string; color: string }[] = [
  { value: 'AVAILABLE', label: 'Available', color: 'bg-emerald-500' },
  { value: 'BUSY',      label: 'Busy',      color: 'bg-amber-500'  },
  { value: 'AWAY',      label: 'Away',      color: 'bg-slate-400'  },
  { value: 'OFFLINE',   label: 'Offline',   color: 'bg-red-500'    },
];

// ─── Sidebar nav (needs unread count for WhatsApp badge) ─────────────────────
function SidebarNav({ pathname, user }: { pathname: string; user: User }) {
  // Inbox badge: only WhatsApp messages — ignore transfer / assignment notifications
  const { whatsappUnreadCount, missedCallUnreadCount } = useNotifications();

  return (
    <nav className="flex-1 px-3 pt-4 space-y-0.5 overflow-y-auto pb-4">
      {NAV_ITEMS.filter((item) => (!item.roles || item.roles.includes(user.role)) && (!item.canShow || item.canShow(user))).map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        const isInbox = item.href === '/inbox';
        const isCallLogs = item.href === '/calls';
        return (
          <Link
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
            {isInbox && whatsappUnreadCount > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {whatsappUnreadCount > 99 ? '99+' : whatsappUnreadCount}
              </span>
            )}
            {isCallLogs && missedCallUnreadCount > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {missedCallUnreadCount > 99 ? '99+' : missedCallUnreadCount}
              </span>
            )}
          </Link>
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
  const { data: profile } = useProfile();
  const router     = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [availability, setAvailability] = useState<Availability>('AVAILABLE');
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentAvail = AVAILABILITY_OPTIONS.find((o) => o.value === availability)!;
  const profileRole = profile?.role ?? user.role;
  const roleLabel = profileRole === 'AGENT' ? 'Mentor' : profileRole === 'ADMIN' ? 'Admin' : 'Manager';
  const departmentLabel = profileRole === 'AGENT' ? profile?.department?.name ?? 'Not assigned' : null;

  async function handleAvailabilityChange(next: Availability) {
    if (next === availability || updatingAvailability) return;
    const prev = availability;
    setAvailability(next);
    setUpdatingAvailability(true);
    try {
      await updateMyAvailability(next);
    } catch {
      setAvailability(prev);
    } finally {
      setUpdatingAvailability(false);
    }
  }

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
    <header className="h-14 flex-shrink-0 flex items-center gap-4 px-6 bg-white border-b border-slate-200 z-20">
      <div className="flex-1 flex justify-center min-w-0">
        <TransferRequestAlert />
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
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
                    <p className="text-xs text-slate-500">{roleLabel}</p>
                    {departmentLabel && <p className="text-[11px] text-slate-400">Department: {departmentLabel}</p>}
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
                      onClick={() => handleAvailabilityChange(opt.value)}
                      disabled={updatingAvailability}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
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
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>
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
  const { user, isLoading, logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useSocket({
    'account:disabled': () => {
      logout();
    },
  });

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
          <div className="px-3 py-3 flex-shrink-0 border-b border-slate-100">
            <Image
              src="/logo.png"
              alt="innogarage Contact Center"
              width={224}
              height={149}
              className="w-full h-auto object-contain"
              priority
            />
          </div>

          {/* Nav */}
          <SidebarNav pathname={pathname} user={user} />


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
