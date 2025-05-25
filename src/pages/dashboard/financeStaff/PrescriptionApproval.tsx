import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { format } from 'date-fns';
import axios from 'axios';
import { FileText, Search } from 'lucide-react';

interface Medication {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  price?: number;
  instructions: string;
}

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  prescribedBy: string;
  prescribedById: string;
  prescribedAt: string;
  requestedAt: string;
  approvalStatus: 'pending' | 'approved';
  medications: Medication[];
  totalAmount?: number;
}

const PrescriptionApproval = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [medicationPrices, setMedicationPrices] = useState<Record<string, Record<string, number>>>({});

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/finance/prescriptions', {
        withCredentials: true
      });
      setPrescriptions(response.data.data);
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err);
      setError('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handlePriceChange = (prescriptionId: string, medicineIndex: number, price: string) => {
    const numericPrice = parseFloat(price) || 0;
    setMedicationPrices(prev => ({
      ...prev,
      [prescriptionId]: {
        ...(prev[prescriptionId] || {}),
        [medicineIndex]: numericPrice
      }
    }));
  };

  const calculateTotalAmount = (prescriptionId: string, medications: Medication[]) => {
    const prices = medicationPrices[prescriptionId] || {};
    return medications.reduce((total, _, index) => {
      const price = prices[index] || 0;
      const quantity = medications[index].quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const handleApprovePayment = async (prescription: Prescription) => {
    try {
      const prices = medicationPrices[prescription.id] || {};
      const updatedMedications = prescription.medications.map((med, index) => ({
        ...med,
        price: prices[index] || 0
      }));

      const totalAmount = calculateTotalAmount(prescription.id, prescription.medications);

      await axios.post(
        `http://localhost:5000/api/finance/prescription/${prescription.id}/approve`,
        {
          medications: updatedMedications,
          totalAmount,
          patientId: prescription.patientId
        },
        { withCredentials: true }
      );

      await fetchPrescriptions();
    } catch (err) {
      console.error('Failed to approve payment:', err);
      setError('Failed to approve payment');
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prescription.patientEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-secondary to-secondary-dark rounded-lg p-6 shadow-md">
        <h1 className="text-2xl font-bold text-white">Prescription Payment Approval</h1>
        <p className="mt-1 text-white/80">Manage and approve prescription payments</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Input
              placeholder="Search prescriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {filteredPrescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="bg-white rounded-lg border p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{prescription.patientName}</h3>
                      <p className="text-sm text-gray-500">{prescription.patientEmail}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          prescription.approvalStatus === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {prescription.approvalStatus.charAt(0).toUpperCase() + prescription.approvalStatus.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          Prescribed by: {prescription.prescribedBy}
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(prescription.prescribedAt), 'MMM dd, yyyy')}
                        </span>
                      </div>

                      <div className="mt-4 space-y-3">
                        {prescription.medications.map((medication, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{medication.medicineName}</p>
                              <p className="text-xs text-gray-500">
                                Quantity: {medication.quantity} | {medication.dosage} | {medication.frequency}
                              </p>
                            </div>
                            {prescription.approvalStatus === 'pending' ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  placeholder="Price"
                                  value={medicationPrices[prescription.id]?.[index] || ''}
                                  onChange={(e) => handlePriceChange(prescription.id, index, e.target.value)}
                                  className="w-24"
                                />
                                <span className="text-sm text-gray-500">
                                  Total: {((medicationPrices[prescription.id]?.[index] || 0) * medication.quantity).toFixed(2)} ETB
                                </span>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-700">
                                Price: {medication.price} ETB | Total: {(medication.price || 0) * medication.quantity} ETB
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {prescription.approvalStatus === 'pending' && (
                        <div className="mt-4 flex items-center justify-between">
                          <p className="text-lg font-medium">
                            Total Amount: {calculateTotalAmount(prescription.id, prescription.medications).toFixed(2)} ETB
                          </p>
                          <Button
                            onClick={() => handleApprovePayment(prescription)}
                            disabled={!Object.keys(medicationPrices[prescription.id] || {}).length}
                          >
                            Approve Payment
                          </Button>
                        </div>
                      )}
                      
                      {prescription.approvalStatus === 'approved' && prescription.totalAmount && (
                        <div className="mt-4">
                          <p className="text-lg font-medium text-green-700">
                            Total Amount Approved: {prescription.totalAmount.toFixed(2)} ETB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredPrescriptions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {searchQuery ? 'No prescriptions match your search' : 'No prescriptions found'}
                </p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default PrescriptionApproval;