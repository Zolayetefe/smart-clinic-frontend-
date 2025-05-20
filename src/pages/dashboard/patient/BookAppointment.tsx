import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, User, Clock, FileText, ArrowRight, CheckCircle, Activity } from 'lucide-react';
import axios from 'axios';
import Button from '../../../components/ui/Button';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../contexts/AuthContext';

// Specialty options for doctor selection
const specialties = [
  { id: 'Cardiologist', name: 'Cardiology', description: 'Heart and cardiovascular system' },
  { id: 'dermatology', name: 'Dermatology', description: 'Skin, hair, and nails' },
  { id: 'neurology', name: 'Neurology', description: 'Brain, spinal cord, and nervous system' },
  { id: 'orthopedics', name: 'Orthopedics', description: 'Bones, joints, ligaments, tendons, and muscles' },
  { id: 'gastroenterology', name: 'Gastroenterology', description: 'Digestive system and related organs' },
  { id: 'general', name: 'General Medicine', description: 'General health assessments and primary care' },
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
  { id: 's1', name: 'fever', matches: ['general'] },
  { id: 's2', name: 'cough', matches: ['general'] },
  { id: 's3', name: 'headache', matches: ['neurology', 'general'] },
  { id: 's4', name: 'joint pain', matches: ['orthopedics'] },
  { id: 's5', name: 'chest pain', matches: ['cardiology'] },
  { id: 's6', name: 'shortness of breath', matches: ['cardiology', 'general'] },
  { id: 's7', name: 'nausea', matches: ['gastroenterology'] },
  { id: 's8', name: 'dizziness', matches: ['neurology', 'general'] },
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
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
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
  
  // Get AI recommendation
  const getAiRecommendation = () => {
    setIsAiRecommending(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      // Simple matching algorithm - find most matched specialty
      const symptomObjects = commonSymptoms.filter(s => selectedSymptoms.includes(s.id));
      const specialtyCounts: Record<string, number> = {};
      
      symptomObjects.forEach(symptom => {
        symptom.matches.forEach(specialty => {
          specialtyCounts[specialty] = (specialtyCounts[specialty] || 0) + 1;
        });
      });
      
      // Find specialty with highest count
      let maxCount = 0;
      let recommendedSpecialty = 'general';
      
      Object.entries(specialtyCounts).forEach(([specialty, count]) => {
        if (count > maxCount) {
          maxCount = count;
          recommendedSpecialty = specialty;
        }
      });
      
      setAiRecommendation(recommendedSpecialty);
      setSelectedSpecialty(recommendedSpecialty);
      setIsAiRecommending(false);
    }, 1500);
  };
  
  // Fetch doctors when specialty is selected
  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/patient/doctors/${selectedSpecialty}`, {
        withCredentials: true
      });
      setDoctors(response.data.doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };
  
  // Update the confirmBooking function
  const confirmBooking = async () => {
    try {
      if (!selectedDoctor || !selectedSlot) {
        console.error('Missing required booking information');
        return;
      }

      // Use patientId from URL params if available (receptionist flow), otherwise use logged-in user's patientId
      const bookingPatientId = patientId || user?.patient?.id;
      
      if (!bookingPatientId) {
        console.error('Patient ID not found');
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

      console.log('Sending appointment data:', appointmentData);

      const response = await axios.post(
        'http://localhost:5000/api/patient/book-appointment', 
        appointmentData,
        { withCredentials: true }
      );

      if (response.data) {
        setIsBookingComplete(true);
        
        // Navigate based on user role
        setTimeout(() => {
          if (user?.role.toLowerCase() === 'receptionist') {
            navigate('/receptionist');
          } else {
            navigate('/patient/appointments');
          }
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error creating appointment:', error.response?.data || error.message);
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
                <h6 className="font-medium text-sm mb-2">Available Slots:</h6>
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
  
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
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
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What symptoms are you experiencing?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {commonSymptoms.map(symptom => (
                    <button
                      key={symptom.id}
                      type="button"
                      onClick={() => toggleSymptom(symptom.id)}
                      className={`py-2 px-3 rounded-md text-sm transition ${
                        selectedSymptoms.includes(symptom.id)
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {symptom.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Choose specialist type</h4>
                  {selectedSymptoms.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={getAiRecommendation}
                      isLoading={isAiRecommending}
                    >
                      Get AI recommendation
                    </Button>
                  )}
                </div>
                
                {aiRecommendation && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      <strong>AI Recommendation:</strong> Based on your symptoms, we recommend seeing a{' '}
                      <span className="font-semibold capitalize">{aiRecommendation}</span> specialist.
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {specialties.map(specialty => (
                    <div
                      key={specialty.id}
                      onClick={() => setSelectedSpecialty(specialty.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition ${
                        selectedSpecialty === specialty.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <h5 className="font-medium text-gray-900">{specialty.name}</h5>
                      <p className="text-sm text-gray-500 mt-1">{specialty.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
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