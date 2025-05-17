import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, Clock, Bell, UserPlus, ArrowRight } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Mock data for upcoming appointments
  const upcomingAppointments = [
    { 
      id: '1', 
      doctorName: 'Dr. Sarah Johnson', 
      specialty: 'Cardiologist',
      date: '2025-03-15', 
      time: '10:00 AM', 
      status: 'confirmed'
    },
    { 
      id: '2', 
      doctorName: 'Dr. Michael Chen', 
      specialty: 'Dermatologist',
      date: '2025-03-22', 
      time: '2:30 PM', 
      status: 'confirmed'
    }
  ];
  
  // Mock data for recent prescriptions
  const recentPrescriptions = [
    {
      id: '1',
      date: '2025-02-28',
      doctor: 'Dr. Sarah Johnson',
      medications: ['Lisinopril 10mg', 'Aspirin 81mg']
    },
    {
      id: '2',
      date: '2025-02-15',
      doctor: 'Dr. Robert Williams',
      medications: ['Amoxicillin 500mg']
    }
  ];
  
  // Mock data for reminders
  const reminders = [
    {
      id: '1',
      type: 'Appointment',
      message: 'Cardiology checkup tomorrow at 10:00 AM',
      date: '2025-03-14'
    },
    {
      id: '2',
      type: 'Medication',
      message: 'Take Lisinopril daily before breakfast',
      date: '2025-03-01'
    },
    {
      id: '3',
      type: 'Lab Test',
      message: 'Blood work results are available',
      date: '2025-03-05'
    }
  ];
  
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
              onClick={() => window.location.href = '/patient/book-appointment'}
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
            <p className="mt-1 text-3xl font-semibold text-primary">{upcomingAppointments.length}</p>
            <Link 
              to="/patient/appointments"
              className="mt-4 text-sm text-primary hover:text-primary-dark font-medium flex items-center"
            >
              View all appointments
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardBody>
        </Card>
        
        <Card className="bg-white">
          <CardBody className="flex flex-col items-center p-6">
            <div className="p-3 bg-secondary/10 rounded-full">
              <FileText className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Prescriptions</h3>
            <p className="mt-1 text-3xl font-semibold text-secondary">{recentPrescriptions.length}</p>
            <Link 
              to="/patient/records"
              className="mt-4 text-sm text-secondary hover:text-secondary-dark font-medium flex items-center"
            >
              View all prescriptions
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardBody>
        </Card>
        
        <Card className="bg-white">
          <CardBody className="flex flex-col items-center p-6">
            <div className="p-3 bg-accent/10 rounded-full">
              <Bell className="h-8 w-8 text-accent" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Reminders</h3>
            <p className="mt-1 text-3xl font-semibold text-accent">{reminders.length}</p>
            <button 
              className="mt-4 text-sm text-accent hover:text-accent-dark font-medium flex items-center"
            >
              View all reminders
              <ArrowRight className="ml-1 h-4 w-4" />
            </button>
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
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="p-6 flex items-start">
                  <div className="mr-4 flex-shrink-0">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-medium text-gray-900">{appointment.doctorName}</h4>
                    <p className="text-sm text-gray-500">{appointment.specialty}</p>
                    <div className="mt-2 flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">
                        {new Date(appointment.date).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })} at {appointment.time}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))
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
      
      {/* Recent Prescriptions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Prescriptions</h3>
            <Link 
              to="/patient/records"
              className="text-sm text-primary hover:text-primary-dark font-medium flex items-center"
            >
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </CardHeader>
        <CardBody className="px-0 py-0">
          <div className="divide-y divide-gray-200">
            {recentPrescriptions.map((prescription) => (
              <div key={prescription.id} className="p-6 flex items-start">
                <div className="mr-4 flex-shrink-0">
                  <div className="p-2 bg-secondary/10 rounded-full">
                    <FileText className="h-6 w-6 text-secondary" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center">
                    <h4 className="text-base font-medium text-gray-900">Prescription</h4>
                    <span className="ml-2 text-sm text-gray-500">
                      {new Date(prescription.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">By {prescription.doctor}</p>
                  <div className="mt-2">
                    {prescription.medications.map((med, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-1"
                      >
                        {med}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
      
      {/* Reminders */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Reminders</h3>
        </CardHeader>
        <CardBody className="px-0 py-0">
          <div className="divide-y divide-gray-200">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="p-4 flex items-start">
                <div className="mr-4 flex-shrink-0">
                  <div className="p-2 bg-accent/10 rounded-full">
                    <Bell className="h-5 w-5 text-accent" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                      {reminder.type}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(reminder.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{reminder.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default PatientDashboard;