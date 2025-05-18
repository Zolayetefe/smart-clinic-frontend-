// DoctorAppointments.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import { Calendar, Clock, User } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { Appointment } from '../../../types';

const DoctorAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (user?.doctor?.id) {
          const response = await axios.get(`http://localhost:5000/api/doctor/appointments/${user.doctor.id}`, {
            withCredentials: true
          });
          setAppointments(response.data);
        }
      } catch (err) {
        setError('Failed to fetch appointments');
        console.error('Error fetching appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filterAppointments = (type: 'today' | 'upcoming' | 'past') => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.dateTime);
      appointmentDate.setHours(0, 0, 0, 0);

      switch (type) {
        case 'today':
          return appointmentDate.getTime() === today.getTime();
        case 'upcoming':
          return appointmentDate.getTime() > today.getTime();
        case 'past':
          return appointmentDate.getTime() < today.getTime();
        default:
          return false;
      }
    });
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const renderAppointmentList = (appointments: Appointment[]) => {
    if (appointments.length === 0) {
      return <p className="text-gray-500 text-center py-4">No appointments</p>;
    }

    return (
      <div className="divide-y divide-gray-200">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="py-4 flex items-start">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-400" />
                <p className="text-sm font-medium text-gray-900">
                  Patient ID: {appointment.patientId}
                </p>
              </div>
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDateTime(appointment.dateTime).date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDateTime(appointment.dateTime).time}</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">{appointment.reason}</p>
            </div>
            <div className="ml-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                appointment.status === 'confirmed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {appointment.status}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {/* Handle appointment action */}}
              >
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Today's Appointments</h2>
        </CardHeader>
        <CardBody>
          {renderAppointmentList(filterAppointments('today'))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
        </CardHeader>
        <CardBody>
          {renderAppointmentList(filterAppointments('upcoming'))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Past Appointments</h2>
        </CardHeader>
        <CardBody>
          {renderAppointmentList(filterAppointments('past'))}
        </CardBody>
      </Card>
    </div>
  );
};

export default DoctorAppointments;

