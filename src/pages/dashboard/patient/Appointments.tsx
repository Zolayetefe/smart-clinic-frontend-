import React from 'react';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';

const Appointments = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Appointments</h1>
      <div className="grid gap-4">
        <Card>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">Upcoming Appointments</h2>
            <p className="text-gray-600">No upcoming appointments scheduled.</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">Past Appointments</h2>
            <p className="text-gray-600">No past appointments found.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Appointments;