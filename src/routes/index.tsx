import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import DoctorDashboard from '../pages/dashboard/doctor/DoctorDashboard';
import DoctorAppointments from '../pages/dashboard/doctor/Appointments';
import Prescriptions from '../pages/dashboard/doctor/Prescriptions';
import LabRequests from '../pages/dashboard/doctor/LabRequests';
import PatientDashboard from '../pages/dashboard/patient/PatientDashboard';
import PatientAppointments from '../pages/dashboard/patient/Appointments';
import BookAppointment from '../pages/dashboard/patient/BookAppointment';
import AdminDashboard from '../pages/dashboard/admin/AdminDashboard';
import StaffManagement from '../pages/dashboard/admin/StaffManagement';
import Analytics from '../pages/dashboard/admin/Analytics';
import NurseDashboard from '../pages/dashboard/nurse/NurseDashboard';
import ReceptionistDashboard from '../pages/dashboard/receptionist/ReceptionistDashboard';
import FinanceDashboard from '../pages/dashboard/financeStaff/FinanceDashboard';
import LabTechnician from '../pages/dashboard/labTechnician/LabTechnician';
import LabResultPage from '../pages/dashboard/labTechnician/LabResultPage';
import Profile from '../pages/Profile';
import { useAuth } from '../contexts/AuthContext';
import MedicalRecords from '../pages/dashboard/patient/ MedicalRecordss';

const AppRoutes = () => {
  const { user } = useAuth();

  const getDefaultRoute = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return '/admin';
      case 'doctor':
        return '/doctor';
      case 'patient':
        return '/patient';
      case 'nurse':
        return '/nurse';
      case 'receptionist':
        return '/receptionist';
      case 'lab_technician':
        return '/lab_technician';
      case 'finance':
        return '/finance';
      default:
        return '/';
    }
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected routes */}
      <Route element={<DashboardLayout />}>
        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/staff" element={<StaffManagement />} />
        <Route path="/admin/analytics" element={<Analytics />} />

        {/* Doctor */}
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/doctor/prescriptions" element={<Prescriptions />} />
        <Route path="/doctor/lab-requests" element={<LabRequests />} />

        {/* Patient */}
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/patient/appointments" element={<PatientAppointments />} />
        <Route path="/patient/records" element={<MedicalRecords />} />
        <Route path="/patient/book-appointment" element={<BookAppointment />} />

        {/* Nurse */}
        <Route path="/nurse" element={<NurseDashboard />} />

        {/* Receptionist */}
        <Route path="/receptionist" element={<ReceptionistDashboard />} />

        {/* Finance */}
        <Route path="/finance" element={<FinanceDashboard />} />

        {/* Lab Technician */}
        <Route path="/lab_technician" element={<LabTechnician />} />
        <Route path="/lab_technician/results" element={<LabResultPage />} />

        {/* ✅ Profile */}
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to={user ? getDefaultRoute(user.role) : '/login'} />} />
    </Routes>
  );
};

export default AppRoutes;
