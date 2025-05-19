import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import { Calendar, Clock, User, MapPin, Phone, UserPlus } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { formatAppointmentDateTime } from '../../../utils/dateUtils';
import { useAuth } from '../../../contexts/AuthContext';

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Appointment {
  id: string;
  dateTime: string;
  status: string;
  reason: string;
  doctor: Doctor;
  patient: Patient;
}

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/patient/appointments', {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.data && response.data.appointments) {
          setAppointments(response.data.appointments);
        } else {
          console.error('Invalid response format:', response.data);
          setError('Failed to load appointments: Invalid data format');
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Failed to load appointments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const now = new Date();
  const upcomingAppointments = appointments.filter(app => new Date(app.dateTime) >= now);
  const pastAppointments = appointments.filter(app => new Date(app.dateTime) < now);

  const renderAppointmentCard = (appointment: Appointment) => {
    const { date, time } = formatAppointmentDateTime(appointment.dateTime);
    
    return (
      <div key={appointment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Dr. {appointment.doctor.name}</h3>
                <p className="text-sm text-gray-500">{appointment.doctor.specialization}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
              appointment.status === 'confirmed' 
                ? 'bg-green-100 text-green-800' 
                : appointment.status === 'completed'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {appointment.status}
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center text-gray-500">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{date}</span>
            </div>
            
            <div className="flex items-center text-gray-500">
              <Clock className="h-5 w-5 mr-2" />
              <span>{time}</span>
            </div>
            
            <div className="flex items-center text-gray-500">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{appointment.doctor.specialization}</span>
            </div>
            
            <div className="flex items-center text-gray-500">
              <Phone className="h-5 w-5 mr-2" />
              <span>{appointment.doctor.phone}</span>
            </div>
            
            {appointment.reason && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-1">Reason for Visit</h4>
                <p className="text-sm text-gray-600">{appointment.reason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <Link to="/patient/book-appointment">
          <Button
            variant="primary"
            leftIcon={<UserPlus className="h-4 w-4" />}
          >
            Book New Appointment
          </Button>
        </Link>
      </div>

      <div className="space-y-8">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Loading appointments...</p>
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingAppointments.map(renderAppointmentCard)}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No upcoming appointments scheduled.</p>
                <Link to="/patient/book-appointment">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<UserPlus className="h-4 w-4" />}
                  >
                    Book an Appointment
                  </Button>
                </Link>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Past Appointments */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Past Appointments</h2>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Loading appointments...</p>
              </div>
            ) : pastAppointments.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {pastAppointments.map(renderAppointmentCard)}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No past appointments found.</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Appointments;