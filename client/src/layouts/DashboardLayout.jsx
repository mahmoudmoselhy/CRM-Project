import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useAccess } from '../hooks/useAccess';
import { listTasks } from '../api/tasks';

// Sidebar links are gated by access; ADMIN sees everything.
const NAV = [
  { to: '/dashboard', label: 'Dashboard', module: null },
  { to: '/leads', label: 'Leads', module: 'LEADS' },
  { to: '/tasks', label: 'Tasks', module: 'TASKS' },
  { to: '/reports', label: 'Reports', module: 'REPORTS' },
  { to: '/invoices', label: 'Invoices', module: 'INVOICES' },
  { to: '/settings', label: 'Settings', module: 'SETTINGS' },
  { to: '/users', label: 'Users', module: 'USERS' },
];

export default function DashboardLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { can } = useAccess();
  const navigate = useNavigate();

  // Lightweight notification: count of overdue tasks (only if the user can see tasks).
  const canSeeTasks = can('TASKS', 'view');
  const { data: overdueData } = useQuery({
    queryKey: ['tasks', 'OVERDUE'],
    queryFn: () => listTasks({ overdue: true }),
    enabled: canSeeTasks,
    refetchInterval: 60000,
  });
  const overdueCount = overdueData?.tasks?.length || 0;

  const onLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const links = NAV.filter((n) => !n.module || can(n.module, 'view'));

  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-60 bg-slate-900 text-slate-200 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-700">
          <div className="text-lg font-bold text-white">Wasl <span className="text-blue-400">CRM</span></div>
          {user?.company?.name && (
            <div className="text-xs text-slate-400 mt-0.5 truncate">{user.company.name}</div>
          )}
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-md text-sm ${
                  isActive ? 'bg-slate-700 text-white' : 'hover:bg-slate-800'
                }`
              }
            >
              <span>{n.label}</span>
              {n.to === '/tasks' && overdueCount > 0 && (
                <span className="bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
                  {overdueCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-slate-700">
          <div className="px-3 pb-2 text-xs text-slate-400">{user?.name} · {user?.role}</div>
          <button
            onClick={onLogout}
            className="w-full text-right px-3 py-2 rounded-md text-sm bg-red-600 hover:bg-red-700 text-white"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
