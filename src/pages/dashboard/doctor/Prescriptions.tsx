import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { format } from 'date-fns';
import axios from 'axios';
import { FileText, Search, Eye } from 'lucide-react';

interface Medication {
  dosage: string;
  duration: string;
  quantity: number;
  frequency: string;
  instructions: string;
  medicineName: string;
}

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  labResultId: string;
  medications: Medication[];
  notes: string;
  prescribedAt: string;
  approvalStatus: 'pending' | 'approved';
}

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/doctor/prescriptions', {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        setPrescriptions(response.data);
        setFilteredPrescriptions(response.data);
      } catch (err) {
        console.error('Failed to fetch prescriptions:', err);
        setError('Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  useEffect(() => {
    const filtered = prescriptions.filter(prescription => {
      const matchesSearch = 
        prescription.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prescription.patientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prescription.medications.some(med => 
          med.medicineName.toLowerCase().includes(searchQuery.toLowerCase())
        );

      if (filter === 'pending') {
        return matchesSearch && prescription.approvalStatus === 'pending';
      } else if (filter === 'approved') {
        return matchesSearch && prescription.approvalStatus === 'approved';
      }
      return matchesSearch;
    });

    setFilteredPrescriptions(filtered);
  }, [searchQuery, filter, prescriptions]);

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
        <h1 className="text-2xl font-bold text-white">Prescriptions</h1>
        <p className="mt-1 text-white/80">Manage and track patient prescriptions</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <Input
                placeholder="Search prescriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-primary text-white' : ''}
              >
                All ({prescriptions.length})
              </Button>
              <Button
                onClick={() => setFilter('pending')}
                className={filter === 'pending' ? 'bg-primary text-white' : ''}
              >
                Pending ({prescriptions.filter(p => p.approvalStatus === 'pending').length})
              </Button>
              <Button
                onClick={() => setFilter('approved')}
                className={filter === 'approved' ? 'bg-primary text-white' : ''}
              >
                Approved ({prescriptions.filter(p => p.approvalStatus === 'approved').length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {filteredPrescriptions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {searchQuery ? 'No prescriptions match your search' : 'No prescriptions found'}
                </p>
              </div>
            ) : (
              filteredPrescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
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
                            {format(new Date(prescription.prescribedAt), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            Medications: {prescription.medications.map(med => med.medicineName).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPrescription(prescription)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardBody>
      </Card>

      {/* Prescription Detail Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Prescription Details</h2>
              <button
                onClick={() => setSelectedPrescription(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Patient Information</h4>
                  <p>Name: {selectedPrescription.patientName}</p>
                  <p>Email: {selectedPrescription.patientEmail}</p>
                  <p>Phone: {selectedPrescription.patientPhone}</p>
                </div>
                <div>
                  <h4 className="font-medium">Prescription Status</h4>
                  <p className="capitalize">{selectedPrescription.approvalStatus}</p>
                  <p>Prescribed: {format(new Date(selectedPrescription.prescribedAt), 'PPP')}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Medications</h4>
                <div className="space-y-3">
                  {selectedPrescription.medications.map((medication, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-2">
                        <p><span className="font-medium">Medicine:</span> {medication.medicineName}</p>
                        <p><span className="font-medium">Dosage:</span> {medication.dosage}</p>
                        <p><span className="font-medium">Frequency:</span> {medication.frequency}</p>
                        <p><span className="font-medium">Duration:</span> {medication.duration}</p>
                        <p><span className="font-medium">Quantity:</span> {medication.quantity}</p>
                        <p><span className="font-medium">Instructions:</span> {medication.instructions}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPrescription.notes && (
                <div>
                  <h4 className="font-medium">Notes</h4>
                  <p className="bg-gray-50 p-4 rounded-lg mt-1">{selectedPrescription.notes}</p>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPrescription(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions; 