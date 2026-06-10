import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listTasks, createTask, changeTaskStatus, deleteTask, isOverdue } from '../api/tasks';
import { listLeads, listAssignableUsers } from '../api/leads';
import { useAccess } from '../hooks/useAccess';
import {
  Button, Input, Select, Textarea, Card, TaskBadge, Spinner, EmptyState, Modal, TASK_STATUSES,
} from '../components/ui';

export default function Tasks() {
  const { can } = useAccess();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('ALL'); // ALL | OVERDUE | status
  const [showCreate, setShowCreate] = useState(false);

  const params =
    filter === 'OVERDUE' ? { overdue: true } : filter === 'ALL' ? {} : { status: filter };

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', filter],
    queryFn: () => listTasks(params),
  });
  const tasks = data?.tasks || [];

  const completeMutation = useMutation({
    mutationFn: (id) => changeTaskStatus(id, 'COMPLETED'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Tasks</h1>
        {can('TASKS', 'create') && <Button onClick={() => setShowCreate(true)}>+ New Task</Button>}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {['ALL', 'OVERDUE', ...TASK_STATUSES].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              filter === f
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {f === 'OVERDUE' ? 'Overdue' : f === 'ALL' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <Card>
        {isLoading ? (
          <Spinner />
        ) : tasks.length === 0 ? (
          <EmptyState message="No tasks found." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="px-4 py-3 font-medium">Task</th>
                <th className="px-4 py-3 font-medium">Lead</th>
                <th className="px-4 py-3 font-medium">Due</th>
                <th className="px-4 py-3 font-medium">Agent</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const overdue = isOverdue(task);
                return (
                  <tr key={task.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-800">{task.title}</td>
                    <td className="px-4 py-3">
                      {task.lead ? (
                        <Link to={`/leads/${task.lead.id}`} className="text-slate-600 hover:text-slate-900 underline">
                          {task.lead.customerName}
                        </Link>
                      ) : (
                        <span className="text-slate-400">General</span>
                      )}
                    </td>
                    <td className={`px-4 py-3 ${overdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                      {new Date(task.dueDate).toLocaleDateString()}
                      {overdue && ' (overdue)'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{task.agent?.name || 'Unassigned'}</td>
                    <td className="px-4 py-3"><TaskBadge status={task.status} /></td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {can('TASKS', 'edit') && task.status !== 'COMPLETED' && (
                        <Button variant="ghost" onClick={() => completeMutation.mutate(task.id)}>
                          Complete
                        </Button>
                      )}
                      {can('TASKS', 'delete') && (
                        <Button variant="ghost" className="text-red-600" onClick={() => deleteMutation.mutate(task.id)}>
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {showCreate && (
        <CreateTaskModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            qc.invalidateQueries({ queryKey: ['tasks'] });
          }}
        />
      )}
    </div>
  );
}

function CreateTaskModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ leadId: '', title: '', dueDate: '', assignedTo: '', notes: '' });
  const [error, setError] = useState('');

  const { data: leadsData } = useQuery({ queryKey: ['leads', {}], queryFn: () => listLeads({}) });
  const { data: usersData } = useQuery({ queryKey: ['assignable'], queryFn: listAssignableUsers });
  const leads = leadsData?.leads || [];
  const users = usersData?.users || [];

  const mutation = useMutation({
    mutationFn: () => createTask({ ...form, assignedTo: form.assignedTo || null }),
    onSuccess: onCreated,
    onError: (err) => setError(err?.response?.data?.message || 'Failed to create task'),
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <Modal open title="New Task" onClose={onClose}>
      <div className="space-y-3">
        <Select value={form.leadId} onChange={set('leadId')}>
          <option value="">No lead (general team task)</option>
          {leads.map((l) => <option key={l.id} value={l.id}>{l.customerName}</option>)}
        </Select>
        <Input placeholder="Task title *" value={form.title} onChange={set('title')} />
        <Input type="date" value={form.dueDate} onChange={set('dueDate')} />
        <Select value={form.assignedTo} onChange={set('assignedTo')}>
          <option value="">Unassigned</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </Select>
        <Textarea rows={2} placeholder="Notes" value={form.notes} onChange={set('notes')} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => { setError(''); mutation.mutate(); }}
            disabled={!form.title || !form.dueDate || mutation.isPending}
          >
            {mutation.isPending ? 'Saving...' : 'Create'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
