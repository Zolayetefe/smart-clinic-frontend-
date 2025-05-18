// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';

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
import MedecalRecords from './pages/dashboard/patient/ MedicalRecords';

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
    <ThemeProvider>
      <AuthProvider>
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
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Dashboard Routes */}
            <Route element={<DashboardLayout />}>
              {/* Admin Routes */}
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

              {/* Patient Routes */}
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
                    <Appointments />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/patient/records" 
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <MedecalRecords />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/patient/book-appointment" 
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <BookAppointment />
                  </ProtectedRoute>
                } 
              />

              {/* Doctor Routes */}
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
            
              {/* <Route 
                path="/doctor/patients/:id" 
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <PatientRecords />
                  </ProtectedRoute>
                } 
              /> */}
              {/* <Route 
                path="/doctor/prescriptions" 
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <Prescriptions />
                  </ProtectedRoute>
                } 
              /> */}
              <Route 
                path="/doctor/lab-requests" 
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <LabRequests />
                  </ProtectedRoute>
                } 
              />

              {/* Nurse Routes */}
              <Route 
                path="/nurse" 
                element={
                  <ProtectedRoute allowedRoles={['nurse']}>
                    <NurseDashboard />
                  </ProtectedRoute>
                } 
              />
          

            {/* lab Routes */}
            <Route 
                path="/lab_technician" 
                element={
                  <ProtectedRoute allowedRoles={['lab_technician']}>
                    <LabTechnician/>
                  </ProtectedRoute>
                } 
              />
            </Route> 

          
            {/* Home redirect */}
            <Route element={<AuthLayout />}>
            <Route path="/" element={<Login />} />
            </Route>

          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;