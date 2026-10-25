import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Eu inicio o aplicativo.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
