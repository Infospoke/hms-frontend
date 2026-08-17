import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, KeyRound, FileText, Briefcase, Send, Plus } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import TextField from '../components/ui/TextField.jsx';
import PasswordField from '../components/ui/PasswordField.jsx';
import PhoneField from '../components/ui/PhoneField.jsx';
import Checkbox from '../components/ui/Checkbox.jsx';
import Button from '../components/ui/Button.jsx';
import FeatureCard from '../components/ui/FeatureCard.jsx';
import FileUpload from '../components/ui/FileUpload.jsx';
import AlertBanner from '../components/ui/AlertBanner.jsx';
import PasswordRequirements from '../components/ui/PasswordRequirements.jsx';
import { isValidEmail, isValidPhone, isPasswordStrong } from '../utils/validators.js';
import { createCandidateRequest } from '../lib/api.js';

const FEATURES = [
  { icon: <KeyRound className="h-5 w-5 text-brand-600" />, iconBg: '#EEF0FF', title: 'Create Account', subtitle: 'Quick & Easy' },
  { icon: <FileText className="h-5 w-5 text-emerald-600" />, iconBg: '#E7F8F0', title: 'Complete Profile', subtitle: 'Tell Us About You' },
  { icon: <Briefcase className="h-5 w-5 text-amber-500" />, iconBg: '#FDF0E3', title: 'Find Opportunities', subtitle: 'Explore Jobs' },
  { icon: <Send className="h-5 w-5 text-sky-600" />, iconBg: '#E7F1FE', title: 'Apply & Grow', subtitle: 'Build Your Career' },
];

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Validates the whole form at once so every problem can be shown next to its own field, not one at a time. */
function validateForm({ form, resumeFile }) {
  const errors = {};

  if (!form.firstName.trim()) errors.firstName = 'Enter your first name.';
  if (!form.lastName.trim()) errors.lastName = 'Enter your last name.';
  if (!isValidEmail(form.email)) errors.email = 'Enter a valid email address.';
  if (!isValidPhone(form.phone)) errors.phone = 'Enter a valid phone number.';
  if (!isPasswordStrong(form.password)) {
    errors.password = 'Password does not meet the minimum strength requirements.';
  }
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }
  if (!resumeFile) errors.resume = 'Upload your resume.';
  if (!form.agree) errors.agree = 'You must accept the Terms of Use / Privacy Policy.';

  return errors;
}

export default function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+91',
    phone: '',
    password: '',
    confirmPassword: '',
    agree: true,
  });
  const [fieldErrors, setFieldErrors] = useState({});

  // `resume`/`additionalDoc` hold display metadata for the UI; the matching
  // `*File` state holds the actual File object the FileUpload picker gave
  // us, which is what actually gets sent to the API. (Previously only the
  // display metadata was kept and the real File was thrown away, so upload
  // could never have worked.)
  const [resume, setResume] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [additionalDoc, setAdditionalDoc] = useState(null);
  const [additionalDocFile, setAdditionalDocFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear that field's message as soon as the person starts fixing it,
    // rather than leaving stale errors up until the next full submit.
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handleResumeChange = (file) => {
    if (!file) {
      setResume(null);
      setResumeFile(null);
      return;
    }
    setResume({ name: file.name, type: file.type, size: formatFileSize(file.size) });
    setResumeFile(file);
    setFieldErrors((prev) => (prev.resume ? { ...prev, resume: undefined } : prev));
  };

  // The create API only has one `additionalFile` part (no array field), so
  // picking a new document replaces whichever one was selected before
  // instead of appending to a list — otherwise extra files would silently
  // never reach the server.
  const handleAddDocument = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAdditionalDoc({ name: file.name, size: formatFileSize(file.size) });
    setAdditionalDocFile(file);
    e.target.value = '';
  };

  const removeDocument = () => {
    setAdditionalDoc(null);
    setAdditionalDocFile(null);
  };

  const handleAgreeChange = (e) => {
    const { checked } = e.target;
    setForm((prev) => ({ ...prev, agree: checked }));
    setFieldErrors((prev) => (prev.agree ? { ...prev, agree: undefined } : prev));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = validateForm({ form, resumeFile });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await createCandidateRequest({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email,
        phoneNumber: `${form.phone.replace(/[\s-()]/g, '')}`,
        password: form.password,
        confirmPassword:form.confirmPassword,
        resumeFile,
        additionalFile: additionalDocFile,
      });

      navigate('/login', { state: { accountCreated: true } });
    } catch (err) {
      console.log(err);
      setError(err.message || 'Could not create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="JOIN NEXUS HMS"
      title="Create Your Account"
      highlight="Start Your Journey."
      description="Create your candidate account to explore jobs, apply, track your progress and get hired."
      features={FEATURES.map((f) => (
        <FeatureCard key={f.title} {...f} />
      ))}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
        <KeyRound className="h-6 w-6 text-brand-600" />
      </div>
      <h2 className="mt-5 text-2xl font-extrabold text-slate-900">Create Account</h2>
      <p className="mt-2 text-sm text-slate-500">
        Fill in your details to create your candidate account.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        {error && <AlertBanner variant="error">{error}</AlertBanner>}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            id="firstName"
            label="First Name"
            placeholder="Enter your first name"
            icon={<User className="h-4 w-4" />}
            value={form.firstName}
            onChange={handleChange('firstName')}
            error={fieldErrors.firstName}
            required
          />
          <TextField
            id="lastName"
            label="Last Name"
            placeholder="Enter your last name"
            icon={<User className="h-4 w-4" />}
            value={form.lastName}
            onChange={handleChange('lastName')}
            error={fieldErrors.lastName}
            required
          />
        </div>

        <TextField
          id="email"
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          icon={<Mail className="h-4 w-4" />}
          value={form.email}
          onChange={handleChange('email')}
          error={fieldErrors.email}
          required
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <PhoneField
            id="phone"
            countryCode={form.countryCode}
            onCountryCodeChange={(code) => setForm((prev) => ({ ...prev, countryCode: code }))}
            placeholder="Enter your number"
            value={form.phone}
            onChange={handleChange('phone')}
            error={fieldErrors.phone}
            required
          />
          <PasswordField
            id="password"
            label="Password"
            placeholder="Create a password"
            hint="8+ characters with a mix of letters, numbers & symbols"
            value={form.password}
            onChange={handleChange('password')}
            error={fieldErrors.password}
            required
          />
        </div>
        <PasswordRequirements password={form.password} />

        <PasswordField
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={form.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={fieldErrors.confirmPassword}
          required
        />

        <FileUpload
          label="Upload Resume"
          required
          file={resume}
          onFileChange={handleResumeChange}
          error={fieldErrors.resume}
        />

        <div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Additional Document (Optional)
              </p>
              <p className="text-xs text-slate-500">
                Add one more document that supports your application.
              </p>
            </div>
            <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Plus className="h-4 w-4" />
              {additionalDoc ? 'Replace Document' : 'Add Document'}
              <input type="file" className="hidden" onChange={handleAddDocument} />
            </label>
          </div>

          {additionalDoc && (
            <ul className="mt-3 space-y-2">
              <li className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50">
                    <FileText className="h-4 w-4 text-rose-500" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{additionalDoc.name}</p>
                    <p className="text-xs text-slate-500">{additionalDoc.size}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeDocument}
                  className="text-slate-400 hover:text-rose-500"
                  aria-label={`Remove ${additionalDoc.name}`}
                >
                  &times;
                </button>
              </li>
            </ul>
          )}
        </div>

        <div>
          <Checkbox
            id="agree"
            label="I agree to the Terms & Conditions and Privacy Policy"
            checked={form.agree}
            onChange={handleAgreeChange}
          />
          {fieldErrors.agree && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">{fieldErrors.agree}</p>
          )}
        </div>

        <Button type="submit" showArrow disabled={submitting}>
          {submitting ? 'Creating Account…' : 'Create Account'}
        </Button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
