import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

// Temporary page for week 1 - verifies the frontend can reach the API
export default function Home() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: async () => (await api.get('/health')).data,
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Multi-Tenant CRM</h1>
        <p className="text-slate-400">Graduation Project</p>
        <div className="text-lg">
          {isLoading && <span className="text-yellow-400">Checking API...</span>}
          {isError && <span className="text-red-400">API not reachable - start the server first</span>}
          {data && <span className="text-green-400">{data.message}</span>}
        </div>
      </div>
    </div>
  );
}
