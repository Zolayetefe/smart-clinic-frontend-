import React, { useState, useEffect } from 'react';
import { Activity, FileText, Eye } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import axios from 'axios';
import { format } from 'date-fns';
import LabResultSidebar from './LabResultSidebar';

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
  prescriptionId: string | null;
}

interface Medication {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
}

interface Prescription {
  patientId: string;
  labResultId: string;
  medications: Medication[];
  approvalStatus: 'pending' | 'approved';
  notes: string;
}

const LabRequest: React.FC = () => {
  const { user } = useAuth();
  const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [filteredLabRequests, setFilteredLabRequests] = useState<LabRequest[]>([]);
  const [filteredLabResults, setFilteredLabResults] = useState<LabResult[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<LabRequest | null>(null);
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search states
  const [requestSearchQuery, setRequestSearchQuery] = useState('');
  const [requestSearchFilter, setRequestSearchFilter] = useState<'name' | 'email'>('name');
  const [resultSearchQuery, setResultSearchQuery] = useState('');
  const [resultSearchFilter, setResultSearchFilter] = useState<'name' | 'email'>('name');

  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState<Prescription>({
    patientId: '',
    labResultId: '',
    medications: [
      {
        medicineName: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        quantity: 1
      }
    ],
    approvalStatus: 'pending',
    notes: ''
  });

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
        setFilteredLabRequests(requests);
        setFilteredLabResults(results);
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

  // Filter lab requests based on search query
  useEffect(() => {
    if (!requestSearchQuery.trim()) {
      setFilteredLabRequests(labRequests);
      return;
    }

    const query = requestSearchQuery.toLowerCase().trim();
    const filtered = labRequests.filter(request => {
      if (requestSearchFilter === 'name') {
        return request.patientName.toLowerCase().includes(query);
      } else if (requestSearchFilter === 'email') {
        const email = request.patientEmail || '';
        return email.toLowerCase().includes(query);
      }
      return false;
    });
    setFilteredLabRequests(filtered);
  }, [requestSearchQuery, requestSearchFilter, labRequests]);

  // Filter lab results based on search query
  useEffect(() => {
    if (!resultSearchQuery.trim()) {
      setFilteredLabResults(labResults);
      return;
    }

    const query = resultSearchQuery.toLowerCase().trim();
    const filtered = labResults.filter(result => {
      if (resultSearchFilter === 'name') {
        return result.patientName.toLowerCase().includes(query);
      } else if (resultSearchFilter === 'email') {
        const email = result.patientEmail || '';
        return email.toLowerCase().includes(query);
      }
      return false;
    });
    setFilteredLabResults(filtered);
  }, [resultSearchQuery, resultSearchFilter, labResults]);

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

  const handleAddMedication = () => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          medicineName: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
          quantity: 1
        }
      ]
    }));
  };

  const handleRemoveMedication = (index: number) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleMedicationChange = (index: number, field: keyof Medication, value: string | number) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const handleLabRequestSubmit = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/doctor/prescription',
        prescriptionData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      setShowPrescriptionModal(false);
      // Reset prescription data
      setPrescriptionData({
        patientId: '',
        labResultId: '',
        medications: [
          {
            medicineName: '',
            dosage: '',
            frequency: '',
            duration: '',
            instructions: '',
            quantity: 1
          }
        ],
        approvalStatus: 'pending',
        notes: ''
      });
    } catch (error) {
      console.error('Error submitting prescription:', error);
      setError('Failed to submit prescription');
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
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lab Requests Section */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Lab Requests</h3>
              {/* Search Section */}
              <div className="mt-4 space-y-4">
                <Input
                  placeholder={`Search requests by patient ${requestSearchFilter}...`}
                  value={requestSearchQuery}
                  onChange={(e) => setRequestSearchQuery(e.target.value)}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => setRequestSearchFilter('name')}
                    className={`px-3 py-1 text-sm ${
                      requestSearchFilter === 'name'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Search by Name
                  </Button>
                  <Button
                    onClick={() => setRequestSearchFilter('email')}
                    className={`px-3 py-1 text-sm ${
                      requestSearchFilter === 'email'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Search by Email
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {/* Existing lab requests table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tests
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLabRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.patientName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.patientEmail}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {request.tests.map(t => t.testName).join(', ')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            request.status === 'requested'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(request.requestedAt), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLabRequests.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No lab requests found
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Lab Results Sidebar */}
        <div className="lg:col-span-1 h-[calc(100vh-13rem)]">
          <LabResultSidebar
            labResults={filteredLabResults}
            onSelectResult={setSelectedResult}
          />
        </div>
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
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Created: {format(new Date(selectedResult.createdAt), 'PPP')}
                </p>
                {selectedResult.prescriptionId && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Prescription Created
                  </span>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="primary"
                  onClick={() => {
                    setPrescriptionData({
                      ...prescriptionData,
                      patientId: selectedResult.patientId,
                      labResultId: selectedResult.id
                    });
                    setShowPrescriptionModal(true);
                  }}
                  disabled={!!selectedResult.prescriptionId}
                  className={selectedResult.prescriptionId ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  {selectedResult.prescriptionId ? 'Prescription Added' : 'Write Prescription'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedResult(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Write Prescription</h2>
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {prescriptionData.medications.map((medication, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Medication #{index + 1}</h3>
                    {index > 0 && (
                      <button
                        onClick={() => handleRemoveMedication(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Medicine Name"
                      value={medication.medicineName}
                      onChange={(e) => handleMedicationChange(index, 'medicineName', e.target.value)}
                    />
                    <Input
                      label="Dosage"
                      value={medication.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                    />
                    <Input
                      label="Frequency"
                      value={medication.frequency}
                      onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                    />
                    <Input
                      label="Duration"
                      value={medication.duration}
                      onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                    />
                    <Input
                      label="Quantity"
                      type="number"
                      value={medication.quantity}
                      onChange={(e) => handleMedicationChange(index, 'quantity', parseInt(e.target.value))}
                      min={1}
                    />
                    <Input
                      label="Instructions"
                      value={medication.instructions}
                      onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={handleAddMedication}
                className="w-full"
              >
                Add Another Medication
              </Button>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={prescriptionData.notes}
                  onChange={(e) => setPrescriptionData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={4}
                  placeholder="Additional notes or instructions..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPrescriptionModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleLabRequestSubmit}
                >
                  Submit Prescription
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabRequest;
