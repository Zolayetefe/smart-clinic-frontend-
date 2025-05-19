import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import axios from 'axios';

interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  treatment: string;
  doctor: {
    name: string;
    specialization: string;
  };
  notes: string;
  medications: string[];
  attachments: string[];
}

const MedicalRecords = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        if (!user?.patient?.id) {
          throw new Error('Patient ID not found');
        }

        const response = await axios.get(
          `http://localhost:5000/api/patient/medical-records/${user.patient.id}`,
          { withCredentials: true }
        );

        setRecords(response.data.records);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch medical records');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalRecords();
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Loading medical records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Medical Records</h1>
      
      {records.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-8">
              <p className="text-gray-500">No medical records found.</p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">
          {records.map((record) => (
            <Card key={record.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Visit on {new Date(record.date).toLocaleDateString()}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Dr. {record.doctor.name} - {record.doctor.specialization}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Diagnosis</h3>
                    <p className="mt-1 text-gray-900">{record.diagnosis}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Treatment</h3>
                    <p className="mt-1 text-gray-900">{record.treatment}</p>
                  </div>
                  
                  {record.medications.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Medications</h3>
                      <ul className="mt-1 list-disc list-inside text-gray-900">
                        {record.medications.map((medication, index) => (
                          <li key={index}>{medication}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {record.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                      <p className="mt-1 text-gray-900">{record.notes}</p>
                    </div>
                  )}
                  
                  {record.attachments.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Attachments</h3>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {record.attachments.map((attachment, index) => (
                          <a
                            key={index}
                            href={attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            Attachment {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalRecords; 