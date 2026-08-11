import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Eye, EyeOff, Loader2, CloudSun, Check, X } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', organization: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const validations = [
    { label: 'At least 8 characters', met: form.password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(form.password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(form.password) },
    { label: 'Contains number', met: /\d/.test(form.password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.confirmPassword) { setError('Please fill in all fields'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    const result = await register(form);
    if (result.success) {
      addNotification({ type: 'success', message: 'Account created successfully!' });
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-gray-900 via-gray-800 to-primary-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <CloudSun className="w-32 h-32 text-primary-400 mx-auto mb-8" />
          <h1 className="text-5xl font-bold text-white mb-5">Cloud Asset Inventory</h1>
          <p className="text-gray-300 text-xl max-w-lg mx-auto leading-relaxed">
            Centralized cloud resource management and monitoring for enterprise teams
          </p>
          <div className="flex items-center justify-center gap-10 mt-12">
            {['528 Assets', '4 Accounts', '87% Compliance'].map((stat) => (
              <div key={stat} className="text-center">
                <div className="text-3xl font-bold text-white">{stat.split(' ')[0]}</div>
                <div className="text-base text-gray-400">{stat.split(' ').slice(1).join(' ')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <CloudSun className="w-8 h-8 text-primary-500" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">Cloud Asset Inventory</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create account</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Start managing your cloud assets</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
              <input
                type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="Aditya"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input
                type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="admin@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Organization</label>
              <input
                type="text" value={form.organization} onChange={(e) => update('organization', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value)}
                  className="w-full px-4 py-2.5 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Create a strong password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  {validations.map((v) => (
                    <div key={v.label} className="flex items-center gap-1.5 text-xs">
                      {v.met ? <Check className="w-3 h-3 text-green-500" /> : <X className="w-3 h-3 text-red-400" />}
                      <span className={v.met ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>{v.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
              <input
                type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="Confirm your password"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create account'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account? <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
