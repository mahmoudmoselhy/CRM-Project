import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listLeads, createLead, listAssignableUsers } from '../api/leads';
import { useAccess } from '../hooks/useAccess';
import {
  Button, Input, Select, Card, StatusBadge, Spinner, EmptyState, Modal, LEAD_STATUSES,
} from '../components/ui';

export default function Leads() {
  const { can } = useAccess();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['leads', { status, q }],
    queryFn: () => listLeads({ status: status || undefined, q: q || undefined }),
  });

  const leads = data?.leads || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Leads</h1>
        {can('LEADS', 'create') && (
          <Button onClick={() => setShowCreate(true)}>+ New Lead</Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <Input
          placeholder="Search name, phone, email..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-[180px]">
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </Select>
      </div>

      <Card>
        {isLoading ? (
          <Spinner />
        ) : leads.length === 0 ? (
          <EmptyState message="No leads found." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Agent</th>
                <th className="px-4 py-3 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => navigate(`/leads/${lead.id}`)}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-slate-800">{lead.customerName}</td>
                  <td className="px-4 py-3 text-slate-600">{lead.phone || '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                  <td className="px-4 py-3 text-slate-600">{lead.agent?.name || 'Unassigned'}</td>
                  <td className="px-4 py-3 text-slate-600">{lead.source?.name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {showCreate && (
        <CreateLeadModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            qc.invalidateQueries({ queryKey: ['leads'] });
          }}
        />
      )}
    </div>
  );
}

function CreateLeadModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ customerName: '', phone: '', email: '', status: 'NEW', assignedTo: '' });
  const [error, setError] = useState('');

  const { data: usersData } = useQuery({
    queryKey: ['assignable'],
    queryFn: listAssignableUsers,
  });
  const users = usersData?.users || [];

  const mutation = useMutation({
    mutationFn: () => createLead({ ...form, assignedTo: form.assignedTo || null }),
    onSuccess: onCreated,
    onError: (err) => setError(err?.response?.data?.message || 'Failed to create lead'),
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <Modal open title="New Lead" onClose={onClose}>
      <div className="space-y-3">
        <Input placeholder="Customer name *" value={form.customerName} onChange={set('customerName')} />
        <Input placeholder="Phone" value={form.phone} onChange={set('phone')} />
        <Input placeholder="Email" value={form.email} onChange={set('email')} />
        <Select value={form.status} onChange={set('status')}>
          {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </Select>
        <Select value={form.assignedTo} onChange={set('assignedTo')}>
          <option value="">Unassigned</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </Select>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => { setError(''); mutation.mutate(); }}
            disabled={!form.customerName || mutation.isPending}
          >
            {mutation.isPending ? 'Saving...' : 'Create'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
