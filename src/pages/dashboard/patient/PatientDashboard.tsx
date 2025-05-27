import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, FileText, Clock, Bell, UserPlus, ArrowRight } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import axios from 'axios';
import { categorizeAppointments, formatAppointmentDateTime } from '../../../utils/dateUtils';

// Add interface for appointment
interface Appointment {
  id: string;
  dateTime: string;
  status: string;
  reason: string;
  doctor: {
    id: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    specialization: string;
  };
}

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  

  
  // Mock data for recent prescriptions

  
  
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/patient/appointments', {
          withCredentials: true
        });
        setAppointments(response.data.appointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const { today, upcoming, past } = categorizeAppointments(appointments);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg p-6 shadow-md">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Welcome back, {user?.name}</h2>
            <p className="mt-1 text-white/80">Here's an overview of your health information</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={() => navigate('/patient/book-appointment')}
            >
              Book an Appointment
            </Button>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white">
          <CardBody className="flex flex-col items-center p-6">
            <div className="p-3 bg-primary/10 rounded-full">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Upcoming Appointments</h3>
            <p className="mt-1 text-3xl font-semibold text-primary">{upcoming.length}</p>
            <Link 
              to="/patient/appointments"
              className="mt-4 text-sm text-primary hover:text-primary-dark font-medium flex items-center"
            >
              View all appointments
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardBody>
        </Card>
        
      </div>
      
      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
            <Link 
              to="/patient/appointments"
              className="text-sm text-primary hover:text-primary-dark font-medium flex items-center"
            >
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </CardHeader>
        <CardBody className="px-0 py-0">
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">Loading appointments...</p>
              </div>
            ) : upcoming.length > 0 ? (
              upcoming.map((appointment) => {
                const { date, time } = formatAppointmentDateTime(appointment.dateTime);
                return (
                  <div key={appointment.id} className="p-6 flex items-start">
                    <div className="mr-4 flex-shrink-0">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-medium text-gray-900">
                        Dr. {appointment.doctor.name}
                      </h4>
                      <p className="text-sm text-gray-500">{appointment.doctor.specialization}</p>
                      <p className="text-sm text-gray-500">{appointment.doctor.department}</p>
                      <div className="mt-2 flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">
                          {date} at {time}
                        </span>
                      </div>
                      {appointment.reason && (
                        <p className="mt-2 text-sm text-gray-600">
                          Reason: {appointment.reason}
                        </p>
                      )}
                    </div>
                    <div className="ml-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        appointment.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      } capitalize`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No upcoming appointments</p>
                <Link to="/patient/book-appointment">
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-2"
                    leftIcon={<UserPlus className="h-4 w-4" />}
                  >
                    Book Appointment
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
      
  
      
      {/* Reminders */}
    </div>
  );
};

export default PatientDashboard;