// DoctorAppointments.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import { Calendar, Clock, User, X, Plus, Minus, Activity, FileText, Eye } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { DoctorAppointment} from '../../../types';
// import { socket } from '../../../utils/socket';
import { useAppointments } from '../../../contexts/AppointmentContext';
import { format } from 'date-fns';

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

// Add new interface for lab request
interface LabTest {
  testName: string;
  reason: string;
}

interface LabRequest {
  patientId: string;
  priority: 'routine' | 'urgent' | null;
  notes: string;
  tests: LabTest[];
  status: 'requested';
}

// Add test options
const TEST_OPTIONS = [
  'Complete Blood Count (CBC)',
  'Basic Metabolic Panel (BMP)',
  'Comprehensive Metabolic Panel (CMP)',
  'Lipid Panel',
  'Thyroid Stimulating Hormone (TSH)',
  'Hemoglobin A1C',
  'Urinalysis',
  'Liver Function Tests',
  'Chest X-Ray',
  'ECG/EKG',
];

const DoctorAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { unseenCount, resetUnseenCount } = useAppointments();
  const { user } = useAuth();
  const [selectedAppointment, setSelectedAppointment] = useState<DoctorAppointment | null>(null);
  const [showLabRequestForm, setShowLabRequestForm] = useState(false);
  const [labRequest, setLabRequest] = useState<LabRequest>({
    patientId: '',
    priority: null,
    notes: '',
    tests: [{ testName: '', reason: '' }],
    status: 'requested'
  });

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
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                      <div className="text-sm text-gray-500">{appointment.patientEmail}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDateTime(appointment.appointmentDate).date}</div>
                  <div className="text-sm text-gray-500">{formatDateTime(appointment.appointmentDate).time}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      View Details
                    </Button>
                    {appointment.status === 'confirmed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setLabRequest(prev => ({
                            ...prev,
                            patientId: appointment.patientId
                          }));
                          setShowLabRequestForm(true);
                        }}
                      >
                        Request Lab
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Appointment Details Modal */}
        {selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Appointment Details</h2>
                <button onClick={() => setSelectedAppointment(null)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Patient Information</h3>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.patientName}</p>
                    <p className="text-sm text-gray-600">{selectedAppointment.patientEmail}</p>
                    <p className="text-sm text-gray-600">{selectedAppointment.patientPhone}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Appointment Details</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDateTime(selectedAppointment.appointmentDate).date}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(selectedAppointment.appointmentDate).time}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">{selectedAppointment.status}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Reason for Visit</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedAppointment.reason}</p>
                </div>

                {selectedAppointment.symptoms && selectedAppointment.symptoms.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Symptoms</h3>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedAppointment.symptoms.map((symptom, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {symptom}
                        </span>
                      ))}
                    </div>
                      </div>
                )}

                {selectedAppointment.vitals && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Vital Signs</h3>
                    <div className="mt-1 grid grid-cols-3 gap-4">
                      {selectedAppointment.vitals.map((vital, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 capitalize">{vital.type}</p>
                          <p className="text-sm font-medium text-gray-900">
                            {vital.type === 'temperature' && `${vital.value}°C`}
                            {vital.type === 'heartBeat' && `${vital.value} bpm`}
                            {vital.type === 'bloodPressure' && vital.value}
                          </p>
                      </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleAddTest = () => {
    setLabRequest(prev => ({
      ...prev,
      tests: [...prev.tests, { testName: '', reason: '' }]
    }));
  };

  const handleRemoveTest = (index: number) => {
    setLabRequest(prev => ({
      ...prev,
      tests: prev.tests.filter((_, i) => i !== index)
    }));
  };

  const handleTestChange = (index: number, field: keyof LabTest, value: string) => {
    setLabRequest(prev => ({
      ...prev,
      tests: prev.tests.map((test, i) => 
        i === index ? { ...test, [field]: value } : test
      )
    }));
  };

  const handleLabRequestSubmit = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/doctor/lab-requests',
        labRequest,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 201) {
        setShowLabRequestForm(false);
        setLabRequest({
          patientId: '',
          priority: null,
          notes: '',
          tests: [{ testName: '', reason: '' }],
          status: 'requested'
        });
      }
    } catch (error) {
      console.error('Error submitting lab request:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-secondary to-secondary-dark rounded-lg p-6 shadow-md">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Lab Requests & Results</h2>
            <p className="mt-1 text-white/80">Manage lab requests and results for your patients</p>
          </div>
        </div>
      </div>

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

      {/* Lab Request Form Modal */}
      {showLabRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Request Lab Tests</h2>
              <button 
                onClick={() => setShowLabRequestForm(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={labRequest.priority || ''}
                  onChange={(e) => setLabRequest(prev => ({
                    ...prev,
                    priority: e.target.value as 'routine' | 'urgent' | null
                  }))}
                >
                  <option value="">Select Priority</option>
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  rows={3}
                  value={labRequest.notes}
                  onChange={(e) => setLabRequest(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  placeholder="Add any additional notes..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Tests</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddTest}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Test
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {labRequest.tests.map((test, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <select
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                          value={test.testName}
                          onChange={(e) => handleTestChange(index, 'testName', e.target.value)}
                        >
                          <option value="">Select Test</option>
                          {TEST_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                          placeholder="Reason for test"
                          value={test.reason}
                          onChange={(e) => handleTestChange(index, 'reason', e.target.value)}
                        />
                      </div>
                      {index > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveTest(index)}
                          className="mt-1"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowLabRequestForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleLabRequestSubmit}
                  disabled={!labRequest.priority || labRequest.tests.some(t => !t.testName || !t.reason)}
                >
                  Submit Request
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;

