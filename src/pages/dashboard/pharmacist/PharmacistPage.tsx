import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { format } from 'date-fns';
import axios from 'axios';
import { FileText, Search, Printer, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';

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
  labResultId: string;
  medications: Medication[];
  doctorName: string;
  doctorEmail: string;
  doctorSpeciality: string;
  doctorPhone: string;
  notes: string;
  prescribedAt: string;
  approvalStatus: 'pending' | 'approved';
  dispenseStatus: 'pending' | 'dispensed';
}

const PharmacistPage = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/pharmacist/prescriptions', {
        withCredentials: true
      });
      setPrescriptions(response.data.prescriptions);
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

  const handleDispense = async (prescription: Prescription) => {
    try {
      const dispensedMedications = prescription.medications.map(med => ({
        medicineName: med.medicineName,
        dosage: med.dosage,
        quantityDispensed: med.quantity,
        instructions: med.instructions
      }));

      await axios.post(
        'http://localhost:5000/api/pharmacist/dispense',
        {
          prescriptionId: prescription.id,
          patientId: prescription.patientId,
          medications: dispensedMedications
        },
        { withCredentials: true }
      );

      await fetchPrescriptions();
    } catch (err) {
      console.error('Failed to dispense medications:', err);
      setError('Failed to dispense medications');
    }
  };

  const generatePrescriptionPDF = (prescription: Prescription) => {
    // A5 size in mm (148 × 210)
    const doc = new jsPDF({
      format: 'a5',
      unit: 'mm',
    });

    // Set initial position
    let yPos = 20;
    const leftMargin = 15;
    const lineHeight = 7;

    // Add clinic header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SMART CLINIC PRESCRIPTION', leftMargin, yPos);
    
    // Add line separator
    yPos += 10;
    doc.setLineWidth(0.5);
    doc.line(leftMargin, yPos, 135, yPos);

    // Reset font for regular text
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Patient Information
    yPos += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Information:', leftMargin, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += lineHeight;
    doc.text(`Name: ${prescription.patientName}`, leftMargin, yPos);
    yPos += lineHeight;
    doc.text(`Phone: ${prescription.patientPhone}`, leftMargin, yPos);
    yPos += lineHeight;
    doc.text(`Email: ${prescription.patientEmail}`, leftMargin, yPos);

    // Doctor Information
    yPos += lineHeight * 1.5;
    doc.setFont('helvetica', 'bold');
    doc.text('Doctor Information:', leftMargin, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += lineHeight;
    doc.text(`Name: ${prescription.doctorName}`, leftMargin, yPos);
    yPos += lineHeight;
    doc.text(`Speciality: ${prescription.doctorSpeciality}`, leftMargin, yPos);
    yPos += lineHeight;
    doc.text(`Phone: ${prescription.doctorPhone}`, leftMargin, yPos);

    // Medications
    yPos += lineHeight * 1.5;
    doc.setFont('helvetica', 'bold');
    doc.text('Medications:', leftMargin, yPos);
    doc.setFont('helvetica', 'normal');

    prescription.medications.forEach((med, index) => {
      yPos += lineHeight * 1.2;
      doc.text(`${index + 1}. ${med.medicineName}`, leftMargin, yPos);
      yPos += lineHeight;
      doc.text(`   Dosage: ${med.dosage}`, leftMargin, yPos);
      yPos += lineHeight;
      doc.text(`   Frequency: ${med.frequency}`, leftMargin, yPos);
      yPos += lineHeight;
      doc.text(`   Duration: ${med.duration}`, leftMargin, yPos);
      yPos += lineHeight;
      doc.text(`   Quantity: ${med.quantity}`, leftMargin, yPos);
      yPos += lineHeight;
      doc.text(`   Instructions: ${med.instructions}`, leftMargin, yPos);
    });

    // Notes
    if (prescription.notes) {
      yPos += lineHeight * 1.5;
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', leftMargin, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += lineHeight;
      doc.text(prescription.notes, leftMargin, yPos);
    }

    // Date
    yPos += lineHeight * 1.5;
    doc.text(`Date Prescribed: ${format(new Date(prescription.prescribedAt), 'PPP')}`, leftMargin, yPos);

    // Save the PDF
    doc.save(`prescription-${prescription.patientName}-${format(new Date(prescription.prescribedAt), 'yyyy-MM-dd')}.pdf`);
  };

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prescription.patientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prescription.medications.some(med => 
      med.medicineName.toLowerCase().includes(searchQuery.toLowerCase())
    )
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
        <h1 className="text-2xl font-bold text-white">Pharmacy Management</h1>
        <p className="mt-1 text-white/80">Manage and dispense prescriptions</p>
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
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{prescription.patientName}</h3>
                          <p className="text-sm text-gray-500">{prescription.patientEmail}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generatePrescriptionPDF(prescription)}
                          >
                            <Printer className="h-4 w-4 mr-1" />
                            Print
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDispense(prescription)}
                            disabled={prescription.approvalStatus !== 'approved' || prescription.dispenseStatus === 'dispensed'}
                          >
                            {prescription.dispenseStatus === 'dispensed' ? 'Dispensed' : 'Dispense'}
                          </Button>
                        </div>
                      </div>

                      {prescription.approvalStatus !== 'approved' && (
                        <div className="mt-2 flex items-center gap-2 text-yellow-700 bg-yellow-50 p-2 rounded">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">Payment required before dispensing</span>
                        </div>
                      )}

                      <div className="mt-2 flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          prescription.approvalStatus === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {prescription.approvalStatus.charAt(0).toUpperCase() + prescription.approvalStatus.slice(1)}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          prescription.dispenseStatus === 'dispensed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {prescription.dispenseStatus.charAt(0).toUpperCase() + prescription.dispenseStatus.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          Prescribed by: {prescription.doctorName} ({prescription.doctorSpeciality})
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(prescription.prescribedAt), 'MMM dd, yyyy')}
                        </span>
                      </div>

                      <div className="mt-4 space-y-3">
                        {prescription.medications.map((medication, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <div className="grid grid-cols-2 gap-2">
                              <p className="text-sm font-medium">{medication.medicineName}</p>
                              <p className="text-sm">Quantity: {medication.quantity}</p>
                              <p className="text-sm">Dosage: {medication.dosage}</p>
                              <p className="text-sm">Frequency: {medication.frequency}</p>
                              <p className="text-sm">Duration: {medication.duration}</p>
                              <p className="text-sm">Instructions: {medication.instructions}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {prescription.notes && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {prescription.notes}
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

export default PharmacistPage;