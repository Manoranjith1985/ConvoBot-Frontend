// src/components/DoctorComponents/ConsultationTimer.jsx
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const ConsultationTimer = ({ startTime, onStop, isRunning = true }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval;
    if (isRunning) {
      const start = new Date(startTime).getTime();
      interval = setInterval(() => {
        const now = Date.now();
        const seconds = Math.floor((now - start) / 1000);
        setElapsed(seconds);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (!isRunning && onStop) onStop(elapsed); // Call onStop when stopping
    };
  }, [isRunning, startTime, onStop]); // Re-run effect when isRunning changes

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 text-white font-medium">
      <Clock size={18} />
      <span>{formatTime(elapsed)}</span>
    </div>
  );
};

export default ConsultationTimer;