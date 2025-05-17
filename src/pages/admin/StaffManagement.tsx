import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  department: string;
}

interface StaffFormData {
  name: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  department: string;
}

const StaffManagement: React.FC = () => {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<StaffFormData>({
    name: '',
    email: '',
    password: '',
    role: '',
    phone: '',
    department: '',
  });

  // API instance
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Fetch staff data
  const fetchStaffs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/staff');
      setStaffs(response.data.staff);
      setError(null);
    } catch (err) {
      setError('Failed to fetch staff data');
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle staff registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/admin/staff/register', formData);
      
      // Reset form and refresh staff list
      setFormData({
        name: '',
        email: '',
        password: '',
        role: '',
        phone: '',
        department: '',
      });
      setShowForm(false);
      fetchStaffs(); // Refresh the staff list
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to register staff');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <Button
          variant="primary"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Add Staff
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            >
              <option value="">Select Role</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="lab_technician">Lab Technician</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="receptionist">Receptionist</option>
            </select>
            <Input
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              Register Staff
            </Button>
          </div>
        </form>
      )}

      {loading && !showForm ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staffs.map((staff) => (
                <tr key={staff.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{staff.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{staff.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">{staff.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{staff.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{staff.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {/* Handle edit */}}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {/* Handle delete */}}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StaffManagement; 