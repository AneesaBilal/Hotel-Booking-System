import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, Building2, Heart, LayoutDashboard, LogOut, Menu, Moon, Sun, User, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../lib/store';
import { formatDateTime, getNotifications, markAllNotificationsRead, markNotificationRead } from '../lib/db';

function ThemeToggle() {
  const theme = useAppStore(function (s) { return s.theme; });
  const toggleTheme = useAppStore(function (s) { return s.toggleTheme; });
  return (
    <button
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

function PublicNavLink(props: any) {
  const { to, children } = props;
  return (
    <NavLink
      to={to}
      className={function (state: any) {
        return [
          'rounded-lg px-3 py-2 text-sm font-medium transition',
          state.isActive
            ? 'bg-blue-600/10 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
        ].join(' ');
      }}
    >
      {children}
    </NavLink>
  );
}

function adminTitle(role: string) {
  if (role === 'manager') return 'StaySphere Manager';
  if (role === 'receptionist') return 'StaySphere Front Desk';
  return 'StaySphere Admin';
}

function roleBadge(role: string) {
  if (role === 'admin') return 'Administrator';
  if (role === 'manager') return 'Hotel Manager';
  if (role === 'receptionist') return 'Receptionist';
  return 'Guest';
}

export function PublicLayout() {
  const user = useAppStore(function (s) { return s.user; });
  const logout = useAppStore(function (s) { return s.logout; });
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifications = user ? getNotifications(user.id).slice(0, 5) : [];
  const unread = user ? getNotifications(user.id).filter(function (n) { return !n.readAt; }).length : 0;

  const doLogout = function () {
    logout();
    toast.success('Signed out.');
    navigate('/');
  };

  const navLinkClass = 'rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
              <Building2 className="h-5 w-5 text-blue-600" />
              StaySphere
            </Link>
            <nav className="hidden items-center gap-1 lg:flex">
              <PublicNavLink to="/hotels">Hotels</PublicNavLink>
              <PublicNavLink to="/search">Destinations</PublicNavLink>
              <Link className={navLinkClass} to="/#offers">Offers</Link>
              <PublicNavLink to="/about">About</PublicNavLink>
              <PublicNavLink to="/contact">Contact</PublicNavLink>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <div className="relative">
                <button
                  aria-label="Notifications"
                  onClick={function () { setNoteOpen(!noteOpen); setProfileOpen(false); }}
                  className="relative rounded-lg border border-slate-200 p-2 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  <Bell className="h-4 w-4" />
                  {unread > 0 ? <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">{unread}</span> : null}
                </button>
                {noteOpen ? (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold">Notifications</p>
                      <button
                        className="text-xs text-blue-600"
                        onClick={function () {
                          markAllNotificationsRead(user.id);
                          setNoteOpen(false);
                          toast.success('All notifications marked as read.');
                        }}
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="space-y-2">
                      {notifications.length === 0 ? <p className="text-sm text-slate-500">No notifications.</p> : null}
                      {notifications.map(function (n) {
                        return (
                          <button
                            key={n.id}
                            className={['block w-full rounded-lg border p-2 text-left text-xs', n.readAt ? 'border-slate-100 dark:border-slate-800' : 'border-blue-100 bg-blue-50/40 dark:border-blue-500/20 dark:bg-blue-500/5'].join(' ')}
                            onClick={function () {
                              markNotificationRead(n.id);
                              setNoteOpen(false);
                            }}
                          >
                            <p className="font-medium">{n.title}</p>
                            <p className="mt-1 text-slate-500 dark:text-slate-400">{n.message}</p>
                            <p className="mt-1 text-[10px] text-slate-400">{formatDateTime(n.createdAt)}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {user ? (
              <div className="relative">
                <button
                  onClick={function () { setProfileOpen(!profileOpen); setNoteOpen(false); }}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.firstName}</span>
                </button>
                {profileOpen ? (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                    <Link to="/account" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={function () { setProfileOpen(false); }}>
                      <Heart className="h-4 w-4" /> Account
                    </Link>
                    {user.role !== 'guest' ? (
                      <Link to="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={function () { setProfileOpen(false); }}>
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                    ) : null}
                    <button onClick={doLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">Login</Link>
                <Link to="/register" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Create Account</Link>
              </div>
            )}

            <button className="rounded-lg border border-slate-200 p-2 lg:hidden dark:border-slate-800" aria-label="Menu" onClick={function () { setMobileOpen(!mobileOpen); }}>
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden dark:border-slate-800 dark:bg-slate-950">
            <div className="grid gap-2">
              <PublicNavLink to="/hotels">Hotels</PublicNavLink>
              <PublicNavLink to="/search">Destinations</PublicNavLink>
              <Link className={navLinkClass} to="/#offers">Offers</Link>
              <PublicNavLink to="/about">About</PublicNavLink>
              <PublicNavLink to="/contact">Contact</PublicNavLink>
              {!user ? <Link className={navLinkClass} to="/login" onClick={function () { setMobileOpen(false); }}>Login</Link> : null}
              {!user ? <Link className={navLinkClass} to="/register" onClick={function () { setMobileOpen(false); }}>Create Account</Link> : null}
            </div>
          </div>
        ) : null}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
          <div>
            <p className="flex items-center gap-2 text-lg font-semibold"><Building2 className="h-5 w-5 text-blue-600" /> StaySphere</p>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Premium hotel booking and hotel management software.</p>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">Company</p>
            <div className="grid gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/faq">FAQ</Link>
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">Legal</p>
            <div className="grid gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Link to="/terms">Terms</Link>
              <Link to="/privacy">Privacy</Link>
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">Support</p>
            <div className="grid gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>support@staysphere.demo</span>
              <span>+1 555 010 9999</span>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-400 dark:border-slate-800">
          © 2026 StaySphere. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export function AccountLayout() {
  const user = useAppStore(function (s) { return s.user; });
  const logout = useAppStore(function (s) { return s.logout; });
  const navigate = useNavigate();

  const links = [
    { to: '/account', label: 'Dashboard', end: true },
    { to: '/account/bookings', label: 'Bookings' },
    { to: '/account/favorites', label: 'Favorites' },
    { to: '/account/reviews', label: 'Reviews' },
    { to: '/account/profile', label: 'Profile' },
    { to: '/account/notifications', label: 'Notifications' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold"><Building2 className="h-5 w-5 text-blue-600" /> StaySphere</Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={function () { logout(); navigate('/'); }} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">Sign out</button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl gap-6 px-4 py-8 lg:flex">
        <aside className="mb-6 lg:mb-0 lg:w-64">
          <nav className="grid gap-1 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            {links.map(function (link) {
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={function (state: any) {
                    return [
                      'rounded-lg px-3 py-2 text-sm font-medium transition',
                      state.isActive ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    ].join(' ');
                  }}
                >
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const user = useAppStore(function (s) { return s.user; });
  const logout = useAppStore(function (s) { return s.logout; });
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');

  const links = [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/hotels', label: 'Hotels' },
    { to: '/admin/room-types', label: 'Room Types' },
    { to: '/admin/rooms', label: 'Rooms' },
    { to: '/admin/reservations', label: 'Reservations' },
    { to: '/admin/guests', label: 'Guests' },
    { to: '/admin/check-in', label: 'Check-in' },
    { to: '/admin/check-out', label: 'Check-out' },
    { to: '/admin/housekeeping', label: 'Housekeeping' },
    { to: '/admin/payments', label: 'Payments' },
    { to: '/admin/invoices', label: 'Invoices' },
    { to: '/admin/reviews', label: 'Reviews' },
    { to: '/admin/promotions', label: 'Promotions' },
    { to: '/admin/staff', label: 'Staff' },
    { to: '/admin/reports', label: 'Reports' },
    { to: '/admin/settings', label: 'Settings' }
  ];

  const submitSearch = function () {
    if (!search.trim()) return;
    navigate('/admin/reservations?query=' + encodeURIComponent(search.trim()));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="flex h-16 items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3">
            <button className="rounded-lg border border-slate-200 p-2 lg:hidden dark:border-slate-800" aria-label="Menu" onClick={function () { setMobileOpen(!mobileOpen); }}>
              <Menu className="h-4 w-4" />
            </button>
            <Link to="/admin" className="flex items-center gap-2 text-lg font-semibold">
              <Building2 className="h-5 w-5 text-blue-600" />
              {adminTitle(user ? user.role : 'admin')}
            </Link>
            {user ? (
              <span className="hidden rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 md:inline dark:bg-blue-500/10 dark:text-blue-300">
                {roleBadge(user.role)}
              </span>
            ) : null}
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">
            <div className="hidden w-full max-w-md md:block">
              <input
                value={search}
                onChange={function (e) { setSearch(e.target.value); }}
                onKeyDown={function (e) { if (e.key === 'Enter') submitSearch(); }}
                placeholder="Search reservations, guests, or booking codes"
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <ThemeToggle />
            <button onClick={function () { logout(); navigate('/'); }} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">Sign out</button>
          </div>
        </div>
      </header>
      <div className="flex">
        <aside className={['min-h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950', mobileOpen ? 'block' : 'hidden lg:block'].join(' ')}>
          <nav className="grid gap-1">
            {links.map(function (link) {
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={function () { setMobileOpen(false); }}
                  className={function (state: any) {
                    return [
                      'rounded-lg px-3 py-2 text-sm font-medium transition',
                      state.isActive ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    ].join(' ');
                  }}
                >
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>
        <main className="w-full min-w-0 flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
