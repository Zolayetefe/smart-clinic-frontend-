import React, { useEffect, useState } from 'react';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const mockLabRequests = [
  {
    id: 'req1',
    patientName: 'Abebe Bekele',
    doctorName: 'Dr. Amanuel',
    testType: 'Blood Test',
    status: 'pending',
    result: '',
  },
  {
    id: 'req2',
    patientName: 'Sara Mekonnen',
    doctorName: 'Dr. Hana',
    testType: 'Urine Test',
    status: 'completed',
    result: 'No abnormalities detected.',
  },
];

const LabTechnician: React.FC = () => {
  const [labRequests, setLabRequests] = useState<typeof mockLabRequests>([]);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [labResult, setLabResult] = useState<string>('');

  useEffect(() => {
    setTimeout(() => {
      setLabRequests(mockLabRequests);
    }, 500);
  }, []);

  const handleSubmitResult = () => {
    if (!selectedRequest || labResult.trim() === '') return;

    setLabRequests((prev) =>
      prev.map((req) =>
        req.id === selectedRequest
          ? { ...req, result: labResult, status: 'completed' }
          : req
      )
    );

    setSelectedRequest(null);
    setLabResult('');
  };

  const pendingCount = labRequests.filter((r) => r.status === 'pending').length;
  const completedCount = labRequests.filter((r) => r.status === 'completed').length;

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold text-center">Lab Technician Dashboard</h1>

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

      {/* Lab Requests Table */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Lab Requests</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Patient</th>
                <th className="border p-2">Doctor</th>
                <th className="border p-2">Test Type</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {labRequests.map((req) => (
                <tr key={req.id}>
                  <td className="border p-2">{req.patientName}</td>
                  <td className="border p-2">{req.doctorName}</td>
                  <td className="border p-2">{req.testType}</td>
                  <td className="border p-2">
                    <span
                      className={`px-2 py-1 rounded text-white ${
                        req.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="border p-2">
                    {req.status === 'pending' ? (
                      <Button
                        onClick={() => {
                          setSelectedRequest(req.id);
                          setLabResult(req.result);
                        }}
                      >
                        Submit Result
                      </Button>
                    ) : (
                      <span className="text-green-600 font-semibold">✓ Done</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Result Submission Form */}
      {selectedRequest && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Submit Lab Result</h3>
          </CardHeader>
          <CardBody>
            {/* Patient Name (Optional preview input using Input component) */}
            <Input
              label="Lab Result (Summary Title)"
              value={`Result for ${labRequests.find(r => r.id === selectedRequest)?.patientName}`}
              readOnly
              className="mb-4 bg-gray-100 cursor-not-allowed"
            />

            {/* Manual textarea for detailed lab result */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lab Result Details
              </label>
              <textarea
                value={labResult}
                onChange={(e) => setLabResult(e.target.value)}
                placeholder="Enter lab result details..."
                rows={5}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSubmitResult}>Submit</Button>
              <Button
                onClick={() => {
                  setSelectedRequest(null);
                  setLabResult('');
                }}
                className="bg-gray-300 text-black"
              >
                Cancel
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default LabTechnician;
