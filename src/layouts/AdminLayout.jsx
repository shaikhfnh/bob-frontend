import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { springs } from '../styles/motion';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/admin/bookings', label: 'Bookings', icon: '📋' },
  { path: '/admin/users', label: 'Users', icon: '👤' },
  { path: '/admin/sessions', label: 'Manage Sessions', icon: '🗓' },
  { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { path: '/admin/notifications', label: 'Notifications', icon: '🔔' },
  { path: '/admin/audit', label: 'Audit Log', icon: '🛡' },
];

function initials(name = '') {
  return name.split('@')[0].slice(0, 2).toUpperCase();
}

function Sidebar({ onNavigate }) {
  const location = useLocation();
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-red text-sm font-bold text-white">B</div>
        <div>
          <p className="text-sm font-bold text-brand-ink">Boubyan</p>
          <p className="text-[11px] text-brand-muted">Admin Console</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className="relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
            >
              {active && (
                <motion.div
                  layoutId="admin-nav-active"
                  transition={springs.snappy}
                  className="absolute inset-0 rounded-lg bg-red-50"
                />
              )}
              <span className="relative z-10 text-base">{item.icon}</span>
              <span className={`relative z-10 ${active ? 'font-semibold text-brand-red' : 'text-brand-muted'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <p className="px-6 py-4 text-[11px] text-neutral-300">v1.0</p>
    </div>
  );
}

function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-neutral-100"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-bold text-white">
          {initials(user?.email)}
        </div>
        <span className="hidden text-sm font-medium text-brand-ink sm:inline">{user?.email}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={springs.snappy} className="text-[10px] text-brand-muted">▾</motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={springs.snappy}
            className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg"
          >
            <div className="border-b border-neutral-100 p-4">
              <p className="truncate text-sm font-semibold text-brand-ink">{user?.email}</p>
              <p className="text-xs text-brand-muted">Admin</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              ↩ Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const currentLabel = NAV_ITEMS.find((i) => i.path === location.pathname)?.label || 'Admin';

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="hidden w-64 flex-shrink-0 border-r border-neutral-200 bg-white lg:block">
        <Sidebar />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={springs.sheet}
              className="fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-2xl lg:hidden"
            >
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col">
        {/* Top bar — now on every screen size, not just mobile */}
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-ink hover:bg-neutral-100 lg:hidden"
              aria-label="Open menu"
            >
              ☰
            </button>
            <p className="text-base font-bold text-brand-ink">{currentLabel}</p>
          </div>

          <ProfileMenu />
        </header>

        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}