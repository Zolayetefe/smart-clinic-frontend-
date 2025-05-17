import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const demoCredentials = [
    { role: 'Admin', email: 'admin@smartclinic.com' },
    { role: 'Doctor', email: 'doctor@smartclinic.com' },
    { role: 'Patient', email: 'patient@smartclinic.com' },
    { role: 'Nurse', email: 'nurse@smartclinic.com' },
    { role: 'Pharmasist', email: 'pharmasist@smartclinic.com' },
    { role: 'Receiption', email: 'receiption@smartclinic.com' },
    { role: 'Finance', email: 'finance@smartclinic.com' },
    { role: 'Lab', email: 'lab@smartclinic.com' },
  ];

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password);
      console.log('Login successful');

      // Redirect based on role
      if (email.startsWith('admin')) {
        navigate('/admin');
      } else if (email.startsWith('doctor')) {
        navigate('/doctor');
      } else if (email.startsWith('nurse')) {
        navigate('/nurse');
      } else if (email.startsWith('pharmasist')) {
        navigate('/pharmacy');
      } else if (email.startsWith('receiption')) {
        navigate('/reception');
      } else if (email.startsWith('finance')) {
        navigate('/finance');
      } else if (email.startsWith('lab')) {
        navigate('/lab_technician');
      } else {
        navigate('/patient');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        setErrors({
          email: error.message,
        });
      } else {
        setErrors({
          email: 'An unexpected error occurred',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="mt-2 text-2xl font-bold text-gray-900 text-center">Sign in to your account</h2>

      <form className="mt-8 space-y-6" onSubmit={handleLogin}>
        {errors.email && <div className="error">{errors.email}</div>}
        <div className="space-y-4">
          <Input
            id="email"
            name="email"
            type="email"
            label="Email address"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            leftAddon={<Mail className="h-5 w-5 text-gray-400" />}
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            leftAddon={<Lock className="h-5 w-5 text-gray-400" />}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-medium text-primary hover:text-primary-dark">
              Forgot your password?
            </a>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Sign in'}
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign in with demo account</span>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Select Role
          </label>
          <select
            id="role"
            name="role"
            value={selectedRole}
            onChange={(e) => {
              const role = e.target.value;
              setSelectedRole(role);
              const selectedCred = demoCredentials.find((cred) => cred.role === role);
              if (selectedCred) {
                setEmail(selectedCred.email);
                setPassword('password');
              }
            }}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          >
            <option value="">-- Select Role --</option>
            {demoCredentials.map((cred) => (
              <option key={cred.role} value={cred.role}>
                {cred.role}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary hover:text-primary-dark">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
