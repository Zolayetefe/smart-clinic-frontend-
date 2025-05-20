import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FinanceAppointment } from '../../../types/finance';
import AppointmentsList from './components/AppointmentsList';
import Stats from './components/Stats';

const FinanceDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<FinanceAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/finance/appointments', {
        withCredentials: true
      });
      setAppointments(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Finance Management</h2>
      </div>

      <Stats appointments={appointments} />

      <AppointmentsList 
        appointments={appointments} 
        onApprovalSuccess={fetchAppointments}
      />
    </div>
  );
};

export default FinanceDashboard; 