// src/hooks/useCtrlBackspaceGoBack.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const useCtrlBackspaceGoBack = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only trigger on Ctrl + Backspace (or Cmd + Backspace on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Backspace') {
        
        // Skip if user is typing in input fields
        const active = document.activeElement;
        const isInputField = 
          active.tagName === 'INPUT' || 
          active.tagName === 'TEXTAREA' || 
          active.tagName === 'SELECT' || 
          active.isContentEditable;

        if (isInputField) return;

        // Prevent default browser behavior
        e.preventDefault();

        // Avoid going back from root / auth / selection pages
        const blockedPaths = ['/', '/select-role', '/doctor-select'];
        if (blockedPaths.includes(location.pathname)) {
          return;
        }

        // Go back one step in history
        navigate(-1);
      }
    };

    // Attach listener globally
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, location.pathname]);   // Re-attach if route changes

  return null; // This is a side-effect only hook
};

export default useCtrlBackspaceGoBack;