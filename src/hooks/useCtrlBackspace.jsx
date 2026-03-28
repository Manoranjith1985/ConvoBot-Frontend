// src/hooks/useCtrlBackspaceGoBack.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useCtrlBackspaceGoBack = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Backspace') {
        // Skip if user is typing in an input, textarea, or contenteditable field
        const active = document.activeElement;
        const isInputField =
          active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.tagName === 'SELECT' ||
          active.isContentEditable;

        if (!isInputField) {
          e.preventDefault();           // Prevent any browser default
          navigate(-1);                 // Go back one page in history
        }
      }
    };

    // Attach globally
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);
};

export default useCtrlBackspaceGoBack;