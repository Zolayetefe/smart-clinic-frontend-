import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Card from '../../../components/ui/Card';
import { format } from 'date-fns';

interface Test {
  name: string;
  price?: number;
}

interface LabTestBill {
  id: string;
  patientId: string;
  labRequestId: string;
  financeStaffId: string;
  tests: Test[];
  totalAmount: number;
  approvalStatus: 'approved' | 'pending';
  paidAt: string;
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
  labTestBillId?: string;
  tests: Test[];
  apporovalStatus: 'pending' | 'approved';
  labTestBill: LabTestBill | null;
  totalAmount?: number;
  paidAt?: string;
  approvalStatus?: 'approved';
}

const LabRequestApproval: React.FC = () => {
  const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testPrices, setTestPrices] = useState<Record<string, Record<string, number>>>({});

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
          request.tests?.forEach(test => {
            prices[request.id][test.name] = test.price || 0;
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
        name: test.name,
        price: testPrices[request.id][test.name] || 0
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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Lab Request Approvals</h1>
      
      <div className="space-y-6">
        {labRequests.map((request) => (
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
                  {request.tests?.map((test, index) => (
                    <div key={index} className="flex items-center gap-4 bg-gray-50 p-3 rounded">
                      <div className="flex-1">
                        <p className="font-medium">{test.name}</p>
                      </div>
                      {request.apporovalStatus === 'pending' ? (
                        <div className="w-32">
                          <Input
                            type="number"
                            placeholder="Price"
                            value={testPrices[request.id]?.[test.name] || ''}
                            onChange={(e) => handlePriceChange(request.id, test.name, e.target.value)}
                          />
                        </div>
                      ) : (
                        <div className="text-green-600 font-medium">
                          ${test.price}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-lg font-semibold">
                  Total Amount: ${request.apporovalStatus === 'approved' ? request.totalAmount : calculateTotalAmount(request.id)}
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
                      Approved
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      Paid at: {format(new Date(request.paidAt!), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}

        {labRequests.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No lab requests found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabRequestApproval;