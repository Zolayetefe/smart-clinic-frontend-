import React from 'react';
import { Calendar, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { FinanceAppointment } from '../../../../types/finance';

interface StatsProps {
  appointments: FinanceAppointment[];
}

const Stats: React.FC<StatsProps> = ({ appointments }) => {
  const stats = {
    total: appointments.length,
    pending: appointments.filter(app => app.status === 'pending').length,
    approved: appointments.filter(app => app.financeStatus === 'approved').length,
    rejected: appointments.filter(app => app.status === 'rejected').length,
    totalAmount: appointments
      .filter(app => app.financeStatus === 'approved')
      .reduce((sum, app) => sum + (app.amount || 0), 0)
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Appointments</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-full">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Payments</p>
            <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-full">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Approved Payments</p>
            <p className="text-2xl font-semibold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-full">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <p className="text-2xl font-semibold text-primary">
              ${stats.totalAmount.toFixed(2)}
            </p>
          </div>
          <div className="bg-primary/10 p-3 rounded-full">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats; 