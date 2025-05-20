import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  const userRole = user.role.toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
  
  if (!normalizedAllowedRoles.includes(userRole)) {
    console.log('Access denied. User role:', userRole, 'Allowed roles:', normalizedAllowedRoles);
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;