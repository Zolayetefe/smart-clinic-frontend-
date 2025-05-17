import React, { useState, useEffect } from 'react';
import { Calendar, Activity, FileText } from 'lucide-react';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  reason: string;
  triageStatus: 'pending' | 'completed';
}

const NurseDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showTriageForm, setShowTriageForm] = useState(false);
  const [triageData, setTriageData] = useState({
    temperature: '',
    bloodPressure: '',
    pulseRate: '',
    symptoms: '',
    notes: ''
  });

  // Mock data initialization
  useEffect(() => {
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        patientName: 'John Doe',
        time: '10:30 AM',
        reason: 'Regular checkup',
        triageStatus: 'pending'
      },
      {
        id: '2',
        patientName: 'Jane Smith',
        time: '11:00 AM',
        reason: 'Follow-up',
        triageStatus: 'pending'
      }
    ];
    setAppointments(mockAppointments);
  }, []);

  const handleTriageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAppointment) {
      // Update appointment triage status
      setAppointments(appointments.map(apt => 
        apt.id === selectedAppointment.id 
          ? { ...apt, triageStatus: 'completed' as const }
          : apt
      ));
      setShowTriageForm(false);
      setSelectedAppointment(null);
      setTriageData({
        temperature: '',
        bloodPressure: '',
        pulseRate: '',
        symptoms: '',
        notes: ''
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTriageData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isAppointmentDue = (time: string) => {
    const now = new Date();
    const [hours, minutes] = time.split(':');
    const appointmentTime = new Date();
    appointmentTime.setHours(parseInt(hours), parseInt(minutes));
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    return minutesDiff <= 30 && minutesDiff > -30; // Within 30 minutes before appointment
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {appointments.map(appointment => (
                <div key={appointment.id} className="border-b pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{appointment.patientName}</h3>
                      <p className="text-sm text-gray-500">{appointment.time}</p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!isAppointmentDue(appointment.time.split(' ')[0]) || appointment.triageStatus === 'completed'}
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowTriageForm(true);
                      }}
                    >
                      {appointment.triageStatus === 'completed' ? 'Completed' : 'Start Triage'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Triage Form Modal */}
      {showTriageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Triage Form - {selectedAppointment?.patientName}
            </h3>
            <form onSubmit={handleTriageSubmit} className="space-y-4">
              <Input
                label="Temperature (°C)"
                type="number"
                name="temperature"
                value={triageData.temperature}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Blood Pressure (mmHg)"
                name="bloodPressure"
                placeholder="120/80"
                value={triageData.bloodPressure}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Pulse Rate (bpm)"
                type="number"
                name="pulseRate"
                value={triageData.pulseRate}
                onChange={handleInputChange}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symptoms
                </label>
                <textarea
                  name="symptoms"
                  value={triageData.symptoms}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={triageData.notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
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
                  Submit Triage
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