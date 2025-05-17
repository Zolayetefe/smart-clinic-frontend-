import React, { useState } from 'react';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import { Calendar, Clock, User, FileText, Calendar as CalendarIcon } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

interface Appointment {
  id: number;
  patientName: string;
  date: string;
  time: string;
  reason: string;
  status: 'confirmed' | 'completed' | 'rescheduled';
}

interface LabRequest {
  testName: string;
  reason: string;
}

const DoctorAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      patientName: 'John Doe',
      date: '2025-03-15',
      time: '09:00 AM',
      reason: 'Follow-up consultation',
      status: 'confirmed'
    },
    {
      id: 2,
      patientName: 'Jane Smith',
      date: '2025-03-15',
      time: '10:30 AM',
      reason: 'Annual checkup',
      status: 'confirmed'
    }
  ]);

  const [showLabRequestModal, setShowLabRequestModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  const [labRequest, setLabRequest] = useState<LabRequest>({
    testName: '',
    reason: ''
  });

  const [prescription, setPrescription] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });

  const [rescheduleDate, setRescheduleDate] = useState({
    date: '',
    time: ''
  });

  const handleLabRequest = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the lab request to your backend
    console.log('Lab Request:', { appointment: selectedAppointment, labRequest });
    setShowLabRequestModal(false);
    setLabRequest({ testName: '', reason: '' });
  };

  const handlePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the prescription to your backend
    console.log('Prescription:', { appointment: selectedAppointment, prescription });
    setShowPrescriptionModal(false);
    setPrescription({
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    });
  };

  const handleReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAppointment) {
      setAppointments(appointments.map(apt => 
        apt.id === selectedAppointment.id
          ? { ...apt, date: rescheduleDate.date, time: rescheduleDate.time, status: 'rescheduled' as const }
          : apt
      ));
    }
    setShowRescheduleModal(false);
    setRescheduleDate({ date: '', time: '' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Today's Appointments</h2>
        </CardHeader>
        <CardBody>
          {appointments.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="py-4 flex items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-gray-400" />
                      <p className="text-sm font-medium text-gray-900">{appointment.patientName}</p>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(appointment.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.time}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{appointment.reason}</p>
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'rescheduled'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {appointment.status}
                    </span>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowLabRequestModal(true);
                        }}
                      >
                        Request Lab Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowPrescriptionModal(true);
                        }}
                      >
                        Prescribe Medicine
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowRescheduleModal(true);
                        }}
                      >
                        Reschedule
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No appointments scheduled for today</p>
          )}
        </CardBody>
      </Card>

      {/* Lab Request Modal */}
      {showLabRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Request Lab Test</h3>
            <form onSubmit={handleLabRequest} className="space-y-4">
              <Input
                label="Test Name"
                value={labRequest.testName}
                onChange={(e) => setLabRequest({ ...labRequest, testName: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Test
                </label>
                <textarea
                  value={labRequest.reason}
                  onChange={(e) => setLabRequest({ ...labRequest, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowLabRequestModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Prescribe Medicine</h3>
            <form onSubmit={handlePrescription} className="space-y-4">
              <Input
                label="Medication Name"
                value={prescription.medication}
                onChange={(e) => setPrescription({ ...prescription, medication: e.target.value })}
                required
              />
              <Input
                label="Dosage"
                value={prescription.dosage}
                onChange={(e) => setPrescription({ ...prescription, dosage: e.target.value })}
                required
              />
              <Input
                label="Frequency"
                value={prescription.frequency}
                onChange={(e) => setPrescription({ ...prescription, frequency: e.target.value })}
                placeholder="e.g., Twice daily"
                required
              />
              <Input
                label="Duration"
                value={prescription.duration}
                onChange={(e) => setPrescription({ ...prescription, duration: e.target.value })}
                placeholder="e.g., 7 days"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions
                </label>
                <textarea
                  value={prescription.instructions}
                  onChange={(e) => setPrescription({ ...prescription, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPrescriptionModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Submit Prescription
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reschedule Appointment</h3>
            <form onSubmit={handleReschedule} className="space-y-4">
              <Input
                type="date"
                label="New Date"
                value={rescheduleDate.date}
                onChange={(e) => setRescheduleDate({ ...rescheduleDate, date: e.target.value })}
                required
              />
              <Input
                type="time"
                label="New Time"
                value={rescheduleDate.time}
                onChange={(e) => setRescheduleDate({ ...rescheduleDate, time: e.target.value })}
                required
              />
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowRescheduleModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Confirm Reschedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;