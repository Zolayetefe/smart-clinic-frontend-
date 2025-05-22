import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import axios from 'axios';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  // Add useEffect for debugging
  useEffect(() => {
    console.log('Current user state:', user);
  }, [user]);

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
    const loginToast = toast.loading('Logging in...');
    setErrors({});
    setError(null);
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('Starting login process...');
      const loggedInUser = await login(email, password);
      console.log('Login successful, user data:', loggedInUser);

      if (loggedInUser) {
        const role = loggedInUser.role.toLowerCase();
        console.log('User role:', role);

        // Map roles to their corresponding routes
        const roleRoutes: Record<string, string> = {
          admin: '/admin',
          doctor: '/doctor',
          nurse: '/nurse',
          pharmacist: '/pharmacy',
          receptionist: '/reception',
          finance: '/finance',
          lab_technician: '/lab_technician',
          patient: '/patient'
        };

        const route = roleRoutes[role] || '/';
        console.log('Navigating to:', route);
        navigate(route);

        toast.success('Logged in successfully!', {
          id: loginToast
        });
      } else {
        console.error('No user data after successful login');
        setError('Login successful but user data is missing');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }

      toast.error(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        { id: loginToast }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="mt-2 text-2xl font-bold text-gray-900 text-center">Sign in to your account</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

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
