import { useQuery } from '@tanstack/react-query';
import { getAgentPerformance, getSourcePerformance } from '../api/reports';
import { Card, Spinner, EmptyState } from '../components/ui';

export default function Reports() {
  const { data: agentsData, isLoading } = useQuery({
    queryKey: ['agentPerf'],
    queryFn: getAgentPerformance,
  });
  const { data: sourcesData } = useQuery({
    queryKey: ['sourcePerf'],
    queryFn: getSourcePerformance,
  });

  const agents = agentsData?.agents || [];
  const sources = sourcesData?.sources || [];

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Reports</h1>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-700 mb-4">Agent performance</h3>
        {agents.length === 0 ? (
          <EmptyState message="No agents." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="px-3 py-2 font-medium">Agent</th>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Leads</th>
                <th className="px-3 py-2 font-medium">Won</th>
                <th className="px-3 py-2 font-medium">Open tasks</th>
                <th className="px-3 py-2 font-medium">Win rate</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => (
                <tr key={a.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2 font-medium text-slate-800">{a.name}</td>
                  <td className="px-3 py-2 text-slate-500">{a.role}</td>
                  <td className="px-3 py-2 text-slate-700">{a.leads}</td>
                  <td className="px-3 py-2 text-green-600 font-medium">{a.won}</td>
                  <td className="px-3 py-2 text-slate-700">{a.openTasks}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {a.leads > 0 ? Math.round((a.won / a.leads) * 100) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-700 mb-4">Lead source performance</h3>
        {sources.length === 0 ? (
          <EmptyState message="No lead sources yet." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="px-3 py-2 font-medium">Source</th>
                <th className="px-3 py-2 font-medium">Leads</th>
                <th className="px-3 py-2 font-medium">Won</th>
                <th className="px-3 py-2 font-medium">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2 font-medium text-slate-800">{s.name}</td>
                  <td className="px-3 py-2 text-slate-700">{s.leads}</td>
                  <td className="px-3 py-2 text-green-600 font-medium">{s.won}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {s.leads > 0 ? Math.round((s.won / s.leads) * 100) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
