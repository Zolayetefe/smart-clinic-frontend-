// DoctorAppointments.tsx
import React, { useState } from 'react';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import { Calendar, Clock, User } from 'lucide-react';
import Button from '../../../components/ui/Button';

const DoctorAppointments: React.FC = () => {
  // Mock appointments data
  const appointments = [
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
      status: 'pending'
    }
  ];

  const handleCancelAppointment = (appointmentId: number) => {
    // Handle cancel appointment logic here
    alert(`Appointment with ID ${appointmentId} canceled.`);
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
                      onClick={() => handleCancelAppointment(appointment.id)}
                    >
                      Cancel Appointment
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No appointments scheduled for today</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
        </CardHeader>
        <CardBody>
          <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Past Appointments</h2>
        </CardHeader>
        <CardBody>
          <p className="text-gray-500 text-center py-4">No past appointments</p>
        </CardBody>
      </Card>
    </div>
  );
};

export default DoctorAppointments;

