import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, ArrowRight, X, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import axios from 'axios';
import { format } from 'date-fns';

interface Medication {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
  price?: number;
}

interface LabResult {
  id: string;
  labRequestId: string;
  labTechnicianId: string;
  result: Record<string, string>;
  notes: string;
  createdAt: string;
}

interface MedicalHistoryRecord {
  id: string;
  labResult: LabResult;
  notes: string;
  medications: Medication[];
  result: Record<string, string>;
  approvalStatus: 'pending' | 'approved';
}

const MedicalRecords: React.FC = () => {
  const { user } = useAuth();
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalHistoryRecord | null>(null);

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/patient/medical-history', {
          withCredentials: true
        });
        setMedicalHistory(response.data.medicalHistory);
      } catch (err) {
        console.error('Failed to fetch medical history:', err);
        setError('Failed to load medical history');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalHistory();
  }, []);

  const Modal: React.FC<{ record: MedicalHistoryRecord; onClose: () => void }> = ({ record, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Medical Record Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Lab Results */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Lab Results</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                {Object.entries(record.labResult.result).map(([test, result]) => (
                  <div key={test} className="mb-2">
                    <span className="font-medium">{test}:</span> {result}
                  </div>
                ))}
                <div className="mt-2 text-sm text-gray-600">
                  <p>Notes: {record.labResult.notes}</p>
                  <p>Date: {format(new Date(record.labResult.createdAt), 'PPP')}</p>
                </div>
              </div>
            </div>

            {/* Medications */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Prescribed Medications</h4>
              <div className="space-y-4">
                {record.medications.map((med, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900">{med.medicineName}</h5>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>Dosage: {med.dosage}</div>
                      <div>Frequency: {med.frequency}</div>
                      <div>Duration: {med.duration}</div>
                      <div>Quantity: {med.quantity}</div>
                      <div className="col-span-2">Instructions: {med.instructions}</div>
                      {med.price && <div>Price: {med.price} BIRR</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {record.notes && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Additional Notes</h4>
                <p className="text-gray-600">{record.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        <AlertCircle className="h-6 w-6 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg p-6 shadow-md">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Medical Records</h2>
            <p className="mt-1 text-white/80">View your medical history and lab results</p>
          </div>
        </div>
      </div>

      {/* Medical Records */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Medical History</h3>
          </div>
        </CardHeader>
        <CardBody className="px-0 py-0">
          <div className="divide-y divide-gray-200">
            {medicalHistory.length > 0 ? (
              medicalHistory.map((record) => (
                <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-secondary/10 rounded-full">
                        <FileText className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-gray-900">
                          Visit Date: {format(new Date(record.labResult.createdAt), 'PPP')}
                        </h4>
                        <div className="mt-2 space-x-2">
                          {Object.keys(record.result).map((test) => (
                            <span key={test} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {test}
                            </span>
                          ))}
                        </div>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.approvalStatus === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {record.approvalStatus === 'approved' ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRecord(record)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No medical records available</p>
                <Link to="/patient/appointments">
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-2"
                    leftIcon={<Calendar className="h-4 w-4" />}
                  >
                    Book Appointment
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {selectedRecord && (
        <Modal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}
    </div>
  );
};

export default MedicalRecords;
