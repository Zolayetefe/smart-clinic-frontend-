import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Card from '../../../components/ui/Card';
import { format } from 'date-fns';

interface Test {
  testName: string;
  reason: string;
  price?: number;
}

interface LabRequest {
  id: string;
  patient: string;
  patientId: string;
  doctor: string;
  doctorId: string;
  doctorEmail: string;
  patientEmail: string;
  patientPhone: string;
  tests: Test[];
  apporovalStatus: 'pending' | 'approved';
  totalAmount?: number;
}

type TabType = 'all' | 'pending' | 'approved';

const LabRequestApproval: React.FC = () => {
  const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testPrices, setTestPrices] = useState<Record<string, Record<string, number>>>({});
  const [activeTab, setActiveTab] = useState<TabType>('all');

  useEffect(() => {
    fetchLabRequests();
  }, []);

  const fetchLabRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/finance/labRequests', {
        withCredentials: true
      });
      setLabRequests(response.data.data);
      
      // Initialize test prices structure for pending requests
      const prices: Record<string, Record<string, number>> = {};
      response.data.data.forEach((request: LabRequest) => {
        if (request.apporovalStatus === 'pending') {
          prices[request.id] = {};
          request.tests.forEach(test => {
            prices[request.id][test.testName] = 0;
          });
        }
      });
      setTestPrices(prices);
    } catch (err) {
      setError('Failed to fetch lab requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (requestId: string, testName: string, price: string) => {
    setTestPrices(prev => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        [testName]: parseFloat(price) || 0
      }
    }));
  };

  const calculateTotalAmount = (requestId: string) => {
    return Object.values(testPrices[requestId] || {}).reduce((sum, price) => sum + (price || 0), 0);
  };

  const handleApprovePayment = async (request: LabRequest) => {
    try {
      const testPricesList = request.tests.map(test => ({
        testName: test.testName,
        reason: test.reason,
        price: testPrices[request.id][test.testName] || 0
      }));

      const totalAmount = calculateTotalAmount(request.id);

      const payload = {
        labRequestId: request.id,
        patientId: request.patientId,
        doctorId: request.doctorId,
        tests: testPricesList,
        totalAmount
      };

      await axios.post(
        `http://localhost:5000/api/finance/labRequests/${request.id}/approve`,
        payload,
        { withCredentials: true }
      );

      // Refresh the list after approval
      fetchLabRequests();
    } catch (err) {
      console.error('Failed to approve payment:', err);
      setError('Failed to approve payment');
    }
  };

  const filteredRequests = labRequests.filter(request => {
    if (activeTab === 'all') return true;
    return request.apporovalStatus === activeTab;
  });

  const TabButton: React.FC<{
    tab: TabType;
    label: string;
    count: number;
  }> = ({ tab, label, count }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 font-medium rounded-lg transition-colors duration-200 ${
        activeTab === tab
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label} ({count})
    </button>
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  const pendingCount = labRequests.filter(r => r.apporovalStatus === 'pending').length;
  const approvedCount = labRequests.filter(r => r.apporovalStatus === 'approved').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lab Request Approvals</h1>
        <div className="flex gap-3">
          <TabButton tab="all" label="All" count={labRequests.length} />
          <TabButton tab="pending" label="Pending" count={pendingCount} />
          <TabButton tab="approved" label="Approved" count={approvedCount} />
        </div>
      </div>
      
      <div className="space-y-6">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{request.patient}</h3>
                  <p className="text-sm text-gray-600">{request.patientEmail}</p>
                  <p className="text-sm text-gray-600">Phone: {request.patientPhone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Doctor: {request.doctor}</p>
                  <p className="text-sm text-gray-600">{request.doctorEmail}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Tests</h4>
                <div className="space-y-3">
                  {request.tests.map((test, index) => (
                    <div key={index} className="flex items-center gap-4 bg-gray-50 p-3 rounded">
                      <div className="flex-1">
                        <p className="font-medium">{test.testName}</p>
                        <p className="text-sm text-gray-600">Reason: {test.reason}</p>
                      </div>
                      {request.apporovalStatus === 'pending' ? (
                        <div className="w-32">
                          <Input
                            type="number"
                            placeholder="Price"
                            value={testPrices[request.id]?.[test.testName] || ''}
                            onChange={(e) => handlePriceChange(request.id, test.testName, e.target.value)}
                          />
                        </div>
                      ) : (
                        <div className="text-green-600 font-medium">
                          {test.price} ETB
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-lg font-semibold">
                  Total Amount: {request.apporovalStatus === 'approved' ? request.totalAmount : calculateTotalAmount(request.id)} ETB
                </div>
                {request.apporovalStatus === 'pending' ? (
                  <Button
                    onClick={() => handleApprovePayment(request)}
                    disabled={calculateTotalAmount(request.id) === 0}
                  >
                    Approve Payment
                  </Button>
                ) : (
                  <div className="text-right">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Payment Verified
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}

        {filteredRequests.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No {activeTab === 'all' ? '' : activeTab} lab requests found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabRequestApproval;