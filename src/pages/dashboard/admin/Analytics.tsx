import React from 'react';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';

const Analytics = () => {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Patient Statistics</h2>
          </CardHeader>
          <CardBody>
            <div className="text-center py-8">
              <p className="text-gray-500">No data available.</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Appointment Statistics</h2>
          </CardHeader>
          <CardBody>
            <div className="text-center py-8">
              <p className="text-gray-500">No data available.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
