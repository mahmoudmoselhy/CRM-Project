import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { login, getMe } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { AuthShell } from './Register';

export default function Login() {
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
      const res = await login(data);
      setAuth({ token: res.token, user: res.user });
      const meRes = await getMe();
      setUser(meRes.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Login to your workspace">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-600 mb-1">Email</label>
          <input type="email" className={input}
            {...register('email', { required: 'Required' })} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Password</label>
          <input type="password" className={input}
            {...register('password', { required: 'Required' })} />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <button disabled={loading} className={button}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-500 text-center">
        No account yet?{' '}
        <Link to="/register" className="text-slate-900 font-medium">Register a company</Link>
      </p>
    </AuthShell>
  );
}

const input =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400';
const button =
  'w-full rounded-lg bg-slate-900 text-white py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-60';
