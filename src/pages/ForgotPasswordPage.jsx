import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck, Clock, KeyRound } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import TextField from '../components/ui/TextField.jsx';
import Button from '../components/ui/Button.jsx';
import FeatureCard from '../components/ui/FeatureCard.jsx';
import AlertBanner from '../components/ui/AlertBanner.jsx';
import { isValidEmail } from '../utils/validators.js';
import { forgotPasswordRequest } from '../lib/api.js';

const FEATURES = [
  { icon: <Mail className="h-5 w-5 text-brand-600" />, iconBg: '#EEF0FF', title: 'Check Your Email', subtitle: "We'll send a code" },
  { icon: <Clock className="h-5 w-5 text-amber-500" />, iconBg: '#FDF0E3', title: 'Time-Limited', subtitle: 'Expires in 15 min' },
  { icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />, iconBg: '#E7F8F0', title: 'Secure Reset', subtitle: 'One-time use' },
];

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      await forgotPasswordRequest(email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Could not send the temporary password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout
        eyebrow="FORGOT PASSWORD"
        title="Check Your"
        highlight="Email."
        description="If an account exists for that address, we've sent a time-limited temporary password to it."
        features={FEATURES.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
          <Mail className="h-6 w-6 text-emerald-600" />
        </div>
        <h2 className="mt-5 text-2xl font-extrabold text-slate-900">Check your inbox</h2>
        <p className="mt-2 text-sm text-slate-500">
          If <span className="font-semibold text-slate-700">{email}</span> is registered with Nexus
          HMS, a temporary password is on its way. It expires in 15 minutes and can only be used
          once.
        </p>

        {/* There's no separate reset-password screen — a temporary password
            IS the sign-in password. Logging in with it routes straight to
            Change Password (see LoginPage's "temporary password" check). */}
        <AlertBanner variant="info" className="mt-6">
          Please sign in using that temporary password. You&apos;ll be asked to set a new password
          right after.
        </AlertBanner>

        <div className="mt-6 space-y-3">
          <Button showArrow onClick={() => navigate('/login')}>
            Go to Sign In
          </Button>
          <Button variant="ghost" onClick={() => setSent(false)}>
            Use a different email
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="FORGOT PASSWORD"
      title="Reset Your"
      highlight="Password."
      description="Enter the email address on your candidate account and we'll send you a temporary password to sign back in."
      features={FEATURES.map((f) => (
        <FeatureCard key={f.title} {...f} />
      ))}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
        <KeyRound className="h-6 w-6 text-brand-600" />
      </div>
      <h2 className="mt-5 text-2xl font-extrabold text-slate-900">Forgot Password?</h2>
      <p className="mt-2 text-sm text-slate-500">
        No worries — enter your registered email and we'll get you a temporary password.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && <AlertBanner variant="error">{error}</AlertBanner>}

        <TextField
          id="email"
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" showArrow disabled={submitting}>
          {submitting ? 'Sending…' : 'Send Temporary Password'}
        </Button>

        <p className="text-center text-sm text-slate-500">
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Back to Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
