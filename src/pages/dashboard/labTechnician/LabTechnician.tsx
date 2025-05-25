import React, { useEffect, useState } from 'react';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import axios from 'axios';
import { format } from 'date-fns';
import LabResultSidebar from './LabResult';

interface Test {
  testName: string;
  reason: string;
  price?: number;
}

interface LabRequest {
  id: string;
  patientId: string;
  patient: string;
  patientEmail?: string;
  doctorId: string;
  doctor: string;
  doctorEmail: string;
  priority: string | null;
  notes: string;
  tests: Test[];
  status: string;
  createdAt: string;
  apporovalStatus: 'pending' | 'approved';
}

interface LabResult {
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

const LabTechnician: React.FC = () => {
  const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LabRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LabRequest | null>(null);
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showResultDetailModal, setShowResultDetailModal] = useState(false);
  const [labResultInput, setLabResultInput] = useState<Record<string, string>>({});
  const [resultNotes, setResultNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<'name' | 'email'>('name');

  const fetchLabRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/lab', {
        withCredentials: true
      });
      setLabRequests(response.data.labRequests);
      setFilteredRequests(response.data.labRequests);
      setError(null);
    } catch (err) {
      setError('Failed to fetch lab requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    Promise.all([fetchLabRequests(), fetchLabResults()]);
  }, []);

  // Filter lab requests based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRequests(labRequests);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = labRequests.filter(request => {
      if (searchFilter === 'name') {
        return request.patient.toLowerCase().includes(query);
      } else if (searchFilter === 'email') {
        const email = request.patientEmail || '';
        return email.toLowerCase().includes(query);
      }
      return false;
    });
    setFilteredRequests(filtered);
  }, [searchQuery, searchFilter, labRequests]);

  const handleSubmitResult = async () => {
    if (!selectedRequest) return;

    try {
      await axios.post('http://localhost:5000/api/lab/result', {
        labRequestId: selectedRequest.id,
        result: labResultInput,
        notes: resultNotes
      }, {
        withCredentials: true
      });

      setShowResultModal(false);
      setSelectedRequest(null);
      setLabResultInput({});
      setResultNotes('');
      await Promise.all([fetchLabRequests(), fetchLabResults()]); // Refresh both lists
    } catch (err) {
      setError('Failed to submit lab result');
      console.error(err);
    }
  };

  const pendingCount = filteredRequests.filter((r) => r.status === 'requested').length;
  const completedCount = filteredRequests.filter((r) => r.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center mb-6">Lab Technician Dashboard</h1>

      {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Dashboard Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Pending Requests</h2>
          </CardHeader>
          <CardBody>
            <p className="text-3xl text-yellow-600">{pendingCount}</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Completed Requests</h2>
          </CardHeader>
          <CardBody>
            <p className="text-3xl text-green-600">{completedCount}</p>
          </CardBody>
        </Card>
      </div>

      {/* Search Section */}
      <div className="mb-4 flex gap-4 items-end">
        <div className="flex-1">
          <Input
            label="Search Patients"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search by patient ${searchFilter}...`}
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setSearchFilter('name')}
            className={`px-4 py-2 ${
              searchFilter === 'name'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Search by Name
          </Button>
          <Button
            onClick={() => setSearchFilter('email')}
            className={`px-4 py-2 ${
              searchFilter === 'email'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Search by Email
          </Button>
        </div>
      </div>

      {/* Lab Requests Table */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Lab Requests</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-center py-4">Loading...</p>
          ) : filteredRequests.length === 0 ? (
            <p className="text-center py-4 text-gray-500">
              {searchQuery
                ? 'No requests found matching your search'
                : 'No lab requests available'}
            </p>
          ) : (
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Patient</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Doctor</th>
                  <th className="border p-2">Priority</th>
                  <th className="border p-2">Status</th>
                      <th className="border p-2">Payment Status</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req.id}>
                    <td className="border p-2">{req.patient}</td>
                    <td className="border p-2">{req.patientEmail || 'N/A'}</td>
                    <td className="border p-2">{req.doctor}</td>
                    <td className="border p-2">
                      {req.priority ? (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded">
                          {req.priority}
                        </span>
                      ) : (
                        'Normal'
                      )}
                    </td>
                    <td className="border p-2">
                      <span
                        className={`px-2 py-1 rounded text-white ${
                          req.status === 'requested' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="border p-2">
                          <span
                            className={`px-2 py-1 rounded text-white ${
                              req.apporovalStatus === 'approved' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
                          >
                            {req.apporovalStatus === 'approved' ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="border p-2">
                          {format(new Date(req.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="border p-2">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setSelectedRequest(req);
                            setShowDetailModal(true);
                          }}
                        >
                          View Details
                        </Button>
                        {req.status === 'requested' && (
                          <Button
                            onClick={() => {
                              setSelectedRequest(req);
                              setShowResultModal(true);
                            }}
                                disabled={req.apporovalStatus !== 'approved'}
                                className={req.apporovalStatus !== 'approved' ? 'opacity-50 cursor-not-allowed' : ''}
                          >
                            Add Result
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
            </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">Lab Request Details</h3>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Patient: {selectedRequest.patient}</p>
                    <p className="text-gray-600">Email: {selectedRequest.patientEmail || 'N/A'}</p>
                    <p className="text-gray-600">Priority: {selectedRequest.priority || 'Normal'}</p>
              </div>
                  <div>
                    <p className="font-semibold">Doctor: {selectedRequest.doctor}</p>
                    <p className="text-gray-600">Email: {selectedRequest.doctorEmail}</p>
                    <p className="text-gray-600">Status: {selectedRequest.status}</p>
                  </div>
                </div>
                
                {selectedRequest.notes && (
                  <div>
                    <h4 className="font-semibold">Notes:</h4>
                    <p className="bg-gray-50 p-3 rounded">{selectedRequest.notes}</p>
                  </div>
                )}

              <div>
                <h4 className="font-semibold mb-2">Requested Tests:</h4>
                <div className="space-y-2">
                  {selectedRequest.tests.map((test, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                      <p className="font-medium">{test.testName}</p>
                      <p className="text-sm text-gray-600">Reason: {test.reason}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-medium text-green-600">
                              ${test.price || 0}
                            </span>
                          </div>
                        </div>
                    </div>
                  ))}
                  </div>
                  <div className="mt-3 text-right">
                    <p className="font-semibold">
                      Total Amount: ${selectedRequest.tests.reduce((sum, test) => sum + (test.price || 0), 0)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <div>
                    <span className={`px-3 py-1 rounded text-white ${
                      selectedRequest.apporovalStatus === 'approved' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}>
                      Payment {selectedRequest.apporovalStatus === 'approved' ? 'Approved' : 'Pending'}
                    </span>
              </div>
              <Button onClick={() => setShowDetailModal(false)}>Close</Button>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Submission Modal */}
      {showResultModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">Submit Lab Results</h3>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                <h4 className="font-semibold mb-2">Patient Information:</h4>
                <p>Name: {selectedRequest.patient}</p>
                <p>Email: {selectedRequest.patientEmail || 'N/A'}</p>
              </div>
                  <div>
                    <h4 className="font-semibold mb-2">Test Information:</h4>
                    <p>Priority: {selectedRequest.priority || 'Normal'}</p>
                    <p className="text-green-600">Payment Status: Approved</p>
                  </div>
                </div>

                <div>
                <h4 className="font-semibold mb-2">Requested Tests:</h4>
                {selectedRequest.tests.map((test, index) => (
                    <div key={index} className="mb-4 bg-gray-50 p-4 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                    <p className="font-medium">{test.testName}</p>
                          <p className="text-sm text-gray-600">Reason: {test.reason}</p>
                        </div>
                        <span className="text-green-600 font-medium">${test.price || 0}</span>
                      </div>
                    <Input
                      label="Result"
                        value={labResultInput[test.testName] || ''}
                      onChange={(e) =>
                          setLabResultInput((prev) => ({
                          ...prev,
                          [test.testName]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={resultNotes}
                  onChange={(e) => setResultNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSubmitResult}>Submit Results</Button>
                <Button
                  onClick={() => {
                    setShowResultModal(false);
                    setSelectedRequest(null);
                      setLabResultInput({});
                    setResultNotes('');
                  }}
                  className="bg-gray-300 text-black"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
      </div>
    </div>
  );
};

export default LabTechnician;
