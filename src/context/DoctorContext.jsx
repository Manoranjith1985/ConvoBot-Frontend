// src/context/DoctorContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const DoctorContext = createContext();

export const DoctorProvider = ({ children }) => {
  const [selectedDoctor, setSelectedDoctorState] = useState(() => {
    const saved = localStorage.getItem('selectedDoctor');
    return saved ? JSON.parse(saved) : null;
  });

  const setSelectedDoctor = (doctor) => {
    setSelectedDoctorState(doctor);
    localStorage.setItem('selectedDoctor', JSON.stringify(doctor));
  };

  const clearSelectedDoctor = () => {
    setSelectedDoctorState(null);
    localStorage.removeItem('selectedDoctor');
  };

  return (
    <DoctorContext.Provider value={{ 
      selectedDoctor, 
      setSelectedDoctor, 
      clearSelectedDoctor 
    }}>
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctor = () => {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error('useDoctor must be used within a DoctorProvider');
  }
  return context;
};