import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, FileText, Activity, ArrowRight } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const LabRequest: React.FC = () => {
  const { user } = useAuth();

  // Mock data for lab results and requests
  const [labResults, setLabResults] = useState([
    {
      id: '1',
      patientName: 'John Doe',
      result: 'Blood work shows improvement in cholesterol levels',
      date: '2025-03-10',
    },
    {
      id: '2',
      patientName: 'Jane Smith',
      result: 'Normal blood pressure readings',
      date: '2025-03-08',
    },
  ]);

  const [labRequests, setLabRequests] = useState([
    {
      id: '1',
      patientName: 'John Doe',
      requestDate: '2025-03-10',
      test: 'Complete Blood Count (CBC)',
      status: 'Pending',
    },
    {
      id: '2',
      patientName: 'Sarah Williams',
      requestDate: '2025-03-11',
      test: 'Blood Glucose Level',
      status: 'Completed',
    },
  ]);

  const handleRequestSubmit = () => {
    // Mock submission of lab request
    setLabRequests([
      ...labRequests,
      {
        id: `${labRequests.length + 1}`,
        patientName: 'New Patient',
        requestDate: new Date().toLocaleDateString(),
        test: 'Liver Function Test',
        status: 'Pending',
      },
    ]);
  };

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

      {/* Lab Request and Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lab Requests */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Lab Requests</h3>
          </CardHeader>
          <CardBody className="px-0 py-0">
            <div className="divide-y divide-gray-200">
              {labRequests.map((request) => (
                <div key={request.id} className="p-4 flex items-start">
                  <div className="mr-4 flex-shrink-0">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium text-gray-900">{request.patientName}</h4>
                      <span className="ml-2 text-sm text-gray-500">{request.requestDate}</span>
                    </div>
                    <p className="text-sm text-gray-500">Test: {request.test}</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        request.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                </div>
              ))}
              {labRequests.length === 0 && (
                <div className="p-4 text-center text-gray-500">No lab requests</div>
              )}
            </div>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={handleRequestSubmit}
            >
              Submit New Lab Request
            </Button>
          </CardBody>
        </Card>

        {/* Lab Results */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Lab Results</h3>
          </CardHeader>
          <CardBody className="px-0 py-0">
            <div className="divide-y divide-gray-200">
              {labResults.map((result) => (
                <div key={result.id} className="p-4 flex items-start">
                  <div className="mr-4 flex-shrink-0">
                    <div className="p-2 bg-accent/10 rounded-full">
                      <Activity className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium text-gray-900">{result.patientName}</h4>
                      <span className="ml-2 text-sm text-gray-500">{result.date}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{result.result}</p>
                  </div>
                </div>
              ))}
              {labResults.length === 0 && (
                <div className="p-4 text-center text-gray-500">No lab results available</div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default LabRequest;
