import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ScannerProviders } from './contexts/ScannerProviders.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ScannerProviders>
      <App />
    </ScannerProviders>
  </StrictMode>,
)
