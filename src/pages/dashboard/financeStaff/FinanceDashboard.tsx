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
      if (response.data && response.data.data) {
        setAppointments(response.data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch appointments');
      setAppointments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Finance Management</h2>
      </div>

      <Stats appointments={appointments} />

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <AppointmentsList 
          appointments={appointments} 
          onApprovalSuccess={fetchAppointments}
        />
      )}
    </div>
  );
};

export default FinanceDashboard; 