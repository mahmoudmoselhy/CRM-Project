import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLead, updateLead, deleteLead, assignLead, changeLeadStatus, listAssignableUsers,
} from '../api/leads';
import { listTasks, createTask, changeTaskStatus, deleteTask, isOverdue } from '../api/tasks';
import { useAccess } from '../hooks/useAccess';
import {
  Button, Input, Select, Textarea, Card, StatusBadge, TaskBadge, Spinner, LEAD_STATUSES,
} from '../components/ui';

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { can } = useAccess();

  const { data, isLoading } = useQuery({ queryKey: ['lead', id], queryFn: () => getLead(id) });
  const lead = data?.lead;

  const { data: usersData } = useQuery({ queryKey: ['assignable'], queryFn: listAssignableUsers });
  const users = usersData?.users || [];

  const [form, setForm] = useState({ customerName: '', phone: '', email: '', notes: '' });

  useEffect(() => {
    if (lead) {
      setForm({
        customerName: lead.customerName || '',
        phone: lead.phone || '',
        email: lead.email || '',
        notes: lead.notes || '',
      });
    }
  }, [lead]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['lead', id] });
    qc.invalidateQueries({ queryKey: ['leads'] });
  };

  const saveMutation = useMutation({ mutationFn: () => updateLead(id, form), onSuccess: refresh });
  const statusMutation = useMutation({ mutationFn: (s) => changeLeadStatus(id, s), onSuccess: refresh });
  const assignMutation = useMutation({ mutationFn: (a) => assignLead(id, a || null), onSuccess: refresh });
  const deleteMutation = useMutation({ mutationFn: () => deleteLead(id), onSuccess: () => navigate('/leads') });

  if (isLoading) return <Spinner />;
  if (!lead) return <p className="text-slate-500">Lead not found.</p>;

  const canEdit = can('LEADS', 'edit');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate('/leads')} className="text-sm text-slate-500 hover:text-slate-800 mb-4">
        &larr; Back to leads
      </button>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">{lead.customerName}</h1>
          <StatusBadge status={lead.status} />
        </div>
        {can('LEADS', 'delete') && (
          <Button variant="danger" onClick={() => { if (confirm('Delete this lead?')) deleteMutation.mutate(); }}>
            Delete
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 md:col-span-2 space-y-3">
          <h3 className="font-semibold text-slate-700">Details</h3>
          <Field label="Customer name"><Input value={form.customerName} onChange={set('customerName')} disabled={!canEdit} /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={set('phone')} disabled={!canEdit} /></Field>
          <Field label="Email"><Input value={form.email} onChange={set('email')} disabled={!canEdit} /></Field>
          <Field label="Notes"><Textarea rows={3} value={form.notes} onChange={set('notes')} disabled={!canEdit} /></Field>
          {canEdit && (
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          )}
        </Card>

        <Card className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-slate-500 mb-1">Status</label>
            <Select value={lead.status} disabled={!canEdit} onChange={(e) => statusMutation.mutate(e.target.value)}>
              {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">Assigned agent</label>
            <Select value={lead.assignedTo || ''} disabled={!canEdit} onChange={(e) => assignMutation.mutate(e.target.value)}>
              <option value="">Unassigned</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>
          </div>
          <div className="text-xs text-slate-400">Source: {lead.source?.name || '-'}</div>
        </Card>
      </div>

      <LeadTasks leadId={id} users={users} />

      <Card className="p-5 mt-4">
        <h3 className="font-semibold text-slate-700 mb-3">Activity timeline</h3>
        {(!lead.activities || lead.activities.length === 0) ? (
          <p className="text-sm text-slate-400">No activity yet.</p>
        ) : (
          <ul className="space-y-2">
            {lead.activities.map((a) => (
              <li key={a.id} className="flex gap-3 text-sm">
                <span className="text-slate-400 whitespace-nowrap">{new Date(a.createdAt).toLocaleString()}</span>
                <span className="text-slate-700">{a.details}{a.user?.name ? ` — ${a.user.name}` : ''}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function LeadTasks({ leadId, users }) {
  const qc = useQueryClient();
  const { can } = useAccess();
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const { data } = useQuery({
    queryKey: ['tasks', { leadId }],
    queryFn: () => listTasks({ leadId }),
  });
  const tasks = data?.tasks || [];

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['tasks'] });
  };

  const addMutation = useMutation({
    mutationFn: () => createTask({ leadId, title, dueDate, assignedTo: assignedTo || null }),
    onSuccess: () => { setTitle(''); setDueDate(''); setAssignedTo(''); invalidate(); },
  });
  const completeMutation = useMutation({ mutationFn: (id) => changeTaskStatus(id, 'COMPLETED'), onSuccess: invalidate });
  const deleteMutation = useMutation({ mutationFn: (id) => deleteTask(id), onSuccess: invalidate });

  return (
    <Card className="p-5 mt-4">
      <h3 className="font-semibold text-slate-700 mb-3">Follow-up tasks</h3>

      {tasks.length === 0 ? (
        <p className="text-sm text-slate-400 mb-3">No tasks yet.</p>
      ) : (
        <ul className="space-y-2 mb-4">
          {tasks.map((t) => {
            const overdue = isOverdue(t);
            return (
              <li key={t.id} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2 last:border-0">
                <div>
                  <span className="font-medium text-slate-800">{t.title}</span>
                  <span className={`ml-2 ${overdue ? 'text-red-600' : 'text-slate-400'}`}>
                    due {new Date(t.dueDate).toLocaleDateString()}{overdue ? ' (overdue)' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TaskBadge status={t.status} />
                  {can('TASKS', 'edit') && t.status !== 'COMPLETED' && (
                    <Button variant="ghost" onClick={() => completeMutation.mutate(t.id)}>Complete</Button>
                  )}
                  {can('TASKS', 'delete') && (
                    <Button variant="ghost" className="text-red-600" onClick={() => deleteMutation.mutate(t.id)}>Delete</Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {can('TASKS', 'create') && (
        <div className="flex flex-wrap gap-2 items-center">
          <Input placeholder="New task..." value={title} onChange={(e) => setTitle(e.target.value)} className="max-w-[220px]" />
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="max-w-[160px]" />
          <Select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="max-w-[160px]">
            <option value="">Unassigned</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </Select>
          <Button onClick={() => addMutation.mutate()} disabled={!title || !dueDate || addMutation.isPending}>
            Add
          </Button>
        </div>
      )}
    </Card>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  );
}
