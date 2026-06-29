import React, { createContext, useState } from 'react';
import { useStableCallback } from '../hooks/performance/useStableCallback';

export const FeedbackContext = createContext();

export function FeedbackProvider({ children }) {
  const [feedback, setFeedback] = useState(null);

  const triggerFeedback = useStableCallback((type, message) => {
    setFeedback({ type, message, timestamp: Date.now() });
  });

  const value = {
    feedback,
    triggerFeedback
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
}
