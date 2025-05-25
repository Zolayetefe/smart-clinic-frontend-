import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  Mail, 
  Phone, 
  CheckCircle, 
  Clock, 
  User,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  FileText,
  DollarSign,
  Tag
} from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import { FinanceAppointment } from '../../../../types/finance';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../../../contexts/AuthContext';

type TabType = 'all' | 'pending' | 'approved' | 'rejected';

interface AppointmentsListProps {
  appointments: FinanceAppointment[];
  onApprovalSuccess: () => void;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ appointments, onApprovalSuccess }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [amount, setAmount] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const { user } = useAuth();

  // Use useMemo to prevent unnecessary filtering on every render
  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    if (activeTab !== 'all') {
      if (activeTab === 'approved') {
        filtered = filtered.filter(app => app.financeStatus === 'approved');
      } else {
        filtered = filtered.filter(app => app.status === activeTab);
      }
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        app =>
          app.patient.toLowerCase().includes(searchLower) ||
          app.patientEmail.toLowerCase().includes(searchLower) ||
          app.doctor.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [appointments, activeTab, searchTerm]);

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

  const getStatusBadge = (status: string, financeStatus: string | null) => {
    if (financeStatus === 'approved') {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Payment Approved</span>;
    }
    
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Payment Pending</span>;
      case 'rejected':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Payment Rejected</span>;
      default:
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Status Tabs - Remove 'confirmed' from the options */}
        <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
          {(['all', 'pending', 'approved', 'rejected'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab === 'all' ? 'All' : `${tab.charAt(0).toUpperCase() + tab.slice(1)} Payments`}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="Search patients or doctors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Appointments Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAppointments.map((appointment) => {
          const dateTime = formatDateTime(appointment.appointmentDate);
          return (
            <Card key={appointment.id}>
              <CardBody>
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  {/* Status and DateTime */}
                  <div className="flex flex-col space-y-4 md:w-1/4">
                    <div>{getStatusBadge(appointment.status, appointment.financeStatus)}</div>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span className="text-sm">{dateTime.date}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        <span className="text-sm">{dateTime.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="md:w-1/4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Patient Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium">{appointment.patient}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm">{appointment.patientEmail}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm">{appointment.patientPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="md:w-1/4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Doctor Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium">{appointment.doctor}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm">{appointment.doctorEmail}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm">{appointment.doctorPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details & Actions */}
                  <div className="md:w-1/4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Appointment Details</h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm">{appointment.reason}</span>
                          </div>
                          {appointment.financeStatus === 'approved' && (
                            <div className="flex items-center text-green-600">
                              <DollarSign className="h-4 w-4 mr-2" />
                              <span className="text-sm font-medium">
                                Amount Paid: {appointment.amount} ETB
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {appointment.financeStatus !== 'approved' && appointment.status !== 'rejected' && (
                        <div className="space-y-2">
                          <Input
                            type="number"
                            placeholder="Enter payment amount"
                            value={amount[appointment.id] || ''}
                            onChange={(e) => setAmount({
                              ...amount,
                              [appointment.id]: e.target.value
                            })}
                            className="w-full"
                            leftIcon={<DollarSign className="h-4 w-4" />}
                          />
                          <Button
                            onClick={() => handleApprove(appointment.id)}
                            disabled={!amount[appointment.id]}
                            className="w-full"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Payment
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AppointmentsList; 