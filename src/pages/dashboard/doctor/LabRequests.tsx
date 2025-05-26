import React, { useState, useEffect } from 'react';
import { Activity, FileText, Eye, Download } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import axios from 'axios';
import { format } from 'date-fns';
import LabResultSidebar from './LabResultSidebar';
import { PDFDocument, rgb } from 'pdf-lib';
import { toast } from 'react-hot-toast';

// Types for Lab Requests and Results
interface LabTest {
  reason: string;
  testName: string;
}

interface LabRequestResult {
  id: string;
  labRequestId: string;
  labTechnicianId: string;
  result: Record<string, string>;
  notes: string;
  createdAt: string;
}

interface LabRequest {
  id: string;
  doctorId: string;
  patientId: string;
  patientPhone: string;
  patientName: string;
  patientEmail: string;
  status: 'requested' | 'completed';
  notes: string;
  priority: string | null;
  tests: LabTest[];
  requestedAt: string;
  completedAt: string | null;
  result: LabRequestResult | null;
}

interface LabResult {
  id: string;
  labRequestId: string;
  labTechnicianId: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientAddress: string;
  patientGender: string;
  patientBirthDate: string;
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  doctorSpecialization: string;
  labTechnicianName: string;
  labTechnicianEmail: string;
  result: Record<string, string>;
  notes: string;
  createdAt: string;
  prescriptionId: string | null;
}

interface Medication {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
}

interface Prescription {
  patientId: string;
  labResultId: string;
  medications: Medication[];
  approvalStatus: 'pending' | 'approved';
  notes: string;
}

interface ReferralData {
  // Referring Clinic Information
  referringClinicName: string;
  referringClinicAddress: string;
  referringClinicPhone: string;
  referringClinicEmail: string;

  // Referred To Information
  referredToClinic: string;
  department: string;
  specialist: string;
  address: string;
  phone: string;
  email: string;

  // Clinical Information
  reasonForReferral: string;
  clinicalHistory: string;
  currentMedications: string;
  relevantTestResults: string;
  diagnosisNotes: string;
  treatmentGiven: string;
  recommendedTreatmentPlan: string;
  urgencyLevel: 'routine' | 'urgent' | 'emergency';
  
  // Additional Information
  specialInstructions: string;
  followUpPlan: string;
  additionalNotes: string;
}

const LabRequest: React.FC = () => {
  const { user } = useAuth();
  const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [filteredLabRequests, setFilteredLabRequests] = useState<LabRequest[]>([]);
  const [filteredLabResults, setFilteredLabResults] = useState<LabResult[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<LabRequest | null>(null);
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search states
  const [requestSearchQuery, setRequestSearchQuery] = useState('');
  const [requestSearchFilter, setRequestSearchFilter] = useState<'name' | 'email'>('name');
  const [resultSearchQuery, setResultSearchQuery] = useState('');
  const [resultSearchFilter, setResultSearchFilter] = useState<'name' | 'email'>('name');

  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState<Prescription>({
    patientId: '',
    labResultId: '',
    medications: [
      {
        medicineName: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        quantity: 1
      }
    ],
    approvalStatus: 'pending',
    notes: ''
  });

  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralData, setReferralData] = useState<ReferralData>({
    referringClinicName: '',
    referringClinicAddress: '',
    referringClinicPhone: '',
    referringClinicEmail: '',
    referredToClinic: '',
    department: '',
    specialist: '',
    address: '',
    phone: '',
    email: '',
    reasonForReferral: '',
    clinicalHistory: '',
    currentMedications: '',
    relevantTestResults: '',
    diagnosisNotes: '',
    treatmentGiven: '',
    recommendedTreatmentPlan: '',
    urgencyLevel: 'routine',
    specialInstructions: '',
    followUpPlan: '',
    additionalNotes: ''
  });

  // Separate functions for API calls
  const fetchLabRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/doctor/lab-requests', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching lab requests:', error);
      throw error;
    }
  };

  const fetchLabResults = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/doctor/lab-results', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching lab results:', error);
      throw error;
    }
  };

  // Function to handle lab request submission
  const submitLabRequest = async (requestData: any) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/doctor/lab-requests',
        requestData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting lab request:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [requests, results] = await Promise.all([
          fetchLabRequests(),
          fetchLabResults()
        ]);
        setLabRequests(requests);
        setLabResults(results);
        setFilteredLabRequests(requests);
        setFilteredLabResults(results);
        setError(null);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to fetch lab data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter lab requests based on search query
  useEffect(() => {
    if (!requestSearchQuery.trim()) {
      setFilteredLabRequests(labRequests);
      return;
    }

    const query = requestSearchQuery.toLowerCase().trim();
    const filtered = labRequests.filter(request => {
      if (requestSearchFilter === 'name') {
        return request.patientName.toLowerCase().includes(query);
      } else if (requestSearchFilter === 'email') {
        const email = request.patientEmail || '';
        return email.toLowerCase().includes(query);
      }
      return false;
    });
    setFilteredLabRequests(filtered);
  }, [requestSearchQuery, requestSearchFilter, labRequests]);

  // Filter lab results based on search query
  useEffect(() => {
    if (!resultSearchQuery.trim()) {
      setFilteredLabResults(labResults);
      return;
    }

    const query = resultSearchQuery.toLowerCase().trim();
    const filtered = labResults.filter(result => {
      if (resultSearchFilter === 'name') {
        return result.patientName.toLowerCase().includes(query);
      } else if (resultSearchFilter === 'email') {
        const email = result.patientEmail || '';
        return email.toLowerCase().includes(query);
      }
      return false;
    });
    setFilteredLabResults(filtered);
  }, [resultSearchQuery, resultSearchFilter, labResults]);

  // Function to refresh lab requests
  const refreshLabRequests = async () => {
    try {
      const requests = await fetchLabRequests();
      setLabRequests(requests);
    } catch (error) {
      console.error('Error refreshing lab requests:', error);
      setError('Failed to refresh lab requests.');
    }
  };

  // Function to handle new lab request
  const handleNewLabRequest = async (requestData: any) => {
    try {
      await submitLabRequest(requestData);
      await refreshLabRequests(); // Refresh the list after successful submission
      return true;
    } catch (error) {
      console.error('Error handling new lab request:', error);
      setError('Failed to submit lab request. Please try again.');
      return false;
    }
  };

  const handleAddMedication = () => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          medicineName: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
          quantity: 1
        }
      ]
    }));
  };

  const handleRemoveMedication = (index: number) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleMedicationChange = (index: number, field: keyof Medication, value: string | number) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const handleLabRequestSubmit = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/doctor/prescription',
        prescriptionData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      setShowPrescriptionModal(false);
      // Reset prescription data
      setPrescriptionData({
        patientId: '',
        labResultId: '',
        medications: [
          {
            medicineName: '',
            dosage: '',
            frequency: '',
            duration: '',
            instructions: '',
            quantity: 1
          }
        ],
        approvalStatus: 'pending',
        notes: ''
      });
    } catch (error) {
      console.error('Error submitting prescription:', error);
      setError('Failed to submit prescription');
    }
  };

  // Update the generateReferralPDF function to include new fields
  const generateReferralPDF = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      
      const fontSize = 12;
      const titleSize = 16;
      const sectionTitleSize = 14;
      const lineHeight = fontSize * 1.5;
      const titleLineHeight = titleSize * 1.5;
      const sectionLineHeight = sectionTitleSize * 1.5;
      const margin = 50;
      const sectionSpacing = 30; // Space between sections
      let currentY = height - margin;
      
      // Helper function to add new page
      const addNewPage = () => {
        page = pdfDoc.addPage();
        currentY = height - margin;
        return page;
      };

      // Helper function to write text with page break handling
      const writeText = (text: string, options: { 
        x: number; 
        size: number; 
        isBold?: boolean; 
        indent?: number;
        isTitle?: boolean;
        isSectionTitle?: boolean;
      }) => {
        const { x, size, isBold = false, indent = 0, isTitle = false, isSectionTitle = false } = options;
        
        // Calculate the space needed for this text
        const spaceNeeded = isTitle ? titleLineHeight : 
                           isSectionTitle ? sectionLineHeight : 
                           lineHeight;
        
        // Check if we need a new page
        if (currentY < margin + spaceNeeded) {
          page = addNewPage();
        }

        page.drawText(text, {
          x: x + indent,
          y: currentY,
          size,
          color: rgb(0, 0, 0)
        });

        // Adjust vertical position based on text type
        currentY -= spaceNeeded;
      };

      // Helper function to write a section of text with automatic line breaks
      const writeSection = (text: string, maxWidth: number, options: { x: number; size: number; indent?: number }) => {
        const words = text.split(' ');
        let line = '';
        
        for (const word of words) {
          const testLine = line + (line ? ' ' : '') + word;
          const testWidth = (testLine.length * options.size * 0.6); // Approximate width calculation
          
          if (testWidth > maxWidth) {
            if (line) {
              writeText(line, options);
              line = word;
            } else {
              // If a single word is too long, force it to wrap
              writeText(word, options);
              line = '';
            }
          } else {
            line = testLine;
          }
        }
        
        if (line) {
          writeText(line, options);
        }
      };

      // Main Title
      writeText('MEDICAL REFERRAL LETTER', { x: margin, size: titleSize, isBold: true, isTitle: true });
      currentY -= sectionSpacing;

      // Date
      writeText(`Date: ${format(new Date(), 'PPP')}`, { x: margin, size: fontSize });
      currentY -= sectionSpacing;

      // Referring Clinic Section
      writeText('REFERRING CLINIC:', { x: margin, size: sectionTitleSize, isBold: true, isSectionTitle: true });
      [
        `Clinic: ${referralData.referringClinicName}`,
        `Address: ${referralData.referringClinicAddress}`,
        `Phone: ${referralData.referringClinicPhone}`,
        `Email: ${referralData.referringClinicEmail}`,
        `Doctor: Dr. ${selectedResult?.doctorName}`,
        `Specialization: ${selectedResult?.doctorSpecialization || 'N/A'}`
      ].forEach(text => {
        writeText(text, { x: margin, size: fontSize, indent: 20 });
      });
      currentY -= sectionSpacing;

      // Referred To Section
      writeText('REFERRED TO:', { x: margin, size: sectionTitleSize, isBold: true, isSectionTitle: true });
      [
        `Clinic: ${referralData.referredToClinic}`,
        `Department: ${referralData.department}`,
        `Specialist: ${referralData.specialist}`,
        `Address: ${referralData.address}`,
        `Phone: ${referralData.phone}`,
        `Email: ${referralData.email}`
      ].forEach(text => {
        writeText(text, { x: margin, size: fontSize, indent: 20 });
      });
      currentY -= sectionSpacing;

      // Patient Information Section
      writeText('PATIENT INFORMATION:', { x: margin, size: sectionTitleSize, isBold: true, isSectionTitle: true });
      [
        `Name: ${selectedResult?.patientName}`,
        `Gender: ${selectedResult?.patientGender}`,
        `Date of Birth: ${format(new Date(selectedResult?.patientBirthDate || ''), 'PPP')}`,
        `Address: ${selectedResult?.patientAddress}`,
        `Email: ${selectedResult?.patientEmail}`
      ].forEach(text => {
        writeText(text, { x: margin, size: fontSize, indent: 20 });
      });
      currentY -= sectionSpacing;

      // Clinical Information Section
      writeText('CLINICAL INFORMATION:', { x: margin, size: sectionTitleSize, isBold: true, isSectionTitle: true });
      writeText(`Urgency Level: ${referralData.urgencyLevel.toUpperCase()}`, { x: margin, size: fontSize, indent: 20 });
      currentY -= lineHeight;
      
      // Clinical History with word wrap
      writeText('Clinical History:', { x: margin, size: fontSize, indent: 20 });
      writeSection(referralData.clinicalHistory || 'N/A', width - margin * 3, { x: margin, size: fontSize, indent: 40 });
      currentY -= lineHeight;

      // Current Medications
      writeText('Current Medications:', { x: margin, size: fontSize, indent: 20 });
      writeSection(referralData.currentMedications || 'None', width - margin * 3, { x: margin, size: fontSize, indent: 40 });
      currentY -= lineHeight;

      // Diagnosis Notes
      writeText('Diagnosis Notes:', { x: margin, size: fontSize, indent: 20 });
      writeSection(referralData.diagnosisNotes || 'N/A', width - margin * 3, { x: margin, size: fontSize, indent: 40 });
      currentY -= sectionSpacing;

      // Treatment Information Section
      writeText('TREATMENT INFORMATION:', { x: margin, size: sectionTitleSize, isBold: true, isSectionTitle: true });
      
      // Treatment Given
      writeText('Treatment Given:', { x: margin, size: fontSize, indent: 20 });
      writeSection(referralData.treatmentGiven || 'None', width - margin * 3, { x: margin, size: fontSize, indent: 40 });
      currentY -= sectionSpacing;

      // Lab Results Section
      writeText('LAB RESULTS:', { x: margin, size: sectionTitleSize, isBold: true, isSectionTitle: true });
      const results = Object.entries(selectedResult?.result || {});
      if (results.length > 0) {
        results.forEach(([test, value], index) => {
          writeText(`${test}:`, { x: margin, size: fontSize, indent: 20 });
          writeSection(value, width - margin * 3, { x: margin, size: fontSize, indent: 40 });
          if (index < results.length - 1) {
            currentY -= lineHeight;
          }
        });
      } else {
        writeText('No lab results available', { x: margin, size: fontSize, indent: 20 });
      }
      currentY -= sectionSpacing;

      // Recommended Treatment Plan
      writeText('RECOMMENDED TREATMENT PLAN:', { x: margin, size: sectionTitleSize, isBold: true, isSectionTitle: true });
      writeSection(referralData.recommendedTreatmentPlan || 'To be determined', width - margin * 3, { x: margin, size: fontSize, indent: 20 });
      currentY -= sectionSpacing;

      // Special Instructions
      if (referralData.specialInstructions) {
        writeText('SPECIAL INSTRUCTIONS:', { x: margin, size: sectionTitleSize, isBold: true, isSectionTitle: true });
        writeSection(referralData.specialInstructions, width - margin * 3, { x: margin, size: fontSize, indent: 20 });
        currentY -= sectionSpacing;
      }

      // Follow-up Plan
      if (referralData.followUpPlan) {
        writeText('FOLLOW-UP PLAN:', { x: margin, size: sectionTitleSize, isBold: true, isSectionTitle: true });
        writeSection(referralData.followUpPlan, width - margin * 3, { x: margin, size: fontSize, indent: 20 });
        currentY -= sectionSpacing;
      }

      // Additional Notes
      if (referralData.additionalNotes) {
        writeText('ADDITIONAL NOTES:', { x: margin, size: sectionTitleSize, isBold: true, isSectionTitle: true });
        writeSection(referralData.additionalNotes, width - margin * 3, { x: margin, size: fontSize, indent: 20 });
      }

      // Generate and download PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `referral-${selectedResult?.patientName}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate referral PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-secondary to-secondary-dark rounded-lg p-6 shadow-md">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Lab Requests & Results</h2>
            <p className="mt-1 text-white/80">Manage lab requests and results for your patients</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lab Requests Section */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Lab Requests</h3>
              {/* Search Section */}
              <div className="mt-4 space-y-4">
                <Input
                  placeholder={`Search requests by patient ${requestSearchFilter}...`}
                  value={requestSearchQuery}
                  onChange={(e) => setRequestSearchQuery(e.target.value)}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => setRequestSearchFilter('name')}
                    className={`px-3 py-1 text-sm ${
                      requestSearchFilter === 'name'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Search by Name
                  </Button>
                  <Button
                    onClick={() => setRequestSearchFilter('email')}
                    className={`px-3 py-1 text-sm ${
                      requestSearchFilter === 'email'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Search by Email
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {/* Existing lab requests table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tests
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLabRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.patientName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.patientEmail}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {request.tests.map(t => t.testName).join(', ')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            request.status === 'requested'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(request.requestedAt), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLabRequests.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No lab requests found
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Lab Results Sidebar */}
        <div className="lg:col-span-1 h-[calc(100vh-13rem)]">
          <LabResultSidebar
            labResults={filteredLabResults}
            onSelectResult={setSelectedResult}
          />
        </div>
      </div>

      {/* Lab Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Lab Request Details</h2>
              <button onClick={() => setSelectedRequest(null)} className="text-gray-500 hover:text-gray-700">
                <Eye className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Patient Information</h4>
                <p>Name: {selectedRequest.patientName}</p>
                <p>Email: {selectedRequest.patientEmail}</p>
                <p>Phone: {selectedRequest.patientPhone}</p>
              </div>
              <div>
                <h4 className="font-medium">Request Details</h4>
                <p>Status: {selectedRequest.status}</p>
                <p>Priority: {selectedRequest.priority || 'Normal'}</p>
                <p>Requested At: {format(new Date(selectedRequest.requestedAt), 'PPP')}</p>
                {selectedRequest.completedAt && (
                  <p>Completed At: {format(new Date(selectedRequest.completedAt), 'PPP')}</p>
                )}
              </div>
              <div>
                <h4 className="font-medium">Tests</h4>
                <ul className="list-disc pl-5">
                  {selectedRequest.tests.map((test, index) => (
                    <li key={index}>
                      {test.testName} - Reason: {test.reason}
                    </li>
                  ))}
                </ul>
              </div>
              {selectedRequest.notes && (
                <div>
                  <h4 className="font-medium">Notes</h4>
                  <p>{selectedRequest.notes}</p>
                </div>
              )}
              {selectedRequest.result && (
                <div>
                  <h4 className="font-medium">Results</h4>
                  <div className="mt-2">
                    {Object.entries(selectedRequest.result.result).map(([test, value]) => (
                      <div key={test} className="flex justify-between py-2 border-b">
                        <span className="font-medium">{test}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                  {selectedRequest.result.notes && (
                    <p className="mt-2 text-sm text-gray-600">{selectedRequest.result.notes}</p>
                  )}
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedRequest(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lab Result Detail Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Lab Result Details</h2>
              <button onClick={() => setSelectedResult(null)} className="text-gray-500 hover:text-gray-700">
                <Eye className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Patient Information</h4>
                <p>Name: {selectedResult.patientName}</p>
                <p>Email: {selectedResult.patientEmail}</p>
              </div>
              <div>
                <h4 className="font-medium">Lab Technician</h4>
                <p>Name: {selectedResult.labTechnicianName}</p>
                <p>Email: {selectedResult.labTechnicianEmail}</p>
              </div>
              <div>
                <h4 className="font-medium">Test Results</h4>
                <div className="mt-2">
                  {Object.entries(selectedResult.result).map(([test, value]) => (
                    <div key={test} className="flex justify-between py-2 border-b">
                      <span className="font-medium">{test}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {selectedResult.notes && (
                <div>
                  <h4 className="font-medium">Notes</h4>
                  <p>{selectedResult.notes}</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Created: {format(new Date(selectedResult.createdAt), 'PPP')}
                </p>
                {selectedResult.prescriptionId && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Prescription Created
                  </span>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="primary"
                  onClick={() => {
                    setPrescriptionData({
                      ...prescriptionData,
                      patientId: selectedResult.patientId,
                      labResultId: selectedResult.id
                    });
                    setShowPrescriptionModal(true);
                  }}
                  disabled={!!selectedResult.prescriptionId}
                  className={selectedResult.prescriptionId ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  {selectedResult.prescriptionId ? 'Prescription Added' : 'Write Prescription'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowReferralModal(true)}
                >
                  Write Referral
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedResult(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Write Prescription</h2>
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {prescriptionData.medications.map((medication, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Medication #{index + 1}</h3>
                    {index > 0 && (
                      <button
                        onClick={() => handleRemoveMedication(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Medicine Name"
                      value={medication.medicineName}
                      onChange={(e) => handleMedicationChange(index, 'medicineName', e.target.value)}
                    />
                    <Input
                      label="Dosage"
                      value={medication.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                    />
                    <Input
                      label="Frequency"
                      value={medication.frequency}
                      onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                    />
                    <Input
                      label="Duration"
                      value={medication.duration}
                      onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                    />
                    <Input
                      label="Quantity"
                      type="number"
                      value={medication.quantity}
                      onChange={(e) => handleMedicationChange(index, 'quantity', parseInt(e.target.value))}
                      min={1}
                    />
                    <Input
                      label="Instructions"
                      value={medication.instructions}
                      onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={handleAddMedication}
                className="w-full"
              >
                Add Another Medication
              </Button>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={prescriptionData.notes}
                  onChange={(e) => setPrescriptionData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={4}
                  placeholder="Additional notes or instructions..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPrescriptionModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleLabRequestSubmit}
                >
                  Submit Prescription
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Write Referral</h2>
              <button
                onClick={() => setShowReferralModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Referring Clinic Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Referring Clinic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Clinic Name"
                    value={referralData.referringClinicName}
                    onChange={(e) => setReferralData(prev => ({
                      ...prev,
                      referringClinicName: e.target.value
                    }))}
                    required
                  />
                  <Input
                    label="Clinic Address"
                    value={referralData.referringClinicAddress}
                    onChange={(e) => setReferralData(prev => ({
                      ...prev,
                      referringClinicAddress: e.target.value
                    }))}
                    required
                  />
                  <Input
                    label="Clinic Phone"
                    value={referralData.referringClinicPhone}
                    onChange={(e) => setReferralData(prev => ({
                      ...prev,
                      referringClinicPhone: e.target.value
                    }))}
                    required
                  />
                  <Input
                    label="Clinic Email"
                    type="email"
                    value={referralData.referringClinicEmail}
                    onChange={(e) => setReferralData(prev => ({
                      ...prev,
                      referringClinicEmail: e.target.value
                    }))}
                    required
                  />
                </div>
              </div>

              {/* Referred To Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Referred To</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Clinic / Hospital Name"
                    value={referralData.referredToClinic}
                    onChange={(e) => setReferralData(prev => ({
                      ...prev,
                      referredToClinic: e.target.value
                    }))}
                    required
                  />
                  <Input
                    label="Department"
                    value={referralData.department}
                    onChange={(e) => setReferralData(prev => ({
                      ...prev,
                      department: e.target.value
                    }))}
                    required
                  />
                  <Input
                    label="Specialist Name"
                    value={referralData.specialist}
                    onChange={(e) => setReferralData(prev => ({
                      ...prev,
                      specialist: e.target.value
                    }))}
                  />
                  <Input
                    label="Address"
                    value={referralData.address}
                    onChange={(e) => setReferralData(prev => ({
                      ...prev,
                      address: e.target.value
                    }))}
                    required
                  />
                  <Input
                    label="Phone"
                    value={referralData.phone}
                    onChange={(e) => setReferralData(prev => ({
                      ...prev,
                      phone: e.target.value
                    }))}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={referralData.email}
                    onChange={(e) => setReferralData(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                  />
                </div>
              </div>

              {/* Clinical Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Clinical Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Urgency Level
                      </label>
                      <select
                        value={referralData.urgencyLevel}
                        onChange={(e) => setReferralData(prev => ({
                          ...prev,
                          urgencyLevel: e.target.value as 'routine' | 'urgent' | 'emergency'
                        }))}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      >
                        <option value="routine">Routine</option>
                        <option value="urgent">Urgent</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Clinical History
                    </label>
                    <textarea
                      value={referralData.clinicalHistory}
                      onChange={(e) => setReferralData(prev => ({
                        ...prev,
                        clinicalHistory: e.target.value
                      }))}
                      className="w-full px-3 py-2 border rounded-md"
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Medications
                    </label>
                    <textarea
                      value={referralData.currentMedications}
                      onChange={(e) => setReferralData(prev => ({
                        ...prev,
                        currentMedications: e.target.value
                      }))}
                      className="w-full px-3 py-2 border rounded-md"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Diagnosis Notes
                    </label>
                    <textarea
                      value={referralData.diagnosisNotes}
                      onChange={(e) => setReferralData(prev => ({
                        ...prev,
                        diagnosisNotes: e.target.value
                      }))}
                      className="w-full px-3 py-2 border rounded-md"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Treatment Given
                    </label>
                    <textarea
                      value={referralData.treatmentGiven}
                      onChange={(e) => setReferralData(prev => ({
                        ...prev,
                        treatmentGiven: e.target.value
                      }))}
                      className="w-full px-3 py-2 border rounded-md"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recommended Treatment Plan
                    </label>
                    <textarea
                      value={referralData.recommendedTreatmentPlan}
                      onChange={(e) => setReferralData(prev => ({
                        ...prev,
                        recommendedTreatmentPlan: e.target.value
                      }))}
                      className="w-full px-3 py-2 border rounded-md"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Additional Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Instructions
                    </label>
                    <textarea
                      value={referralData.specialInstructions}
                      onChange={(e) => setReferralData(prev => ({
                        ...prev,
                        specialInstructions: e.target.value
                      }))}
                      className="w-full px-3 py-2 border rounded-md"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Follow-up Plan
                    </label>
                    <textarea
                      value={referralData.followUpPlan}
                      onChange={(e) => setReferralData(prev => ({
                        ...prev,
                        followUpPlan: e.target.value
                      }))}
                      className="w-full px-3 py-2 border rounded-md"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      value={referralData.additionalNotes}
                      onChange={(e) => setReferralData(prev => ({
                        ...prev,
                        additionalNotes: e.target.value
                      }))}
                      className="w-full px-3 py-2 border rounded-md"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowReferralModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={generateReferralPDF}
                >
                  Generate Referral PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabRequest;
