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


  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  useEffect(() => {
  if (user) {
    setName(user.name || '');
    setPhone(user.phone || '');
    
    if (user.role === 'patient' && user.patient) {
      setDateOfBirth(user.patient.dateOfBirth?.slice(0, 10) || '');
      setGender(user.patient.gender || '');
      setAddress(user.patient.address || '');
      setEmergencyContact(user.patient.emergencyContact || '');
    }
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

interface PatientProfilePayload {
    dateOfBirth: string;
    gender: string;
    address: string;
    emergencyContact: string;
}

interface ProfilePayload {
    name: string;
    phone: string;
}

type FullProfilePayload = ProfilePayload & Partial<PatientProfilePayload>;

const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setMessage('');
  setError('');

  const payload: FullProfilePayload = {
    name,
    phone,
    ...(user?.role === 'patient' && {
      dateOfBirth,
      gender,
      address,
      emergencyContact,
    }),
  };

  try {
    
    const response = await api.put("/auth/update-profile", payload);

    setMessage('Profile updated successfully');

    // Update context if response returns updated user
   if (response.data?.user) {
  setUser(response.data.user);
}


  } catch (err: any) {
    console.error(err);
    setError(err.response?.data?.message || 'Failed to update profile');
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
      await api.post('/auth/change-password', {
        oldPassword: currentPassword,
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

<div className='flex gap-4 items-center'>
    <div className="w-24 h-24 rounded-full bg-teal-500 text-white flex items-center justify-center text-5xl font-bold">
      {user?.name?.charAt(0).toUpperCase()}
    
    </div>
    <p className='text-2xl font-bold'>{user?.name}</p>
</div>

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

        {user?.role === 'patient' && (
          <>
            <Input
              label="Date of Birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <Input
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            <Input
              label="Emergency Contact"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              required
            />
          </>
        )}

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </Button>
      </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
             {message && <div className="bg-green-100 text-green-800 p-2 rounded">{message}</div>}
             {error && <div className="bg-red-100 text-red-800 p-2 rounded">{error}</div>}
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
