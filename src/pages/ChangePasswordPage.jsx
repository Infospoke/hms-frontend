import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck } from 'lucide-react';
import PasswordField from '../components/ui/PasswordField.jsx';
import Button from '../components/ui/Button.jsx';
import AlertBanner from '../components/ui/AlertBanner.jsx';
import PasswordRequirements from '../components/ui/PasswordRequirements.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { isPasswordStrong } from '../utils/validators.js';
import { changePasswordRequest } from '../lib/api.js';

export default function ChangePasswordPage() {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  // Set by LoginPage when the API signs someone in with a temporary
  // password (responsecode '00' but message says a password change is
  // required) - it routes here instead of the dashboard.
  const mustChangePassword = Boolean(location.state?.mustChangePassword);

  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!form.currentPassword) {
      setError('Enter your current password.');
      return;
    }
    if (!isPasswordStrong(form.newPassword)) {
      setError('New password does not meet the minimum strength requirements.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New Password and Confirm Password do not match.');
      return;
    }
    if (form.newPassword === form.currentPassword) {
      setError('Your new password cannot be the same as your current password.');
      return;
    }

    setSubmitting(true);
    try {
      await changePasswordRequest(token, {
        oldPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess(true);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      // The API returns responsecode '01' with a message like "Old password
      // is incorrect" for a wrong current password, which api.js already
      // surfaces as err.message — no need to re-derive it here.
      setError(err.message || 'Could not change your password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-10 lg:px-10">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Account settings</p>
        <h1 className="mt-2 text-4xl font-extrabold text-slate-900">Change password</h1>
        <p className="mt-3 max-w-xl text-slate-500">
          Keep your account secure with a strong, unique password.
        </p>

        <div className="mt-8 rounded-3xl bg-white p-8 ring-1 ring-slate-100 sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
            <KeyRound className="h-6 w-6 text-brand-600" />
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {mustChangePassword && !success && (
              <AlertBanner variant="info">
                You signed in with a temporary password. Set a new password below to continue.
              </AlertBanner>
            )}
            {error && <AlertBanner variant="error">{error}</AlertBanner>}
            {success && (
              <AlertBanner variant="success">
                Your password has been updated.
              </AlertBanner>
            )}

            <PasswordField
              id="currentPassword"
              label={mustChangePassword ? 'Temporary Password' : 'Current Password'}
              placeholder={mustChangePassword ? 'Enter your temporary password' : 'Enter your current password'}
              value={form.currentPassword}
              onChange={handleChange('currentPassword')}
              required
            />

            <div>
              <PasswordField
                id="newPassword"
                label="New Password"
                placeholder="Create a new password"
                value={form.newPassword}
                onChange={handleChange('newPassword')}
                required
              />
              <PasswordRequirements password={form.newPassword} />
            </div>

            <PasswordField
              id="confirmPassword"
              label="Confirm New Password"
              placeholder="Confirm your new password"
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              required
            />

            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 shrink-0 text-slate-400" />
              For your security, this will not sign you out of your current session.
            </div>

            {mustChangePassword && success ? (
              <Button type="button" showArrow onClick={() => navigate('/dashboard-careers', { replace: true })}>
                Continue to dashboard
              </Button>
            ) : (
              <Button type="submit" showArrow disabled={submitting}>
                {submitting ? 'Updating…' : 'Update Password'}
              </Button>
            )}
          </form>
        </div>
    </main>
  );
}
