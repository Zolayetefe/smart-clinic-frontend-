// src/pages/Profile.tsx
import React, { useEffect, useState } from 'react';
import { User as UserIcon, Phone, Lock } from 'lucide-react';
import { useAuth, api } from '../contexts/AuthContext';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Profile = () => {
  const { user, setUser, loading } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone ?? "");
    }
  }, [user]);

  useEffect(() => {
    if (message || error) {
      const timeout = setTimeout(() => {
        setMessage('');
        setError('');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [message, error]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await api.put('/staff/profile', { name, phone });
      setUser(response.data.updatedStaff);
      setMessage('Profile updated successfully');
    } catch (err) {
      console.error(err);
      setError('Failed to update profile');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      await api.put('/staff/change-password', {
        currentPassword,
        newPassword,
      });
      setMessage('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setError('Failed to change password');
    }
  };

  return (
    <div className="w-full space-y-8">

      {message && <div className="bg-green-100 text-green-800 p-2 rounded">{message}</div>}
      {error && <div className="bg-red-100 text-red-800 p-2 rounded">{error}</div>}

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Profile Details</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <Input
              label="Name"
              leftAddon={<UserIcon className="h-4 w-4 text-gray-400" />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Phone"
              leftAddon={<Phone className="h-4 w-4 text-gray-400" />}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              type="password"
              label="Current Password"
              leftAddon={<Lock className="h-4 w-4 text-gray-400" />}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              label="New Password"
              leftAddon={<Lock className="h-4 w-4 text-gray-400" />}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              label="Confirm Password"
              leftAddon={<Lock className="h-4 w-4 text-gray-400" />}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default Profile;
