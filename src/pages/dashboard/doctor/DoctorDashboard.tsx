import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, User, Clock, FileText, ArrowRight, Stethoscope, Activity } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import axios from 'axios';
import { DoctorAppointment } from '../../../types';
// import { socket } from '../../../utils/socket';
import { useAppointments } from '../../../contexts/AppointmentContext';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { unseenCount, incrementUnseenCount } = useAppointments();

  
  // Mock data for pending actions
  const pendingActions = [
    {
      id: '1',
      type: 'Lab Results',
      patient: 'John Doe',
      date: '2025-03-10',
      description: 'Review blood work results'
    },
    {
      id: '2',
      type: 'Prescription',
      patient: 'Sarah Williams',
      date: '2025-03-11',
      description: 'Renewal request for hypertension medication'
    }
  ];
  
  // Mock data for patient insights (AI-generated)
  const patientInsights = [
    {
      id: '1',
      patient: 'John Doe',
      insight: 'Blood pressure readings show improvement after medication change (-15% systolic average).'
    },
    {
      id: '2',
      patient: 'Emma Johnson',
      insight: 'Consistently elevated glucose levels over the last 3 visits may indicate poor medication adherence.'
    }
  ];
  
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (user?.doctor?.id) {
          const response = await axios.get(`http://localhost:5000/api/doctor/appointments/${user.doctor.id}`, {
            withCredentials: true
          });
          setAppointments(response.data.appointments || []);
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();

    // if (user?.doctor?.id) {
    //   socket.emit('join-doctor-room', user.doctor.id);

    //   socket.on('appointment-update', ({ type, appointment }) => {
    //     if (type === 'new-appointment') {
    //       setAppointments(prev => [...prev, appointment]);
    //       incrementUnseenCount();
    //     } else if (type === 'update-appointment') {
    //       setAppointments(prev => 
    //         prev.map(app => app.id === appointment.id ? appointment : app)
    //       );
    //     } else if (type === 'delete-appointment') {
    //       setAppointments(prev => 
    //         prev.filter(app => app.id !== appointment.id)
    //       );
    //     }
    //   });
    // }

    // return () => {
    //   if (user?.doctor?.id) {
    //     socket.off('appointment-update');
    //   }
    // };
  }, [user, incrementUnseenCount]);

  // Filter today's appointments
  const todayAppointmentsFiltered = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.appointmentDate);
    const today = new Date();
    return appointmentDate.toDateString() === today.toDateString();
  });
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-secondary to-secondary-dark rounded-lg p-6 shadow-md">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Welcome, {user?.name}</h2>
            <p className="mt-1 text-white/80">
              You have {todayAppointmentsFiltered.length} appointments today
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 relative"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={() => navigate('/doctor/appointments')}
            >
              View Schedule
              {unseenCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unseenCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white">
          <CardBody className="flex flex-col items-center p-6">
            <div className="p-3 bg-secondary/10 rounded-full">
              <Calendar className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Today's Appointments</h3>
            <p className="mt-1 text-3xl font-semibold text-secondary">
              {todayAppointmentsFiltered.length}
            </p>
            <Link 
              to="/doctor/appointments"
              className="mt-4 text-sm text-secondary hover:text-secondary-dark font-medium flex items-center"
            >
              View schedule
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardBody>
        </Card>
        
        <Card className="bg-white">
          <CardBody className="flex flex-col items-center p-6">
            <div className="p-3 bg-primary/10 rounded-full">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Pending Actions</h3>
            <p className="mt-1 text-3xl font-semibold text-primary">{pendingActions.length}</p>
            <button 
              className="mt-4 text-sm text-primary hover:text-primary-dark font-medium flex items-center"
            >
              View pending tasks
              <ArrowRight className="ml-1 h-4 w-4" />
            </button>
          </CardBody>
        </Card>
        
        <Card className="bg-white">
          <CardBody className="flex flex-col items-center p-6">
            <div className="p-3 bg-accent/10 rounded-full">
              <User className="h-8 w-8 text-accent" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Total Patients</h3>
            <p className="mt-1 text-3xl font-semibold text-accent">124</p>
            <button 
              className="mt-4 text-sm text-accent hover:text-accent-dark font-medium flex items-center"
            >
              View patient list
              <ArrowRight className="ml-1 h-4 w-4" />
            </button>
          </CardBody>
        </Card>
      </div>
      
      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Today's Appointments</h3>
            <Link 
              to="/doctor/appointments"
              className="text-sm text-secondary hover:text-secondary-dark font-medium flex items-center"
            >
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </CardHeader>
        <CardBody className="px-0 py-0">
          <div className="divide-y divide-gray-200">
            {todayAppointmentsFiltered.map((appointment) => (
              <div key={appointment.id} className="p-6 flex items-start">
                <div className="mr-4 flex-shrink-0">
                  <div className="p-2 bg-secondary/10 rounded-full">
                    <User className="h-6 w-6 text-secondary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <h4 className="text-base font-medium text-gray-900">
                      {appointment.patientName}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-500">{appointment.reason}</p>
                  <div className="mt-2 flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600">
                      {new Date(appointment.appointmentDate).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {appointment.patientEmail} • {appointment.patientPhone}
                  </div>
                </div>
                <div className="ml-4">
                  <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                      : appointment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : appointment.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                  `}>
                    {appointment.status}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => navigate(`/doctor/appointments/${appointment.id}`)}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
            {todayAppointmentsFiltered.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No appointments scheduled for today
              </div>
            )}
          </div>
        </CardBody>
      </Card>
      
    
    </div>
  );
};

export default DoctorDashboard;