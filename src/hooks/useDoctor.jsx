// src/hooks/useDoctor.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const DEFAULT_DOCTOR = {
  name: "Dr. Test OP Doctor",
  avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
  role: "Outpatient Doctor",
  specialty: "General Medicine"
};

export const useDoctor = () => {
  const [doctor, setDoctor] = useState(DEFAULT_DOCTOR);
  const [profiles, setProfiles] = useState([DEFAULT_DOCTOR]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // Correct endpoint you added in op.py
        const res = await apiClient.get('/op/doctors/profile-list');
        
        const fetchedDoctors = res.data?.data || [];

        if (fetchedDoctors.length > 0) {
          const normalized = fetchedDoctors.map(doc => ({
            _id: doc._id,
            name: doc.name,
            avatar: doc.avatar,
            role: doc.role || "Outpatient Doctor",
            specialty: doc.specialty || "General Medicine",
            active: doc.active !== false
          })).filter(doc => doc.active);

          setProfiles(normalized);

          const saved = localStorage.getItem('currentDoctor');
          let activeDoctor = normalized[0];

          if (saved) {
            const parsed = JSON.parse(saved);
            const match = normalized.find(d => d.name === parsed.name);
            if (match) activeDoctor = match;
          }

          setDoctor(activeDoctor);
          localStorage.setItem('currentDoctor', JSON.stringify(activeDoctor));
        }
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
        setProfiles([DEFAULT_DOCTOR]);
        setDoctor(DEFAULT_DOCTOR);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);   // Intentional: run once on mount

  const switchProfile = (selectedProfile) => {
    localStorage.setItem('currentDoctor', JSON.stringify(selectedProfile));
    setDoctor(selectedProfile);
    window.location.reload(); // Reliable for full state reset across all pages
  };

  return { 
    doctor, 
    profiles, 
    switchProfile, 
    loading 
  };
};