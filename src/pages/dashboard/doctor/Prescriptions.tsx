import React from 'react';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';

const Prescriptions = () => {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Prescriptions</h1>
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Recent Prescriptions</h2>
        </CardHeader>
        <CardBody>
          <div className="text-center py-8">
            <p className="text-gray-500">No prescriptions found.</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Prescriptions; 