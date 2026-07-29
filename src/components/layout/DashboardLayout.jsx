import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import CareersNav from '../careers/CareersNav.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const TAB_ROUTES = {
  'open-roles': '/dashboard-careers',
  'my-applications': '/dashboard-careers/applications',
  interviews: '/dashboard-careers/interviews',
  offer: '/dashboard-careers/offer',
};

/** Which nav tab (if any) matches the current route. */
function activeTabForPath(pathname) {
  if (pathname.startsWith('/dashboard-careers/applications')) return 'my-applications';
  if (pathname.startsWith('/dashboard-careers/interviews')) return 'interviews';
  if (pathname.startsWith('/dashboard-careers/offer')) return 'offer';
  if (pathname.startsWith('/dashboard-careers/change-password')) return '';
  // Everything else under /dashboard-careers (the roles list, a job's
  // detail page, the apply flow) belongs to "Open roles".
  return 'open-roles';
}

/**
 * Shared shell for every /dashboard-careers/* screen.
 *
 * Bug fix: each page used to render its own <CareersNav>, so switching
 * tabs unmounted the whole header and mounted a fresh one for the next
 * page. Tabs.jsx measures the active tab's DOM position after mount to
 * place its sliding indicator — on a fresh mount that starts unpositioned
 * and then snaps into place, which is what read as the navbar "moving" on
 * every tab change. Rendering CareersNav once here, with the page content
 * swapped underneath via <Outlet/>, keeps the header mounted across
 * navigation so the indicator actually slides instead of resetting.
 */
export default function DashboardLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavChange = (tab) => {
    const path = TAB_ROUTES[tab];
    if (path) navigate(path);
  };

  return (
    <div className="min-h-screen bg-surface">
      <CareersNav
        activeTab={activeTabForPath(pathname)}
        onChangeTab={handleNavChange}
        userInitials={user?.initials}
      />
      <Outlet />
    </div>
  );
}
