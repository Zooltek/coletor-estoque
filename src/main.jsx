import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ScannerProvider } from './contexts/ScannerContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ScannerProvider>
      <App />
    </ScannerProvider>
  </StrictMode>,
)
