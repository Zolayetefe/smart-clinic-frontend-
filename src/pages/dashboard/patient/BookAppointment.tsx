import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Clock, FileText, ArrowRight, CheckCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';

// Specialty options for doctor selection
const specialties = [
  { id: 'cardiology', name: 'Cardiology', description: 'Heart and cardiovascular system' },
  { id: 'dermatology', name: 'Dermatology', description: 'Skin, hair, and nails' },
  { id: 'neurology', name: 'Neurology', description: 'Brain, spinal cord, and nervous system' },
  { id: 'orthopedics', name: 'Orthopedics', description: 'Bones, joints, ligaments, tendons, and muscles' },
  { id: 'gastroenterology', name: 'Gastroenterology', description: 'Digestive system and related organs' },
  { id: 'general', name: 'General Medicine', description: 'General health assessments and primary care' },
];

// Mock doctors data
const doctors = [
  { id: 1, name: 'Dr. Sarah Johnson', specialty: 'cardiology', image: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=150', rating: 4.9, available: true },
  { id: 2, name: 'Dr. Robert Williams', specialty: 'dermatology', image: 'https://images.pexels.com/photos/4225880/pexels-photo-4225880.jpeg?auto=compress&cs=tinysrgb&w=150', rating: 4.7, available: true },
  { id: 3, name: 'Dr. Jennifer Lopez', specialty: 'neurology', image: 'https://images.pexels.com/photos/5214959/pexels-photo-5214959.jpeg?auto=compress&cs=tinysrgb&w=150', rating: 4.8, available: true },
  { id: 4, name: 'Dr. Michael Chen', specialty: 'orthopedics', image: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=150', rating: 4.6, available: true },
  { id: 5, name: 'Dr. Emily Patel', specialty: 'gastroenterology', image: 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=150', rating: 4.8, available: true },
  { id: 6, name: 'Dr. James Wilson', specialty: 'general', image: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=150', rating: 4.9, available: true },
];

// Available time slots
const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM'
];

// For demo purposes, use these symptoms for AI matching
const commonSymptoms = [
  { id: 's1', name: 'Chest pain', matches: ['cardiology'] },
  { id: 's2', name: 'Rash', matches: ['dermatology'] },
  { id: 's3', name: 'Headache', matches: ['neurology', 'general'] },
  { id: 's4', name: 'Joint pain', matches: ['orthopedics'] },
  { id: 's5', name: 'Stomachache', matches: ['gastroenterology'] },
  { id: 's6', name: 'Fever', matches: ['general'] },
  { id: 's7', name: 'Cough', matches: ['general'] },
  { id: 's8', name: 'Dizziness', matches: ['neurology', 'general'] },
];

interface BookingStep {
  title: string;
  icon: React.ReactNode;
}

const BookAppointment: React.FC = () => {
  const navigate = useNavigate();
  
  // Booking states
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingReason, setBookingReason] = useState('');
  const [isAiRecommending, setIsAiRecommending] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  
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
  
  // Filter doctors by specialty
  const filteredDoctors = selectedSpecialty 
    ? doctors.filter(doctor => doctor.specialty === selectedSpecialty)
    : doctors;
  
  // Handle booking confirmation
  const confirmBooking = () => {
    // In a real app, this would make an API call to create the appointment
    setIsBookingComplete(true);
    
    // Navigate to appointments page after a delay
    setTimeout(() => {
      navigate('/patient/appointments');
    }, 3000);
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
  const nextStep = () => {
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
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">
                Please select a doctor from our{' '}
                <span className="font-medium capitalize">{selectedSpecialty}</span> specialists.
              </p>
              
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {filteredDoctors.map(doctor => (
                  <div
                    key={doctor.id}
                    onClick={() => setSelectedDoctor(doctor.id)}
                    className={`p-4 border rounded-lg cursor-pointer flex items-start transition ${
                      selectedDoctor === doctor.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <img 
                      src={doctor.image} 
                      alt={doctor.name}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h5 className="font-medium text-gray-900">{doctor.name}</h5>
                      <p className="text-sm text-gray-500 capitalize">{doctor.specialty}</p>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.floor(doctor.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor" 
                              viewBox="0 0 20 20" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="ml-1 text-sm text-gray-500">{doctor.rating}</span>
                        </div>
                        {doctor.available && (
                          <span className="ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Step 3: Date & Time */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a preferred date
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {getAvailableDates().map(date => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={`py-2 px-3 rounded-md text-sm transition ${
                        selectedDate === date
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a preferred time
                </label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 px-3 rounded-md text-sm transition ${
                        selectedTime === time
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
              
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
                    Your appointment has been successfully booked. You will receive a confirmation email shortly.
                  </p>
                  <p className="mt-4 text-sm font-medium text-primary">
                    Redirecting to appointments...
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
                          {doctors.find(d => d.id === selectedDoctor)?.name}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500">Specialty:</span>
                        <span className="font-medium text-gray-900 capitalize">
                          {selectedSpecialty}
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
                        <span className="font-medium text-gray-900">{selectedTime}</span>
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
                (currentStep === 2 && (!selectedDate || !selectedTime))
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