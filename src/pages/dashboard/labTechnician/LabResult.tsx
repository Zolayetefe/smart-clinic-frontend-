import React from 'react';
import { format } from 'date-fns';
import Button from '../../../components/ui/Button';

interface Test {
  testName: string;
  reason: string;
}

export interface LabResult {
  id: string;
  labRequestId: string;
  patientId: string;
  patient: string;
  patientEmail: string;
  doctorId: string;
  doctor: string;
  doctorEmail: string;
  result: Record<string, string>;
  notes: string;
  createdAt: string;
  priority: string | null;
  tests: Test[];
  requestedAt: string;
  completedAt: string;
}

interface LabResultProps {
  labResults: LabResult[];
  onSelectResult: (result: LabResult) => void;
}

const LabResultSidebar: React.FC<LabResultProps> = ({ labResults, onSelectResult }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Lab Results</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {labResults.map((result) => (
          <div
            key={result.id}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-medium text-lg">{result.patient}</h3>
                <p className="text-sm text-gray-500">{result.patientEmail}</p>
              </div>
              <span className="text-sm text-gray-500">
                {format(new Date(result.createdAt), 'MMM dd, yyyy')}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Doctor:</span> {result.doctor}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Tests:</span> {result.tests.map(t => t.testName).join(', ')}
              </p>
            </div>

            <div className="flex items-center gap-2 mb-4">
              {result.priority && (
                <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">
                  {result.priority}
                </span>
              )}
              <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                Completed
              </span>
            </div>

            <Button
              onClick={() => onSelectResult(result)}
              className="w-full"
            >
              View Details
            </Button>
          </div>
        ))}
        {labResults.length === 0 && (
          <div className="col-span-full text-center py-8 bg-white rounded-lg">
            <p className="text-gray-500 text-lg">No lab results available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabResultSidebar;
