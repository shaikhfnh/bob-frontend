import { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { springs } from '../../styles/motion';
import { useAuth } from '../../context/AuthContext';
import { loginRequest } from '../../services/authService';
import PasswordInput from '../../components/PasswordInput';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const emailRef = useRef(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginRequest(email, password);
      login(data.token, data.user, remember);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-neutral-900 p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute -bottom-40 -left-20 h-[32rem] w-[32rem] rounded-full bg-brand-red/25 blur-[100px]"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-red text-sm font-bold text-white">B</div>
          <span className="text-sm font-semibold text-white">Boubyan</span>
        </div>

        <div className="relative">
          <p className="text-3xl font-bold leading-tight tracking-[-0.02em] text-white">
            Home-Building
            <br />
            Webinar Series
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
            Manage sessions, track registrations, and support every stage of the home-building journey.
          </p>
        </div>

        <p className="relative text-xs text-white/30">© 2026 Boubyan Bank. Admin Console.</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-white px-6 py-16">
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{
            opacity: 1,
            y: 0,
            x: shake ? [0, -8, 8, -6, 6, -3, 3, 0] : 0,
          }}
          transition={shake ? { duration: 0.4, ease: 'easeInOut' } : springs.default}
          onSubmit={handleSubmit}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-red text-sm font-bold text-white">B</div>
            <span className="text-sm font-semibold text-brand-ink">Boubyan</span>
          </div>

          <h1 className="text-2xl font-bold tracking-[-0.01em] text-brand-ink">Sign in</h1>
          <p className="mt-1.5 text-sm text-brand-muted">Enter your credentials to access the admin console.</p>

          <div className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Email</label>
              <input
                ref={emailRef}
                type="email"
                required
                placeholder="you@boubyan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm text-brand-ink placeholder:text-neutral-400 transition-colors focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Password</label>
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-lg bg-neutral-50 px-3.5 py-3 transition-colors hover:bg-neutral-100">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded  border-neutral-300 accent-brand-red"
                />
                <span className="text-sm font-medium text-brand-ink">Stay signed in</span>
              </div>
              <span className="text-[11px] text-brand-muted">
                {remember ? 'Remember me' : 'This session only'}
              </span>
            </label>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-red py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-red-dark disabled:opacity-60"
            >
              {loading && (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                  className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white"
                />
              )}
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}