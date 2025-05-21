import React, { useState, useEffect } from 'react';
import { Calendar, Activity, FileText, Search, User, Phone, Mail } from 'lucide-react';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { NurseAppointment, Vital } from '../../../types/nurse';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

const NurseDashboard = () => {
  const [appointments, setAppointments] = useState<NurseAppointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<NurseAppointment | null>(null);
  const [showTriageForm, setShowTriageForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [triageData, setTriageData] = useState<Vital[]>([
    { type: 'temperature', value: '' },
    { type: 'heartBeat', value: '' },
    { type: 'bloodPressure', value: '' }
  ]);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/nurse/appointments', {
        withCredentials: true
      });
      setAppointments(response.data.data.appointments);
    } catch (error) {
      toast.error('Failed to fetch appointments');
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleTriageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment || !user?.id) return;

    const validVitals = triageData.every(vital => vital.value.trim() !== '');
    if (!validVitals) {
      toast.error('Please fill in all vital measurements');
      return;
    }

    const checkInToast = toast.loading('Submitting vitals...');

    try {
      await axios.post(
        `http://localhost:5000/api/nurse/appointments/${selectedAppointment.id}/check-in`,
        {
          nurseId: user.nurse?.id,
          vitals: triageData
        },
        { withCredentials: true }
      );

      toast.success('Vitals submitted successfully', { id: checkInToast });
      setShowTriageForm(false);
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to submit vitals', { id: checkInToast });
    }
  };

  const handleVitalChange = (type: Vital['type'], value: string) => {
    setTriageData(prev => 
      prev.map(vital => 
        vital.type === type ? { ...vital, value } : vital
      )
    );
  };

  const filteredAppointments = appointments.filter(appointment => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      appointment.patientName.toLowerCase().includes(searchLower) ||
      appointment.patientEmail.toLowerCase().includes(searchLower);
    return matchesSearch;
  });

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const getAppointmentStatus = (appointment: NurseAppointment) => {
    if (appointment.vitals) {
      return {
        canRecordVitals: false,
        message: 'Vitals already recorded',
        buttonStyle: 'text-green-600'
      };
    }
    
    if (appointment.financeStatus !== 'approved') {
      return {
        canRecordVitals: false,
        message: 'Payment not approved',
        buttonStyle: 'text-red-600'
      };
    }

    return {
      canRecordVitals: true,
      message: 'Record Vitals',
      buttonStyle: 'text-primary'
    };
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
          <h2 className="text-lg font-semibold">Today's Appointments</h2>
          </CardHeader>
          <CardBody>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map(appointment => {
                const status = getAppointmentStatus(appointment);
                
                return (
                  <div key={appointment.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-5 w-5 text-gray-400" />
                          <span className="font-medium">{appointment.patientName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{appointment.patientEmail}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{appointment.patientPhone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatDateTime(appointment.appointmentDate)}
                          </span>
                        </div>
                        {appointment.symptoms && appointment.symptoms.length > 0 && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Symptoms: </span>
                            {appointment.symptoms.join(', ')}
                          </div>
                        )}
                        {appointment.vitals && (
                          <div className="mt-2 space-y-1">
                            <div className="text-sm font-medium text-green-600">
                              Recorded Vitals:
                            </div>
                            {appointment.vitals.map((vital, index) => (
                              <div key={index} className="text-sm text-gray-600">
                                {vital.type === 'temperature' && `Temperature: ${vital.value}°F`}
                                {vital.type === 'heartBeat' && `Heart Rate: ${vital.value} bpm`}
                                {vital.type === 'bloodPressure' && `Blood Pressure: ${vital.value} mmHg`}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                      <div className="flex flex-col items-end space-y-2">
                    <Button
                          variant={status.canRecordVitals ? "primary" : "outline"}
                      size="sm"
                          disabled={!status.canRecordVitals}
                      onClick={() => {
                            if (status.canRecordVitals) {
                        setSelectedAppointment(appointment);
                        setShowTriageForm(true);
                            }
                      }}
                    >
                          {status.message}
                    </Button>
                        {!status.canRecordVitals && !appointment.vitals && (
                          <span className={`text-xs ${status.buttonStyle}`}>
                            {status.message}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </CardBody>
        </Card>

      {/* Vitals Form Modal */}
      {showTriageForm && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Record Vitals - {selectedAppointment.patientName}
            </h3>
            <form onSubmit={handleTriageSubmit} className="space-y-4">
              <Input
                label="Temperature (°F)"
                type="text"
                value={triageData.find(v => v.type === 'temperature')?.value || ''}
                onChange={(e) => handleVitalChange('temperature', e.target.value)}
                required
              />
              <Input
                label="Heart Beat (bpm)"
                type="text"
                value={triageData.find(v => v.type === 'heartBeat')?.value || ''}
                onChange={(e) => handleVitalChange('heartBeat', e.target.value)}
                required
              />
              <Input
                label="Blood Pressure (mmHg)"
                type="text"
                placeholder="120/80"
                value={triageData.find(v => v.type === 'bloodPressure')?.value || ''}
                onChange={(e) => handleVitalChange('bloodPressure', e.target.value)}
                required
              />
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowTriageForm(false);
                    setSelectedAppointment(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Submit Vitals
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseDashboard;