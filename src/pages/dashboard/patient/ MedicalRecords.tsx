import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, ArrowRight, Users } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const MedicalRecords: React.FC = () => {
  const { user } = useAuth();

  // Mock data for medical records
  const medicalRecords = [
    {
      id: '1',
      date: '2025-02-28',
      doctor: 'Dr. Sarah Johnson',
      diagnosis: 'Hypertension',
      prescriptions: ['Lisinopril 10mg', 'Aspirin 81mg'],
    },
    {
      id: '2',
      date: '2025-02-15',
      doctor: 'Dr. Robert Williams',
      diagnosis: 'Skin Rash',
      prescriptions: ['Amoxicillin 500mg'],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg p-6 shadow-md">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Medical Records</h2>
            <p className="mt-1 text-white/80">View your past medical visits and prescriptions</p>
          </div>
        </div>
      </div>

      {/* Medical Records */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Past Medical Visits</h3>
            <Link 
              to="/patient/appointments"
              className="text-sm text-primary hover:text-primary-dark font-medium flex items-center"
            >
              View all appointments
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </CardHeader>
        <CardBody className="px-0 py-0">
          <div className="divide-y divide-gray-200">
            {medicalRecords.length > 0 ? (
              medicalRecords.map((record) => (
                <div key={record.id} className="p-6 flex items-start">
                  <div className="mr-4 flex-shrink-0">
                    <div className="p-2 bg-secondary/10 rounded-full">
                      <FileText className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-medium text-gray-900">Visit Date: {new Date(record.date).toLocaleDateString()}</h4>
                    <p className="text-sm text-gray-500">Diagnosed by: {record.doctor}</p>
                    <div className="mt-2 flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {record.diagnosis}
                      </span>
                    </div>
                    <div className="mt-2">
                      {record.prescriptions.map((med, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2 mb-1"
                        >
                          {med}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No medical records available</p>
                <Link to="/patient/appointments">
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-2"
                    leftIcon={<Calendar className="h-4 w-4" />}
                  >
                    Book Appointment
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Additional Records */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
        </CardHeader>
        <CardBody className="px-0 py-0">
          <div className="divide-y divide-gray-200">
            <div className="p-4">
              <h4 className="text-base font-medium text-gray-900">Lab Results</h4>
              <p className="text-sm text-gray-500">No lab results available at the moment.</p>
            </div>
            <div className="p-4">
              <h4 className="text-base font-medium text-gray-900">Vaccination Records</h4>
              <p className="text-sm text-gray-500">No vaccination records available.</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default MedicalRecords;
