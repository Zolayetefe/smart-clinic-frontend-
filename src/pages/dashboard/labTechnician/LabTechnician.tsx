import React, { useEffect, useState } from 'react';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import axios from 'axios';

interface Test {
  testName: string;
  reason: string;
}

interface LabRequest {
  id: string;
  patientId: string;
  patient: string;
  patientEmail?: string;
  doctorId: string;
  doctor: string;
  priority: string | null;
  notes: string;
  tests: Test[];
  status: string;
  createdAt: string;
}

interface LabResult {
  [key: string]: string;
}

const LabTechnician: React.FC = () => {
  const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LabRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LabRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [labResult, setLabResult] = useState<LabResult>({});
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

  useEffect(() => {
    fetchLabRequests();
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
        // Safely handle email search even if email is undefined
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
        result: labResult,
        notes: resultNotes
      }, {
        withCredentials: true
      });

      setShowResultModal(false);
      setSelectedRequest(null);
      setLabResult({});
      setResultNotes('');
      fetchLabRequests(); // Refresh the list
    } catch (err) {
      setError('Failed to submit lab result');
      console.error(err);
    }
  };

  const pendingCount = filteredRequests.filter((r) => r.status === 'requested').length;
  const completedCount = filteredRequests.filter((r) => r.status === 'completed').length;

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold text-center">Lab Technician Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
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
                      {new Date(req.createdAt).toLocaleDateString()}
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

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">Lab Request Details</h3>
            <div className="space-y-4">
              <div>
                <p className="font-semibold">Patient: {selectedRequest.patient}</p>
                <p className="font-semibold">Email: {selectedRequest.patientEmail || 'N/A'}</p>
                <p className="font-semibold">Doctor: {selectedRequest.doctor}</p>
                <p className="font-semibold">Notes: {selectedRequest.notes}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Requested Tests:</h4>
                <div className="space-y-2">
                  {selectedRequest.tests.map((test, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                      <p className="font-medium">{test.testName}</p>
                      <p className="text-sm text-gray-600">Reason: {test.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={() => setShowDetailModal(false)}>Close</Button>
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
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Patient Information:</h4>
                <p>Name: {selectedRequest.patient}</p>
                <p>Email: {selectedRequest.patientEmail || 'N/A'}</p>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Requested Tests:</h4>
                {selectedRequest.tests.map((test, index) => (
                  <div key={index} className="mb-4">
                    <p className="font-medium">{test.testName}</p>
                    <Input
                      label="Result"
                      value={labResult[test.testName] || ''}
                      onChange={(e) =>
                        setLabResult((prev) => ({
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
                    setLabResult({});
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
    </div>
  );
};

export default LabTechnician;
