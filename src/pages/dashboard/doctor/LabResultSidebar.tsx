import React from 'react';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

interface LabResult {
  id: string;
  labRequestId: string;
  labTechnicianId: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  doctorEmail: string;
  labTechnicianName: string;
  labTechnicianEmail: string;
  result: Record<string, string>;
  notes: string;
  createdAt: string;
  prescriptionId: string | null;
}

interface LabResultSidebarProps {
  labResults: LabResult[];
  onSelectResult: (result: LabResult) => void;
  className?: string;
}

const LabResultSidebar: React.FC<LabResultSidebarProps> = ({
  labResults,
  onSelectResult,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Lab Results</h2>
        <p className="text-sm text-gray-500 mt-1">
          {labResults.length} result{labResults.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="divide-y divide-gray-200">
        {labResults.map((result) => (
          <div key={result.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start">
              <div className="mr-4 flex-shrink-0">
                <div className="p-2 bg-accent/10 rounded-full">
                  <Activity className="h-5 w-5 text-accent" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {result.patientName}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {format(new Date(result.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Tests: {Object.keys(result.result).join(', ')}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {result.prescriptionId ? (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-green-100 text-green-800">
                      Prescription Added
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800">
                      Needs Prescription
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectResult(result)}
                    className="ml-auto text-sm"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {labResults.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No lab results available
          </div>
        )}
      </div>
    </div>
  );
};

export default LabResultSidebar; 