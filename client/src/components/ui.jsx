// Small set of reusable, consistently-styled UI building blocks (Tailwind).

export function Button({ variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-1 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-slate-600 hover:bg-slate-100',
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 ${className}`}
      {...props}
    />
  );
}

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 ${className}`}
      {...props}
    />
  );
}

export function Card({ className = '', children }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 ${className}`}>{children}</div>
  );
}

const STATUS_STYLES = {
  NEW: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-amber-100 text-amber-700',
  FOLLOW_UP: 'bg-purple-100 text-purple-700',
  WON: 'bg-green-100 text-green-700',
  LOST: 'bg-red-100 text-red-700',
};

export function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}

export function Spinner({ label = 'Loading...' }) {
  return <div className="py-10 text-center text-slate-400 text-sm">{label}</div>;
}

export function EmptyState({ message }) {
  return (
    <div className="py-12 text-center text-slate-400 text-sm border border-dashed border-slate-300 rounded-xl">
      {message}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const LEAD_STATUSES = ['NEW', 'CONTACTED', 'FOLLOW_UP', 'WON', 'LOST'];

const TASK_STATUS_STYLES = {
  PENDING: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
};

export function TaskBadge({ status }) {
  const cls = TASK_STATUS_STYLES[status] || 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}

export const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

export function StatCard({ label, value, accent = 'text-slate-800' }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-1 text-3xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}

const BAR_COLORS = {
  NEW: 'bg-blue-500',
  CONTACTED: 'bg-amber-500',
  FOLLOW_UP: 'bg-purple-500',
  WON: 'bg-green-500',
  LOST: 'bg-red-500',
};

// Simple horizontal bar chart (no external library).
// data: [{ label, value, key? }]
export function BarChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <div className="w-28 text-sm text-slate-600 shrink-0">{d.label}</div>
          <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full ${BAR_COLORS[d.key] || 'bg-slate-500'}`}
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
          <div className="w-8 text-sm text-slate-700 text-right">{d.value}</div>
        </div>
      ))}
    </div>
  );
}
