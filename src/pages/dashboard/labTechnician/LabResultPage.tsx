import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LabResultSidebar, { LabResult } from './LabResult';
import Button from '../../../components/ui/Button';
import { format } from 'date-fns';

const LabResultPage: React.FC = () => {
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
  const [showResultDetailModal, setShowResultDetailModal] = useState(false);

  useEffect(() => {
    const fetchLabResults = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/lab/results', {
          withCredentials: true
        });
        setLabResults(response.data.labResults);
      } catch (err) {
        console.error('Failed to fetch lab results:', err);
      }
    };

    fetchLabResults();
  }, []);

  return (
    <>
      <LabResultSidebar
        labResults={labResults}
        onSelectResult={(result) => {
          setSelectedResult(result);
          setShowResultDetailModal(true);
        }}
      />

      {/* Result Detail Modal */}
      {showResultDetailModal && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold">Lab Result Details</h3>
              <button
                onClick={() => {
                  setShowResultDetailModal(false);
                  setSelectedResult(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Patient Information</h4>
                  <p>Name: {selectedResult.patient}</p>
                  <p>Email: {selectedResult.patientEmail}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Doctor Information</h4>
                  <p>Name: {selectedResult.doctor}</p>
                  <p>Email: {selectedResult.doctorEmail}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Test Results</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {Object.entries(selectedResult.result).map(([test, value]) => (
                    <div key={test} className="flex justify-between py-2 border-b last:border-0">
                      <span className="font-medium">{test}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Requested Tests</h4>
                <div className="space-y-2">
                  {selectedResult.tests.map((test, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                      <p className="font-medium">{test.testName}</p>
                      <p className="text-sm text-gray-600">Reason: {test.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedResult.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="bg-gray-50 p-4 rounded-lg">{selectedResult.notes}</p>
                </div>
              )}

              <div className="text-sm text-gray-500">
                <p>Requested: {format(new Date(selectedResult.requestedAt), 'PPP')}</p>
                <p>Completed: {format(new Date(selectedResult.completedAt), 'PPP')}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => {
                  setShowResultDetailModal(false);
                  setSelectedResult(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LabResultPage; 