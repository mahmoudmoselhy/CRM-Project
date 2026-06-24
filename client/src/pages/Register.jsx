import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { registerCompany, getMe } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      const res = await registerCompany(data);
      setAuth({ token: res.token, user: res.user });
      const meRes = await getMe();
      setUser(meRes.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your company" subtitle="Start your CRM workspace">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Company name" error={errors.companyName}>
          <input className={input} {...register('companyName', { required: 'Required' })} />
        </Field>
        <Field label="Your name" error={errors.name}>
          <input className={input} {...register('name', { required: 'Required' })} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input type="email" className={input}
            {...register('email', { required: 'Required' })} />
        </Field>
        <Field label="Password" error={errors.password}>
          <input type="password" className={input}
            {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })} />
        </Field>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <button disabled={loading} className={button}>
          {loading ? 'Creating...' : 'Create account'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-500 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-slate-900 font-medium">Login</Link>
      </p>
    </AuthShell>
  );
}

const input =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400';
const button =
  'w-full rounded-lg bg-slate-900 text-white py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-60';

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm text-slate-600 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error.message}</p>}
    </div>
  );
}

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="text-center mb-6">
          <span className="inline-block text-lg font-bold text-slate-900">Wasl <span className="text-blue-600">CRM</span></span>
        </div>
        <h1 className="text-xl font-bold text-slate-800">{title}</h1>
        <p className="text-sm text-slate-500 mb-6">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
