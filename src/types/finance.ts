export interface FinanceAppointment {
  id: string;
  patient: string;
  patientId: string;
  patientEmail: string;
  patientPhone: string;
  doctor: string;
  doctorId: string;
  doctorEmail: string;
  doctorPhone: string;
  status: string;
  reason: string;
  appointmentDate: string;
  financeStatus: string | null;
  amount?: number;
}

export interface ApprovalRequest {
  amount: number;
  financeStaffId: string;
  approvalStatus: 'approved' | 'rejected';
} 