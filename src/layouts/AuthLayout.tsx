import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/90 to-primary-dark flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center bg-white p-3 rounded-full shadow-md mb-6">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-white">Smart Clinic</h2>
          <p className="mt-2 text-white/80">Healthcare reimagined with AI</p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow-xl rounded-xl sm:px-10 animate-fade-in">
          <Outlet />
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-white/70">
            &copy; {new Date().getFullYear()} Smart Clinic. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;