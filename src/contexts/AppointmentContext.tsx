import React, { createContext, useContext, useState } from 'react';

interface AppointmentContextType {
  unseenCount: number;
  incrementUnseenCount: () => void;
  resetUnseenCount: () => void;
}

const AppointmentContext = createContext<AppointmentContextType>({
  unseenCount: 0,
  incrementUnseenCount: () => {},
  resetUnseenCount: () => {}
});

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unseenCount, setUnseenCount] = useState(0);

  const incrementUnseenCount = () => {
    setUnseenCount(prev => prev + 1);
  };

  const resetUnseenCount = () => {
    setUnseenCount(0);
  };

  return (
    <AppointmentContext.Provider value={{ unseenCount, incrementUnseenCount, resetUnseenCount }}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
}; 