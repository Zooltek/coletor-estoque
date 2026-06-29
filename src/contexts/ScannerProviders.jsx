import React from 'react';
import { ScannerStateProvider } from './ScannerStateContext';
import { ToolbarProvider } from './ToolbarContext';
import { SessionProvider } from './SessionContext';
import { FeedbackProvider } from './FeedbackContext';
import { HistoryProvider } from './HistoryContext';

export function ScannerProviders({ children }) {
  return (
    <ScannerStateProvider>
      <SessionProvider>
        <ToolbarProvider>
          <HistoryProvider>
            <FeedbackProvider>
              {children}
            </FeedbackProvider>
          </HistoryProvider>
        </ToolbarProvider>
      </SessionProvider>
    </ScannerStateProvider>
  );
}
