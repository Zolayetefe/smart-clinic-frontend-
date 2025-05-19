// import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { AppointmentProvider } from './contexts/AppointmentContext';
import AppRoutes from './routes/index';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard Pages
import AdminDashboard from './pages/dashboard/admin/AdminDashboard';
import PatientDashboard from './pages/dashboard/patient/PatientDashboard';
import DoctorDashboard from './pages/dashboard/doctor/DoctorDashboard';
import NurseDashboard from './pages/dashboard/nurse/NurseDashboard';

// Patient Pages
import Appointments from './pages/dashboard/patient/Appointments';
import BookAppointment from './pages/dashboard/patient/BookAppointment';
import MedecalRecords from './pages/dashboard/patient/ MedicalRecordss';

// Doctor Pages
import DoctorAppointments from './pages/dashboard/doctor/Appointments';
// import Prescriptions from './pages/dashboard/doctor/Prescriptions';
import LabRequests from './pages/dashboard/doctor/LabRequests';
// import DoctorAppointment from './pages/dashboard/doctor/DoctorAppointments';

// labratory Pages
import LabTechnician from './pages/dashboard/labTechnician/LabTechnician';
// import Analytics from './pages/dashboard/admin/Analytics';

// Admin Pages
import StaffManagement from './pages/dashboard/admin/StaffManagement';
import Analytics from './pages/dashboard/admin/Analytics';

// Protected Route
import ProtectedRoute from './components/auth/ProtectedRoute';
// import LabTechnician from './pages/dashboard/labTechnician/LabTechnician';
// import MedicalRecords from './pages/dashboard/patient/PatientRecords';

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppointmentProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#333',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#4aed88',
                    color: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  style: {
                    background: '#ff4b4b',
                    color: '#fff',
                  },
                },
              }}
            />
            <AppRoutes />
          </AppointmentProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;