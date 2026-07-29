import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Search, FileText, Sparkles, Users, Briefcase, Grid3x3 } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import TextField from '../components/ui/TextField.jsx';
import PasswordField from '../components/ui/PasswordField.jsx';
import Checkbox from '../components/ui/Checkbox.jsx';
import Button from '../components/ui/Button.jsx';
import FeatureCard from '../components/ui/FeatureCard.jsx';
import AlertBanner from '../components/ui/AlertBanner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { isValidEmail } from '../utils/validators.js';
import { loginRequest } from '../lib/api.js';
import {
  recordFailedAttempt,
  clearAttempts,
  getLockoutRemainingMs,
  MAX_LOGIN_ATTEMPTS,
} from '../lib/authStore.js';

const FEATURES = [
  { icon: <Search className="h-5 w-5 text-brand-600" />, iconBg: '#EEF0FF', title: 'Search Jobs', subtitle: 'Find roles' },
  { icon: <FileText className="h-5 w-5 text-emerald-600" />, iconBg: '#E7F8F0', title: 'Apply', subtitle: 'Submit apps' },
  { icon: <Sparkles className="h-5 w-5 text-amber-500" />, iconBg: '#FDF0E3', title: 'AI Screening', subtitle: 'Auto-matched' },
  { icon: <Users className="h-5 w-5 text-sky-600" />, iconBg: '#E7F1FE', title: 'Interview', subtitle: 'Meet the team' },
  { icon: <Briefcase className="h-5 w-5 text-rose-500" />, iconBg: '#FCE9EF', title: 'Offer', subtitle: 'Get hired' },
  { icon: <Grid3x3 className="h-5 w-5 text-violet-600" />, iconBg: '#EFEBFC', title: 'Join', subtitle: 'Day one' },
];

// Generic, non-specific message per FRD: "System shall display a generic,
// non-specific error message for invalid email/password combinations."
const GENERIC_LOGIN_ERROR = 'Invalid email or password. Please try again.';

function formatLockout(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [lockoutMs, setLockoutMs] = useState(0);

  // Bug fix: lockoutMs was only ever set once on a failed submit and never
  // ticked back down, so the Sign In button stayed disabled forever after a
  // lockout instead of re-enabling once the 2-minute window passed.
  useEffect(() => {
    if (lockoutMs <= 0) return undefined;
    const id = setInterval(() => {
      const remaining = getLockoutRemainingMs(form.email);
      setLockoutMs(remaining);
      if (remaining <= 0) setError('');
    }, 1000);
    return () => clearInterval(id);
  }, [lockoutMs, form.email]);

  const infoMessage = location.state?.resetSuccess
    ? 'Password reset successful. Sign in with your new password.'
    : location.state?.accountCreated
    ? 'Account created! Sign in to continue.'
    : '';

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(form.email) || !form.password) {
      setError('Enter your email and password.');
      return;
    }

    const remaining = getLockoutRemainingMs(form.email);
    if (remaining > 0) {
      setLockoutMs(remaining);
      setError(`Too many failed attempts. Try again in ${formatLockout(remaining)}.`);
      return;
    }

    setSubmitting(true);
    try {
      const result = await loginRequest(form.email, form.password);
      clearAttempts(form.email);
      login(result.data.token);

      // When a candidate signs in with a temporary password (e.g. right
      // after "Forgot Password"), the API still returns responsecode '00'
      // and a usable token, but the message tells us a password change is
      // required before they can use the rest of the app. Route straight to
      // Change Password instead of the dashboard in that case.
      const mustChangePassword = /temporary password/i.test(result.message || '');
      if (mustChangePassword) {
        navigate('/dashboard-careers/change-password', {
          replace: true,
          state: { mustChangePassword: true },
        });
      } else {
        navigate(location.state?.from || '/dashboard-careers', { replace: true });
      }
    } catch (err) {
      const attempt = recordFailedAttempt(form.email);
      if (attempt.lockedUntil && attempt.lockedUntil > Date.now()) {
        const ms = attempt.lockedUntil - Date.now();
        setLockoutMs(ms);
        setError(`Too many failed attempts. Your account is locked for ${formatLockout(ms)}.`);
      } else {
        // Surface the backend's actual reason (e.g. "Invalid Credentials",
        // "Temporary password expired. Please use Forgot Password again.")
        // instead of a one-size-fits-all message.
        setError(err.message || GENERIC_LOGIN_ERROR);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="WELCOME TO NEXUS HMS"
      title="Your Next Career"
      highlight="Starts Here."
      description="Apply to thousands of opportunities, track interviews and ace every stage of the process."
      features={FEATURES.map((f) => (
        <FeatureCard key={f.title} {...f} />
      ))}
    >
      <h2 className="text-2xl font-extrabold text-slate-900">Welcome Back! 👋</h2>
      <p className="mt-2 text-sm text-slate-500">Login to continue your hiring journey.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {infoMessage && !error && <AlertBanner variant="success">{infoMessage}</AlertBanner>}
        {error && <AlertBanner variant="error">{error}</AlertBanner>}

        <TextField
          id="email"
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="h-4 w-4" />}
          value={form.email}
          onChange={handleChange('email')}
          required
        />

        <PasswordField
          id="password"
          label="Password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange('password')}
          required
        />

        <div className="flex items-center justify-between">
          <Checkbox
            id="remember"
            label="Remember Me"
            checked={form.remember}
            onChange={(e) => setForm((prev) => ({ ...prev, remember: e.target.checked }))}
          />
          <Link to="/forgot-password" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" showArrow disabled={submitting || lockoutMs > 0}>
          {submitting ? 'Signing In…' : 'Sign In'}
        </Button>

        <p className="text-center text-xs text-slate-400">
          Accounts lock for 2 minutes after {MAX_LOGIN_ATTEMPTS} failed attempts.
        </p>

        <p className="text-center text-sm text-slate-500">
          New to Nexus HMS?{' '}
          <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-700">
            Create Account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
