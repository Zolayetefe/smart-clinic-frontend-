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
import LabRequestApproval from '../pages/dashboard/financeStaff/LabRequestApproval';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import MedicalRecords from '../pages/dashboard/patient/ MedicalRecordss';
import Profile from '../pages/Profile';
import PrescriptionApproval from '../pages/dashboard/financeStaff/PrescriptionApproval';

import { useAuth } from '../contexts/AuthContext';
import PharmacistPage from '../pages/dashboard/pharmacist/PharmacistPage';
 
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
      case 'pharmacist':
        return '/pharmacist';
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

        {/* Patient routes */}
        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/appointments"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/records"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <MedicalRecords />
              
              
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/book-appointment"
          element={
            <ProtectedRoute allowedRoles={['patient','receptionist']}>
              <BookAppointment />
            </ProtectedRoute>
          }
        />

        {/* Nurse routes */}
        <Route
          path="/nurse"
          element={
            <ProtectedRoute allowedRoles={['nurse']}>
              <NurseDashboard />
            </ProtectedRoute>
          }
        />

        {/* Receptionist routes */}
        <Route
          path="/receptionist"
          element={
            <ProtectedRoute allowedRoles={['receptionist']}>
              <ReceptionistDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receptionist/book-appointment/:patientId"
          element={
            <ProtectedRoute allowedRoles={['receptionist']}>
              <BookAppointment />
            </ProtectedRoute>
          }
        />
        {/* finance staff routes */}
        <Route
          path="/finance"
          element={
            <ProtectedRoute allowedRoles={['finance']}>
              <FinanceDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/lab-request-approval"
          element={
            <ProtectedRoute allowedRoles={['finance']}>
              <LabRequestApproval />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/prescription-approval"
          element={
            <ProtectedRoute allowedRoles={['finance']}>
              <PrescriptionApproval />
            </ProtectedRoute>
          }
        />
        {/* Lab Technician routes */}
        <Route
          path="/lab_technician"
          element={
            <ProtectedRoute allowedRoles={['lab_technician']}>
              <LabTechnician />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lab_technician/results"
          element={
            <ProtectedRoute allowedRoles={['lab_technician']}>
              <LabResultPage />
            </ProtectedRoute> 
          }
        />
        {/* Pharmacist routes */}
        <Route
          path="/pharmacist"
          element={
            <ProtectedRoute allowedRoles={['pharmacist']}>
              <PharmacistPage />
            </ProtectedRoute>
          }
        />

        <Route
  path="/profile"
  element={
    <ProtectedRoute allowedRoles={['admin', 'doctor', 'patient', 'nurse', 'lab_technician', 'pharmacist', 'receptionist', 'finance']}>
      <Profile />
    </ProtectedRoute>
  }
/>

        
        {/* Update the catch-all route to use role-based redirect */}
        <Route 
          path="*" 
          element={<Navigate to={user ? getDefaultRoute(user.role) : '/login'} replace />} 
        />
      </Route>

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to={user ? getDefaultRoute(user.role) : '/login'} />} />
    </Routes>
  );
};

export default AppRoutes;
