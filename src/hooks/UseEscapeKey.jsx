// src/hooks/useEscapeKey.js
import { useEffect } from 'react';

const useEscapeKey = (onEscape) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onEscape();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup when component unmounts
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape]);
};

export default useEscapeKey;