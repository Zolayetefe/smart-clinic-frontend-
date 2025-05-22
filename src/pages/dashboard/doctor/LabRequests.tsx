import React, { useState, useEffect } from 'react';
import { Activity, FileText, Eye } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import axios from 'axios';
import { format } from 'date-fns';

// Types for Lab Requests and Results
interface LabTest {
  reason: string;
  testName: string;
}

interface LabRequestResult {
  id: string;
  labRequestId: string;
  labTechnicianId: string;
  result: Record<string, string>;
  notes: string;
  createdAt: string;
}

interface LabRequest {
  id: string;
  doctorId: string;
  patientId: string;
  patientPhone: string;
  patientName: string;
  patientEmail: string;
  status: 'requested' | 'completed';
  notes: string;
  priority: string | null;
  tests: LabTest[];
  requestedAt: string;
  completedAt: string | null;
  result: LabRequestResult | null;
}

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
}

const LabRequest: React.FC = () => {
  const { user } = useAuth();
  const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<LabRequest | null>(null);
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Separate functions for API calls
  const fetchLabRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/doctor/lab-requests', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching lab requests:', error);
      throw error;
    }
  };

  const fetchLabResults = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/doctor/lab-results', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching lab results:', error);
      throw error;
    }
  };

  // Function to handle lab request submission
  const submitLabRequest = async (requestData: any) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/doctor/lab-requests',
        requestData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting lab request:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [requests, results] = await Promise.all([
          fetchLabRequests(),
          fetchLabResults()
        ]);
        setLabRequests(requests);
        setLabResults(results);
        setError(null);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to fetch lab data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Function to refresh lab requests
  const refreshLabRequests = async () => {
    try {
      const requests = await fetchLabRequests();
      setLabRequests(requests);
    } catch (error) {
      console.error('Error refreshing lab requests:', error);
      setError('Failed to refresh lab requests.');
    }
  };

  // Function to handle new lab request
  const handleNewLabRequest = async (requestData: any) => {
    try {
      await submitLabRequest(requestData);
      await refreshLabRequests(); // Refresh the list after successful submission
      return true;
    } catch (error) {
      console.error('Error handling new lab request:', error);
      setError('Failed to submit lab request. Please try again.');
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-secondary to-secondary-dark rounded-lg p-6 shadow-md">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Lab Requests & Results</h2>
            <p className="mt-1 text-white/80">Manage lab requests and results for your patients</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={() => {
                // Handle new lab request button click
                // You can implement the form modal here
              }}
              className="bg-white text-secondary hover:bg-gray-50"
            >
              New Lab Request
            </Button>
          </div>
        </div>
      </div>

      {/* Lab Request and Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lab Requests Card */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Lab Requests</h3>
          </CardHeader>
          <CardBody className="px-0 py-0">
            <div className="divide-y divide-gray-200">
              {labRequests.map((request) => (
                <div key={request.id} className="p-4 flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="mr-4 flex-shrink-0">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium text-gray-900">{request.patientName}</h4>
                        <span className="ml-2 text-sm text-gray-500">
                          {format(new Date(request.requestedAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Tests: {request.tests.map(t => t.testName).join(', ')}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          request.status === 'requested' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {request.status}
                        </span>
                        {request.priority && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {request.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                </div>
              ))}
              {labRequests.length === 0 && (
                <div className="p-4 text-center text-gray-500">No lab requests</div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Lab Results Card */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Lab Results</h3>
          </CardHeader>
          <CardBody className="px-0 py-0">
            <div className="divide-y divide-gray-200">
              {labResults.map((result) => (
                <div key={result.id} className="p-4 flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="mr-4 flex-shrink-0">
                      <div className="p-2 bg-accent/10 rounded-full">
                        <Activity className="h-5 w-5 text-accent" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium text-gray-900">{result.patientName}</h4>
                        <span className="ml-2 text-sm text-gray-500">
                          {format(new Date(result.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        Tests: {Object.keys(result.result).join(', ')}
                      </p>
                      <p className="text-sm text-gray-500">
                        Lab Technician: {result.labTechnicianName}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedResult(result)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                </div>
              ))}
              {labResults.length === 0 && (
                <div className="p-4 text-center text-gray-500">No lab results available</div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Lab Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Lab Request Details</h2>
              <button onClick={() => setSelectedRequest(null)} className="text-gray-500 hover:text-gray-700">
                <Eye className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Patient Information</h4>
                <p>Name: {selectedRequest.patientName}</p>
                <p>Email: {selectedRequest.patientEmail}</p>
                <p>Phone: {selectedRequest.patientPhone}</p>
              </div>
              <div>
                <h4 className="font-medium">Request Details</h4>
                <p>Status: {selectedRequest.status}</p>
                <p>Priority: {selectedRequest.priority || 'Normal'}</p>
                <p>Requested At: {format(new Date(selectedRequest.requestedAt), 'PPP')}</p>
                {selectedRequest.completedAt && (
                  <p>Completed At: {format(new Date(selectedRequest.completedAt), 'PPP')}</p>
                )}
              </div>
              <div>
                <h4 className="font-medium">Tests</h4>
                <ul className="list-disc pl-5">
                  {selectedRequest.tests.map((test, index) => (
                    <li key={index}>
                      {test.testName} - Reason: {test.reason}
                    </li>
                  ))}
                </ul>
              </div>
              {selectedRequest.notes && (
                <div>
                  <h4 className="font-medium">Notes</h4>
                  <p>{selectedRequest.notes}</p>
                </div>
              )}
              {selectedRequest.result && (
                <div>
                  <h4 className="font-medium">Results</h4>
                  <div className="mt-2">
                    {Object.entries(selectedRequest.result.result).map(([test, value]) => (
                      <div key={test} className="flex justify-between py-2 border-b">
                        <span className="font-medium">{test}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                  {selectedRequest.result.notes && (
                    <p className="mt-2 text-sm text-gray-600">{selectedRequest.result.notes}</p>
                  )}
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedRequest(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lab Result Detail Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Lab Result Details</h2>
              <button onClick={() => setSelectedResult(null)} className="text-gray-500 hover:text-gray-700">
                <Eye className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Patient Information</h4>
                <p>Name: {selectedResult.patientName}</p>
                <p>Email: {selectedResult.patientEmail}</p>
              </div>
              <div>
                <h4 className="font-medium">Lab Technician</h4>
                <p>Name: {selectedResult.labTechnicianName}</p>
                <p>Email: {selectedResult.labTechnicianEmail}</p>
              </div>
              <div>
                <h4 className="font-medium">Test Results</h4>
                <div className="mt-2">
                  {Object.entries(selectedResult.result).map(([test, value]) => (
                    <div key={test} className="flex justify-between py-2 border-b">
                      <span className="font-medium">{test}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {selectedResult.notes && (
                <div>
                  <h4 className="font-medium">Notes</h4>
                  <p>{selectedResult.notes}</p>
                </div>
              )}
              <p className="text-sm text-gray-500">
                Created: {format(new Date(selectedResult.createdAt), 'PPP')}
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedResult(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabRequest;
