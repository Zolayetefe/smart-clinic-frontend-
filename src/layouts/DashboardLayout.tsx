import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, 
  Menu, 
  X, 
  Home, 
  Users, 
  BarChart, 
  Calendar, 
  FileText, 
  UserPlus, 
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Define navigation links based on user role
  const getNavLinks = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'admin':
        return [
          { name: 'Dashboard', href: '/admin', icon: <Home className="h-5 w-5" /> },
          { name: 'Staff Management', href: '/admin/staff', icon: <Users className="h-5 w-5" /> },
          { name: 'Analytics', href: '/admin/analytics', icon: <BarChart className="h-5 w-5" /> },
        ];
      case 'doctor':
        return [
          { name: 'Dashboard', href: '/doctor', icon: <Home className="h-5 w-5" /> },
          { name: 'Appointments', href: '/doctor/appointments', icon: <Calendar className="h-5 w-5" /> },
          { name: 'Prescriptions', href: '/doctor/prescriptions', icon: <FileText className="h-5 w-5" /> },
          { name: 'Lab Requests', href: '/doctor/lab-requests', icon: <FileText className="h-5 w-5" /> },
        ];
      case 'patient':
        return [
          { name: 'Dashboard', href: '/patient', icon: <Home className="h-5 w-5" /> },
          { name: 'Appointments', href: '/patient/appointments', icon: <Calendar className="h-5 w-5" /> },
          { name: 'Medical Records', href: '/patient/records', icon: <FileText className="h-5 w-5" /> },
          { name: 'Book Appointment', href: '/patient/book-appointment', icon: <UserPlus className="h-5 w-5" /> },
        ];
      case 'nurse':
        return [
          { name: 'Dashboard', href: '/nurse', icon: <Home className="h-5 w-5" /> },
          { name: 'Patients', href: '/nurse/patients', icon: <Users className="h-5 w-5" /> },
        ];
        case 'lab_technician':
          return [
            { name: 'Dashboard', href: '/lab_technician', icon: <Home className="h-5 w-5" /> },
            // { name: 'Patients', href: '/nurse/patients', icon: <Users className="h-5 w-5" /> },
          ];
      default:
        return [];
    }
  };
  
  const navLinks = getNavLinks();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Get page title from current path
  const getPageTitle = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length === 0) return 'Dashboard';
    
    // Get the last segment and format it
    let title = pathSegments[pathSegments.length - 1];
    
    // Replace hyphens with spaces and capitalize
    title = title.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return title;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for larger screens */}
      <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-white shadow-md z-10">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200">
          <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 bg-primary">
            <Activity className="h-8 w-8 text-white" />
            <span className="ml-2 text-xl font-semibold text-white">Smart Clinic</span>
          </div>
          
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navLinks.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${location.pathname === item.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="ml-3 mr-auto">
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <p className="text-xs font-medium text-gray-500 capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-2 text-gray-500 rounded-md hover:text-error hover:bg-gray-100"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile sidebar */}
      <div
        className={`
          md:hidden fixed inset-0 z-40 flex transition-opacity ease-linear duration-300
          ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        <div
          className={`
            fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300
            ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
          onClick={toggleSidebar}
        ></div>
        
        <div
          className={`
            relative flex-1 flex flex-col max-w-xs w-full bg-white transition ease-in-out duration-300 transform
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <Activity className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-semibold text-primary">Smart Clinic</span>
            </div>
            
            <nav className="mt-5 px-2 space-y-1">
              {navLinks.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-base font-medium rounded-md
                    ${location.pathname === item.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                  onClick={toggleSidebar}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="ml-3 mr-auto">
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <p className="text-xs font-medium text-gray-500 capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-2 text-gray-500 rounded-md hover:text-error hover:bg-gray-100"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 w-14">
          {/* Force sidebar to shrink to fit close icon */}
        </div>
      </div>
      
      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white shadow">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            onClick={toggleSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">{getPageTitle()}</h1>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;