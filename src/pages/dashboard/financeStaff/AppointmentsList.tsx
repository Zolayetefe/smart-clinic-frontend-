import React, { useState, useMemo } from 'react';
import { Search, Calendar, Mail, Phone, CheckCircle, DollarSign } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { FinanceAppointment } from '../../../types/finance';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';

interface AppointmentsListProps {
  appointments: FinanceAppointment[];
  onApprovalSuccess: () => void;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ appointments, onApprovalSuccess }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [amount, setAmount] = useState<{ [key: string]: string }>({});
  const { user } = useAuth();

  const filteredAppointments = appointments.filter(
    appointment =>
      appointment.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = async (appointmentId: string) => {
    if (!amount[appointmentId] || isNaN(Number(amount[appointmentId]))) {
      toast.error('Please enter a valid amount');
      return;
    }

    const approvalToast = toast.loading('Processing approval...');

    try {
      await axios.post(
        `http://localhost:5000/api/finance/appointments/${appointmentId}/approve`,
        {
          amount: Number(amount[appointmentId]),
          financeStaffId: user?.id,
          approvalStatus: 'approved'
        },
        { withCredentials: true }
      );

      toast.success('Appointment approved successfully', {
        id: approvalToast
      });
      onApprovalSuccess();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to approve appointment',
        { id: approvalToast }
      );
    }
  };

  const formatAmount = (amount: string | null) => {
    if (!amount) return '0.00';
    return Number(amount).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardBody>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Search by patient name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardBody>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Appointments</h3>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appointment Info
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{appointment.patient}</span>
                        <span className="text-sm text-gray-500 flex items-center mt-1">
                          <Mail className="h-4 w-4 mr-1" />
                          {appointment.patientEmail}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center mt-1">
                          <Phone className="h-4 w-4 mr-1" />
                          {appointment.patientPhone}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{appointment.doctor}</span>
                        <span className="text-sm text-gray-500 flex items-center mt-1">
                          <Mail className="h-4 w-4 mr-1" />
                          {appointment.doctorEmail}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center mt-1">
                          <Phone className="h-4 w-4 mr-1" />
                          {appointment.doctorPhone}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(appointment.appointmentDate).toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 mt-1">
                          Reason: {appointment.reason}
                        </span>
                        <span className={`text-sm mt-1 ${
                          appointment.status === 'pending' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          Status: {appointment.status}
                        </span>
                        {appointment.financeStatus === 'approved' && (
                          <div className="flex items-center text-green-600">
                            <DollarSign className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">
                              Amount Paid: ${formatAmount(appointment.amount)}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-2">
                        {!appointment.financeStatus && (
                          <>
                            <Input
                              type="number"
                              placeholder="Enter amount"
                              value={amount[appointment.id] || ''}
                              onChange={(e) => setAmount({
                                ...amount,
                                [appointment.id]: e.target.value
                              })}
                              className="w-32"
                            />
                            <Button
                              onClick={() => handleApprove(appointment.id)}
                              disabled={!amount[appointment.id]}
                              className="flex items-center"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AppointmentsList; 