import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, LogOut, ChevronDown } from 'lucide-react';
import Tabs from '../ui/Tabs.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV_TABS = [
  { id: 'open-roles', label: 'Open roles' },
  { id: 'my-applications', label: 'My applications', badge: true },
  { id: 'interviews', label: 'Interviews' },
  { id: 'offer', label: 'Offer' },
];

export default function CareersNav({ activeTab, onChangeTab, userInitials = 'AR' }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    // logout() clears the local session synchronously before it calls the
    // /logout API, so navigation doesn't need to wait on the network.
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <a href="/dashboard-careers" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-base font-bold text-white shadow-sm">
            N
          </span>
          <span className="text-lg font-bold text-slate-900">
            Nexus <span className="font-normal text-slate-500">Careers</span>
          </span>
        </a>

        <Tabs variant="nav" tabs={NAV_TABS} value={activeTab} onChange={onChangeTab} />

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white">
              {userInitials}
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white py-1.5 shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/dashboard-careers/change-password');
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <KeyRound className="h-4 w-4 text-slate-400" />
                Change Password
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
