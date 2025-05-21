export interface Vital {
  type: 'temperature' | 'heartBeat' | 'bloodPressure';
  value: string;
}

export interface NurseAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  reason: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorName: string;
  doctorEmail: string;
  doctorPhone: string;
  symptoms: string[];
  vitals: Vital[] | null;
  financeStatus: string | null;
}

export interface VitalsCheckInRequest {
  nurseId: string;
  vitals: Vital[];
} 