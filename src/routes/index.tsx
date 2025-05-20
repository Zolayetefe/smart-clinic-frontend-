import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
import MedicalRecords from '../pages/dashboard/patient/ MedicalRecordss';
import BookAppointment from '../pages/dashboard/patient/BookAppointment';
import AdminDashboard from '../pages/dashboard/admin/AdminDashboard';
import StaffManagement from '../pages/dashboard/admin/StaffManagement';
import Analytics from '../pages/dashboard/admin/Analytics';
import NurseDashboard from '../pages/dashboard/nurse/NurseDashboard';
import ReceptionistDashboard from '../pages/dashboard/receptionist/ReceptionistDashboard';

const AppRoutes = () => {
  const { user } = useAuth();

  // Protected Route component
  const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
    const { user } = useAuth();
    
    if (!user) {
      return <Navigate to="/login" />;
    }

    // Convert role to lowercase for comparison
    const userRole = user.role.toLowerCase();
    
    if (!allowedRoles.includes(userRole)) {
      console.log('Access denied. User role:', userRole, 'Allowed roles:', allowedRoles);
      return <Navigate to="/" />;
    }

    return <>{children}</>;
  };

  return (
    <Routes>
      {/* Auth routes with AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected routes with DashboardLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'patient', 'nurse', 'lab_technician', 'pharmacist', 'receptionist', 'finance_staff']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StaffManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Analytics />
            </ProtectedRoute>
          }
        />

        {/* Doctor routes */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/prescriptions"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <Prescriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/lab-requests"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <LabRequests />
            </ProtectedRoute>
          }
        />

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

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes; 