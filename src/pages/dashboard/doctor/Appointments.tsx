// DoctorAppointments.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import { Calendar, Clock, User } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { DoctorAppointment} from '../../../types';
// import { socket } from '../../../utils/socket';
import { useAppointments } from '../../../contexts/AppointmentContext';

interface Vitals {
  temperature?: string;
  heartRate?: number;
  bloodPressure?: string;
}

// export interface DoctorAppointment {
//   id: string;
//   patientId: string;
//   doctorId: string;
//   appointmentDate: string;
//   status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
//   reason: string;
//   patientName: string;
//   patientEmail: string;
//   patientPhone: string;
//   symptoms?: string[];
//   vitals?: Vitals;
// }

export interface DoctorAppointmentsResponse {
  appointments: DoctorAppointment[];
}

const DoctorAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { unseenCount, resetUnseenCount } = useAppointments();
  const { user } = useAuth();

  useEffect(() => {
    // Reset unseen count when component mounts
    resetUnseenCount();
    
    const fetchAppointments = async () => {
      try {
        if (user?.doctor?.id) {
          const response = await axios.get(`http://localhost:5000/api/doctor/appointments/${user.doctor.id}`, {
            withCredentials: true
          });
          setAppointments(response.data.appointments || []); // Handle the appointments array from response
        }
      } catch (err) {
        setError('Failed to fetch appointments');
        console.error('Error fetching appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchAppointments();

    // Socket connection and event handling
    // if (user?.doctor?.id) {
    //   // Join both role and doctor-specific rooms
    //   socket.emit('join-role-room', 'doctor');
    //   socket.emit('join-doctor-room', user.doctor.id);

    //   // Listen for appointment updates
    //   socket.on('appointment-update', ({ type, appointment, triage, slot }) => {
    //     console.log('Received appointment update:', { type, appointment, triage, slot });
        
    //     switch (type) {
    //       case 'new-appointment':
    //         setAppointments(prev => {
    //           // Check if appointment already exists
    //           const exists = prev.some(app => app.id === appointment.id);
    //           if (exists) return prev;
    //           return [...prev, appointment];
    //         });
    //         break;
            
    //       case 'update-appointment':
    //         setAppointments(prev => 
    //           prev.map(app => app.id === appointment.id ? { ...app, ...appointment } : app)
    //         );
    //         break;
            
    //       case 'delete-appointment':
    //         setAppointments(prev => 
    //           prev.filter(app => app.id !== appointment.id)
    //         );
    //         break;
    //     }
    //   });
    // }

    // Cleanup
    // return () => {
    //   if (user?.doctor?.id) {
    //     socket.off('appointment-update');
    //     socket.emit('leave-role-room', 'doctor');
    //     socket.emit('leave-doctor-room', user.doctor.id);
    //   }
    // };
  }, [user, resetUnseenCount]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filterAppointments = (type: 'today' | 'upcoming' | 'past') => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);
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

  const renderAppointmentList = (appointments: DoctorAppointment[]) => {
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
                  {appointment.patientName}
                </p>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                  <span>{formatDateTime(appointment.appointmentDate).date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                  <span>{formatDateTime(appointment.appointmentDate).time}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{appointment.reason}</p>
              {appointment.symptoms && appointment.symptoms.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500">Symptoms: </span>
                  <span className="text-xs text-gray-700">
                    {appointment.symptoms.join(', ')}
                  </span>
                </div>
              )}
              {appointment.vitals && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500">Vitals: </span>
                  <div className="text-xs text-gray-700">
                    {appointment.vitals.temperature && (
                      <div>Temperature: {appointment.vitals.temperature}</div>
                    )}
                    {appointment.vitals.heartRate && (
                      <div>Heart Rate: {appointment.vitals.heartRate} bpm</div>
                    )}
                    {appointment.vitals.bloodPressure && (
                      <div>Blood Pressure: {appointment.vitals.bloodPressure}</div>
                    )}
                  </div>
                </div>
              )}
                  </div>
                  <div className="ml-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                  : appointment.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : appointment.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
              }`}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
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
      {/* Unseen appointments indicator */}
      {unseenCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-2">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  New Appointments
                </h3>
                <p className="text-sm text-blue-600">
                  You have {unseenCount} new appointment{unseenCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetUnseenCount}
              className="text-blue-600 hover:text-blue-700"
            >
              Mark as seen
            </Button>
          </div>
        </div>
      )}

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

