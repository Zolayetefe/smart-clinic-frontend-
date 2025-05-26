import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, User, Clock, FileText, ArrowRight, CheckCircle, Activity } from 'lucide-react';
import axios from 'axios';
import Button from '../../../components/ui/Button';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

// Specialty options for doctor selection
const specialties = [
  { 
    id: 'cardiology', 
    name: 'Cardiology', 
    description: 'Heart and cardiovascular system',
    commonSymptoms: ['chest pain', 'shortness of breath', 'irregular heartbeat', 'fatigue']
  },
  { 
    id: 'dermatology', 
    name: 'Dermatology', 
    description: 'Skin, hair, and nails',
    commonSymptoms: ['rash', 'itching', 'skin changes', 'hair loss']
  },
  { 
    id: 'neurology', 
    name: 'Neurology', 
    description: 'Brain, spinal cord, and nervous system',
    commonSymptoms: ['headache', 'dizziness', 'numbness', 'seizures']
  },
  { 
    id: 'orthopedics', 
    name: 'Orthopedics', 
    description: 'Bones, joints, ligaments, tendons, and muscles',
    commonSymptoms: ['joint pain', 'back pain', 'muscle weakness', 'stiffness']
  },
  { 
    id: 'gastroenterology', 
    name: 'Gastroenterology', 
    description: 'Digestive system and related organs',
    commonSymptoms: ['abdominal pain', 'nausea', 'vomiting', 'diarrhea']
  },
  { 
    id: 'general', 
    name: 'General Medicine', 
    description: 'General health assessments and primary care',
    commonSymptoms: ['fever', 'cough', 'fatigue', 'general pain']
  }
];

interface Doctor {
  userId: string;
  name: string;
  email: string;
  phone: string;
  doctorId: string;
  specialization: string;
  slots: TimeSlot[];
}

interface TimeSlot {
  id: string;
  day: string;
  time: string;
  isBooked: boolean;
}

// For demo purposes, use these symptoms for AI matching
const commonSymptoms = [
  { 
    id: 's1', 
    name: 'fever', 
    matches: ['general'],
    severity: 'low',
    description: 'Elevated body temperature'
  },
  { 
    id: 's2', 
    name: 'chest pain', 
    matches: ['cardiology', 'general'],
    severity: 'high',
    description: 'Pain or discomfort in the chest area'
  },
  { 
    id: 's3', 
    name: 'headache', 
    matches: ['neurology', 'general'],
    severity: 'medium',
    description: 'Pain in the head or upper neck'
  },
  { 
    id: 's4', 
    name: 'joint pain', 
    matches: ['orthopedics'],
    severity: 'medium',
    description: 'Pain in joints'
  },
  { 
    id: 's5', 
    name: 'shortness of breath', 
    matches: ['cardiology', 'general'],
    severity: 'high',
    description: 'Difficulty breathing or breathlessness'
  },
  { 
    id: 's6', 
    name: 'nausea', 
    matches: ['gastroenterology'],
    severity: 'medium',
    description: 'Feeling of sickness with an inclination to vomit'
  },
  { 
    id: 's7', 
    name: 'dizziness', 
    matches: ['neurology', 'general'],
    severity: 'medium',
    description: 'Feeling lightheaded or unsteady'
  },
  { 
    id: 's8', 
    name: 'rash', 
    matches: ['dermatology'],
    severity: 'low',
    description: 'Skin irritation or discoloration'
  },
  { 
    id: 's9', 
    name: 'back pain', 
    matches: ['orthopedics', 'general'],
    severity: 'medium',
    description: 'Pain in the back area'
  },
  { 
    id: 's10', 
    name: 'sore throat', 
    matches: ['general'],
    severity: 'low',
    description: 'Pain or irritation in the throat'
  },
  { 
    id: 's11', 
    name: 'irregular heartbeat', 
    matches: ['cardiology'],
    severity: 'high',
    description: 'Abnormal heart rhythm'
  },
  { 
    id: 's12', 
    name: 'muscle weakness', 
    matches: ['neurology', 'orthopedics'],
    severity: 'medium',
    description: 'Reduced muscle strength'
  },
  { 
    id: 's13', 
    name: 'skin redness', 
    matches: ['dermatology'],
    severity: 'low',
    description: 'Redness or inflammation of the skin'
  },
  { 
    id: 's14', 
    name: 'stomach pain', 
    matches: ['gastroenterology', 'general'],
    severity: 'medium',
    description: 'Pain in the abdominal area'
  },
  { 
    id: 's15', 
    name: 'blurred vision', 
    matches: ['neurology'],
    severity: 'high',
    description: 'Difficulty seeing clearly'
  },
  { 
    id: 's16', 
    name: 'itching', 
    matches: ['dermatology'],
    severity: 'low',
    description: 'Irritating sensation causing a desire to scratch'
  }
];

interface BookingStep {
  title: string;
  icon: React.ReactNode;
}

// Update AppointmentRequest interface
interface AppointmentRequest {
  patientId: string;
  doctorId: string;
  dateTime: string;
  reason: string;
  slotId: string;
  symptoms: string[];
}

// Add new interface for AI recommendation
interface AiRecommendation {
  specialty: string;
  confidence: number;
  reasoning: string[];
  alternativeSpecialties: string[];
}

const BookAppointment: React.FC = () => {
  const { patientId } = useParams(); // Get patientId from URL params
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user data from auth context
  
  // Booking states
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingReason, setBookingReason] = useState('');
  const [isAiRecommending, setIsAiRecommending] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<AiRecommendation | null>(null);
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  
  // Steps for the booking process
  const steps: BookingStep[] = [
    { title: 'Symptoms & Specialty', icon: <FileText className="h-5 w-5" /> },
    { title: 'Doctor Selection', icon: <User className="h-5 w-5" /> },
    { title: 'Date & Time', icon: <Calendar className="h-5 w-5" /> },
    { title: 'Confirmation', icon: <CheckCircle className="h-5 w-5" /> },
  ];
  
  // Handle symptom selection
  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(id => id !== symptomId) 
        : [...prev, symptomId]
    );
  };
  
  // Enhanced AI recommendation function
  const getAiRecommendation = () => {
    if (selectedSymptoms.length === 0) {
      toast.error('Please select at least one symptom');
      return;
    }

    setIsAiRecommending(true);
    const aiToast = toast.loading('Analyzing symptoms...');
    
    // Simulate AI processing with more sophisticated logic
    setTimeout(() => {
      const symptomObjects = commonSymptoms.filter(s => selectedSymptoms.includes(s.id));
      const specialtyScores: Record<string, { score: number; reasons: string[] }> = {};
      
      // Calculate specialty scores with weighted severity
      symptomObjects.forEach(symptom => {
        const severityWeight = symptom.severity === 'high' ? 2 : symptom.severity === 'medium' ? 1.5 : 1;
        
        symptom.matches.forEach(specialty => {
          if (!specialtyScores[specialty]) {
            specialtyScores[specialty] = { score: 0, reasons: [] };
          }
          specialtyScores[specialty].score += severityWeight;
          specialtyScores[specialty].reasons.push(
            `${symptom.name} (${symptom.severity} severity) is commonly treated by ${specialty} specialists`
          );
        });
      });
      
      // Sort specialties by score
      const sortedSpecialties = Object.entries(specialtyScores)
        .sort(([,a], [,b]) => b.score - a.score);
      
      const primarySpecialty = sortedSpecialties[0];
      const alternativeSpecialties = sortedSpecialties
        .slice(1, 3)
        .map(([specialty]) => specialty);
      
      if (primarySpecialty) {
        const [recommendedSpecialty, details] = primarySpecialty;
        const confidence = (details.score / (symptomObjects.length * 2)) * 100;
        
        const recommendation: AiRecommendation = {
          specialty: recommendedSpecialty,
          confidence: Math.min(confidence, 100),
          reasoning: details.reasons,
          alternativeSpecialties
        };
        
        setAiRecommendation(recommendation);
        setSelectedSpecialty(recommendedSpecialty);
        
        toast.success('Specialty analysis complete', {
          id: aiToast
        });
      } else {
        setAiRecommendation({
          specialty: 'general',
          confidence: 100,
          reasoning: ['Based on the general nature of the symptoms'],
          alternativeSpecialties: []
        });
        setSelectedSpecialty('general');
        
        toast.success('Recommended general medicine', {
          id: aiToast
        });
      }
      
      setIsAiRecommending(false);
    }, 1500);
  };
  
  // Fetch doctors when specialty is selected
  const fetchDoctors = async () => {
    if (!selectedSpecialty) return;

    try {
      const response = await axios.get(`http://localhost:5000/api/patient/doctors/${selectedSpecialty}`, {
        withCredentials: true
      });

      if (response.data && response.data.doctors) {
        setDoctors(response.data.doctors);
        if (response.data.doctors.length === 0) {
          toast.error(`No doctors available for ${specialties.find(s => s.id === selectedSpecialty)?.name}`);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch doctors');
      setDoctors([]);
    }
  };
  
  // Update the confirmBooking function
  const confirmBooking = async () => {
    const bookingToast = toast.loading('Booking appointment...');
    
    try {
      if (!selectedDoctor || !selectedSlot) {
        toast.error('Missing required booking information');
        return;
      }

      const bookingPatientId = patientId || user?.patient?.id;
      
      if (!bookingPatientId) {
        toast.error('Patient ID not found');
        return;
      }

      const appointmentData: AppointmentRequest = {
        patientId: bookingPatientId,
        doctorId: selectedDoctor,
        dateTime: selectedSlot.time,
        reason: bookingReason,
        slotId: selectedSlot.id,
        symptoms: selectedSymptoms.map(symptomId => {
          const symptom = commonSymptoms.find(s => s.id === symptomId);
          return symptom ? symptom.name.toLowerCase() : '';
        }).filter(Boolean)
      };

      const response = await axios.post(
        'http://localhost:5000/api/patient/book-appointment', 
        appointmentData,
        { withCredentials: true }
      );

      if (response.data) {
        toast.success('Appointment booked successfully!', {
          id: bookingToast
        });
    setIsBookingComplete(true);
    
        // Navigate based on user role
    setTimeout(() => {
          if (user?.role.toLowerCase() === 'receptionist') {
            navigate('/receptionist');
          } else {
      navigate('/patient/appointments');
          }
        }, 2000);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to book appointment',
        { id: bookingToast }
      );
    }
  };
  
  // Get next available days starting from tomorrow
  const getAvailableDates = () => {
    const dates = [];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(tomorrow);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };
  
  // Move to next step
  const nextStep = async () => {
    if (currentStep === 0 && selectedSpecialty) {
      await fetchDoctors();
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Move to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Update doctor selection render
  const renderDoctorSelection = () => (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {doctors.map((doctor) => (
          <div
            key={doctor.doctorId}
            onClick={() => setSelectedDoctor(doctor.doctorId)}
            className={`p-4 border rounded-lg cursor-pointer transition ${
              selectedDoctor === doctor.doctorId
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-primary/50'
            }`}
          >
            <h5 className="font-medium text-gray-900">{doctor.name}</h5>
            <p className="text-sm text-gray-500">{doctor.specialization}</p>
            
            {selectedDoctor === doctor.doctorId && (
              <div className="mt-4">
                <h6 className="font-medium text-sm mb-2">This Week Doctor {doctor.name} Available Slots:</h6>
                <div className="grid grid-cols-2 gap-2">
                  {doctor.slots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!slot.isBooked) {
                          setSelectedSlot(slot);
                        }
                      }}
                      className={`
                        p-2 text-sm rounded transition-colors
                        ${slot.isBooked 
                          ? 'bg-red-100 text-red-800 cursor-not-allowed opacity-75' 
                          : selectedSlot?.id === slot.id
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }
                      `}
                      disabled={slot.isBooked}
                      title={slot.isBooked ? 'This slot is already booked' : 'Available slot'}
                    >
                      <div className="flex items-center justify-between">
                        <span>{slot.day}</span>
                        <span>{slot.time}</span>
                      </div>
                      {slot.isBooked && (
                        <div className="text-xs mt-1">
                          Booked
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
  
  // Update the success message to be role-specific
  const getSuccessMessage = () => {
    if (user?.role.toLowerCase() === 'receptionist') {
      return "The appointment has been successfully booked for the patient.";
    }
    return "Your appointment has been successfully booked. You will receive a confirmation email shortly.";
  };
  
  // Update the Step 1 content to better separate manual and AI-assisted selection
  const renderStepOne = () => (
    <div className="space-y-6">
      {/* Symptoms Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What symptoms are you experiencing? (Optional)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commonSymptoms.map(symptom => (
            <div
              key={symptom.id}
              className="border rounded-lg p-4 bg-white"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`w-full text-left ${
                      selectedSymptoms.includes(symptom.id)
                        ? 'text-primary'
                        : 'text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${selectedSymptoms.includes(symptom.id)
                          ? 'border-primary bg-primary'
                          : 'border-gray-300'
                        }`}
                      >
                        {selectedSymptoms.includes(symptom.id) && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="font-medium">{symptom.name}</span>
                      {symptom.severity === 'high' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          High Priority
                        </span>
                      )}
                    </div>
                  </button>
                  <div className="mt-2 text-sm text-gray-500">
                    {symptom.description}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    Severity: {symptom.severity}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Specialty Selection */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-900">Choose a Specialty</h4>
            {selectedSymptoms.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={getAiRecommendation}
                isLoading={isAiRecommending}
                className="ml-4"
              >
                Get recommendation
              </Button>
            )}
          </div>

          {/*  Recommendation if available */}
          {renderAiRecommendation()}

          {/* Manual Selection */}
          <div className="mt-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              Select a specialty manually:
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {specialties.map(specialty => (
                <div
                  key={specialty.id}
                  onClick={() => setSelectedSpecialty(specialty.id)}
                  className={`
                    p-4 border rounded-lg cursor-pointer transition
                    ${
                      selectedSpecialty === specialty.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <h5 className="font-medium text-gray-900">{specialty.name}</h5>
                  <p className="text-sm text-gray-500 mt-1">{specialty.description}</p>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Common symptoms:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {specialty.commonSymptoms.map((symptom, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Update the  recommendation display
  const renderAiRecommendation = () => {
    if (!aiRecommendation) return null;

    const recommendedSpecialtyObj = specialties.find(s => s.id === aiRecommendation.specialty);
    
    return (
      <div className="mb-4 space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-green-800">AI Recommendation</h4>
            <span className="text-sm font-medium text-green-600">
              {Math.round(aiRecommendation.confidence)}% confidence
            </span>
          </div>
          
          <p className="text-sm text-green-800 mb-3">
            Based on your symptoms, we recommend seeing a{' '}
            <span className="font-semibold">
              {recommendedSpecialtyObj?.name || 'General Medicine'}
            </span> specialist.
          </p>
          
          <div className="text-sm text-green-700">
            <strong className="block mb-1">Reasoning:</strong>
            <ul className="list-disc list-inside space-y-1">
              {aiRecommendation.reasoning.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </div>
          
          {aiRecommendation.alternativeSpecialties.length > 0 && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <p className="text-sm text-green-700">
                <strong>Alternative options to consider: </strong>
                {aiRecommendation.alternativeSpecialties.map(specialty => (
                  specialties.find(s => s.id === specialty)?.name
                )).join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="w-full animate-fade-in">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div 
                className={`flex flex-col items-center ${
                  index <= currentStep ? 'text-primary' : 'text-gray-400'
                }`}
              >
                <div 
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    index <= currentStep 
                      ? 'border-primary bg-primary/10' 
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {step.icon}
                </div>
                <span className="mt-2 text-sm font-medium hidden sm:block">{step.title}</span>
              </div>
              
              {index < steps.length - 1 && (
                <div 
                  className={`flex-1 h-1 mx-4 ${
                    index < currentStep ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Step Content */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-medium text-gray-900">{steps[currentStep].title}</h3>
        </CardHeader>
        <CardBody>
          {/* Step 1: Symptoms & Specialty */}
          {currentStep === 0 && renderStepOne()}
          
          {/* Step 2: Doctor Selection */}
          {currentStep === 1 && renderDoctorSelection()}
          
          {/* Step 3: Date & Time */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {selectedDoctor && selectedSlot && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Selected Time Slot</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Day</p>
                      <p className="font-medium">{selectedSlot.day}</p>
                    </div>
              <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{selectedSlot.time}</p>
                </div>
              </div>
                </div>
              )}
              
              <div>
                <Input
                  label="Reason for appointment (optional)"
                  value={bookingReason}
                  onChange={(e) => setBookingReason(e.target.value)}
                  placeholder="Briefly describe your reason for visit"
                />
              </div>
            </div>
          )}
          
          {/* Step 4: Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {isBookingComplete ? (
                <div className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-green-100 p-3">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Appointment Confirmed!</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {getSuccessMessage()}
                  </p>
                  <p className="mt-4 text-sm font-medium text-primary">
                    Redirecting to {user?.role.toLowerCase() === 'receptionist' ? 'dashboard' : 'appointments'}...
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Appointment Summary</h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Doctor:</span>
                        <span className="font-medium text-gray-900">
                          {doctors.find(d => d.doctorId === selectedDoctor)?.name}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500">Specialty:</span>
                        <span className="font-medium text-gray-900">
                          {selectedSpecialty ? specialties.find(s => s.id === selectedSpecialty)?.name : ''}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span className="font-medium text-gray-900">
                          {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500">Time:</span>
                        <span className="font-medium text-gray-900">
                          {selectedSlot ? `${selectedSlot.day} at ${selectedSlot.time}` : ''}
                        </span>
                      </div>
                      
                      {bookingReason && (
                        <div className="pt-3 border-t border-gray-200">
                          <span className="block text-gray-500">Reason:</span>
                          <span className="block mt-1 text-gray-900">{bookingReason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-500 mb-4">
                      By confirming this appointment, you agree to our cancellation policy.
                      Please arrive 15 minutes before your scheduled appointment time.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </CardBody>
      </Card>
      
      {/* Navigation Buttons */}
      {!isBookingComplete && (
        <div className="mt-6 flex justify-between">
          {currentStep > 0 ? (
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
          ) : (
            <div></div>
          )}
          
          {currentStep < steps.length - 1 ? (
            <Button 
              variant="primary" 
              onClick={nextStep}
              disabled={
                (currentStep === 0 && !selectedSpecialty) ||
                (currentStep === 1 && !selectedDoctor) ||
                (currentStep === 2 && !selectedSlot)
              }
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button 
              variant="primary" 
              onClick={confirmBooking}
              rightIcon={<CheckCircle className="h-4 w-4" />}
            >
              Confirm Appointment
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default BookAppointment;