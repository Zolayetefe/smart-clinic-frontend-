import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Calendar, MapPin, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-hot-toast';
import axios from 'axios';

// Update interface to match AuthContext's RegisterData
interface RegisterFormData {
  // Basic user info
  name: string;
  email: string;
  password: string;
  confirmPassword: string; // Only for form validation
  role: string;
  
  // Personal information
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  
  // Contact information
  address: string;
  emergencyContact: string;
  
  // Optional department field
  department?: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient', // Default role
    fullName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    address: '',
    emergencyContact: '',
    department: 'General' // Default department
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Update fullName when name changes
    if (name === 'name') {
      setFormData(prev => ({ ...prev, fullName: value }));
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.address) {
      newErrors.address = 'Address is required';
    }

    if (!formData.emergencyContact) {
      newErrors.emergencyContact = 'Emergency contact is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const registerToast = toast.loading('Creating account...');
    
    if (!validateForm()) {
      toast.error('Please check all required fields', { id: registerToast });
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const { confirmPassword, ...registrationData } = formData;
      const response = await axios.post('http://localhost:5000/api/auth/patient/register', registrationData);
      
      if (response.data) {
        toast.success('Account created successfully! Please login.', {
          id: registerToast,
          duration: 3000
        });
        
        // Navigate to login immediately after successful registration
        navigate('/login', { 
          state: { 
            email: formData.email,
            message: 'Registration successful! Please login with your credentials.'
          }
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setErrors({
        submit: error.response?.data?.message || 'Registration failed. Please try again.'
      });
      
      toast.error(
        error.response?.data?.message || 'Registration failed. Please try again.',
        { id: registerToast }
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="animate-fade-in">
      <h2 className="mt-2 text-2xl font-bold text-gray-900 text-center">Create Patient Account</h2>
      
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="name"
          name="name"
          type="text"
          label="Full Name"
          autoComplete="name"
          required
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          leftAddon={<User className="h-5 w-5 text-gray-400" />}
        />
        
        <Input
          id="email"
          name="email"
          type="email"
          label="Email address"
          autoComplete="email"
          required
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          leftAddon={<Mail className="h-5 w-5 text-gray-400" />}
        />
        
        <Input
          id="phone"
          name="phone"
          type="tel"
          label="Phone Number"
          autoComplete="tel"
          required
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          leftAddon={<Phone className="h-5 w-5 text-gray-400" />}
        />

          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            label="Date of Birth"
            required
            value={formData.dateOfBirth}
            onChange={handleChange}
            error={errors.dateOfBirth}
            leftAddon={<Calendar className="h-5 w-5 text-gray-400" />}
          />

          <div className="space-y-1">
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
            )}
          </div>

          <Input
            id="emergencyContact"
            name="emergencyContact"
            type="tel"
            label="Emergency Contact"
            required
            value={formData.emergencyContact}
            onChange={handleChange}
            error={errors.emergencyContact}
            leftAddon={<Heart className="h-5 w-5 text-gray-400" />}
          />

          <div className="col-span-full">
            <Input
              id="address"
              name="address"
              type="text"
              label="Address"
              required
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              leftAddon={<MapPin className="h-5 w-5 text-gray-400" />}
            />
          </div>
        
        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete="new-password"
          required
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          leftAddon={<Lock className="h-5 w-5 text-gray-400" />}
          helperText="Password must be at least 6 characters"
        />
        
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          autoComplete="new-password"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          leftAddon={<Lock className="h-5 w-5 text-gray-400" />}
        />
        </div>
        
        {errors.submit && (
          <div className="text-red-500 text-sm text-center mt-2">
            {errors.submit}
          </div>
        )}
        
        <div className="mt-6">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
          >
            Register as Patient
          </Button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;