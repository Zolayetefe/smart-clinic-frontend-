// User types
export interface UserType {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'nurse' | 'patient' | 'receptionist' | 'pharmacist' | 'lab_technician' | 'finance';
 
}

// Patient types
export interface PatientType {
  id: string;
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  contact: string;
  email: string;
  medicalHistory?: string;
}

// Appointment types
export interface AppointmentType {
  id: string;
  patientId: string;
  doctorId: string;
  triageId?: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending' | 'approved';
  reason?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

// Triage types
export interface TriageType {
  id: string;
  patientId: string;
  symptoms: string[];
  temperature?: number;
  pulse?: number;
  bloodPressure?: string;
  nurseId: string;
  notes?: string;
  createdAt: string;
}

// Prescription types
export interface MedicationType {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface PrescriptionType {
  id: string;
  doctorId: string;
  patientId: string;
  medications: MedicationType[];
  instructions?: string;
  createdAt: string;
}

// Lab types
export interface LabRequestType {
  id: string;
  doctorId: string;
  patientId: string;
  testsRequested: string[];
  reason: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface LabResultType {
  id: string;
  labRequestId: string;
  results: {
    test: string;
    result: string;
    normalRange?: string;
    interpretation?: string;
  }[];
  technicianId: string;
  notes?: string;
  createdAt: string;
}

// Referral types
export interface ReferralType {
  id: string;
  doctorId: string;
  patientId: string;
  reason: string;
  referredTo: string;
  status: 'pending' | 'accepted' | 'rejected';
  notes?: string;
  createdAt: string;
}

// Staff types
export interface StaffType extends UserType {
  specialty?: string;
  qualification?: string;
  activeStatus: boolean;
  contactInfo: string;
}

// Financial types
export interface FinancialRecordType {
  id: string;
  appointmentId: string;
  amount: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  paymentMethod?: string;
  date: string;
  receiptNo?: string;
}

// Dashboard types
export interface StatCardType {
  title: string;
  value: number | string;
  icon: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

// AI suggestion types
export interface TriageInputType {
  symptoms: string[];
  vitalSigns?: {
    temperature?: number;
    pulse?: number;
    bloodPressure?: string;
  };
  patientAge?: number;
  patientGender?: string;
}

export interface DoctorSuggestionType {
  specialty: string;
  confidence: number;
  reasoning: string;
}