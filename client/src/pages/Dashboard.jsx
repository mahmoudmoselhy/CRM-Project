import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useAccess } from '../hooks/useAccess';
import { getOverview, getLeadsByStatus } from '../api/reports';
import { Card, StatCard, BarChart, Spinner } from '../components/ui';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { can } = useAccess();
  const canReports = can('REPORTS', 'view');

  const { data: ov, isLoading } = useQuery({
    queryKey: ['overview'],
    queryFn: getOverview,
    enabled: canReports,
  });
  const { data: byStatus } = useQuery({
    queryKey: ['leadsByStatus'],
    queryFn: getLeadsByStatus,
    enabled: canReports,
  });

  if (!canReports) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome, {user?.name}</h1>
        <p className="mt-2 text-slate-500">{user?.company?.name} — role: {user?.role}</p>
        <p className="mt-6 text-slate-400">You don't have access to reports. Use the sidebar to manage your work.</p>
      </div>
    );
  }

  if (isLoading) return <Spinner />;

  const o = ov?.overview || {};
  const statusData = (byStatus?.data || []).map((d) => ({
    label: d.status.replace('_', ' '),
    value: d.count,
    key: d.status,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Dashboard</h1>
      <p className="text-slate-500 mb-6">{user?.company?.name}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Leads" value={o.total ?? 0} />
        <StatCard label="Open Leads" value={o.openLeads ?? 0} accent="text-blue-600" />
        <StatCard label="Won" value={o.won ?? 0} accent="text-green-600" />
        <StatCard label="Conversion Rate" value={`${o.conversionRate ?? 0}%`} accent="text-purple-600" />
        <StatCard label="Pending Tasks" value={o.pendingTasks ?? 0} />
        <StatCard label="Overdue Tasks" value={o.overdueTasks ?? 0} accent="text-red-600" />
        <StatCard label="Lost" value={o.lost ?? 0} accent="text-slate-500" />
      </div>

      <Card className="p-6 max-w-2xl">
        <h3 className="font-semibold text-slate-700 mb-4">Leads by status</h3>
        <BarChart data={statusData} />
      </Card>
    </div>
  );
}
