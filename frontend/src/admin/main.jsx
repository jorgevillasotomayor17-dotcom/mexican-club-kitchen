import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import './admin.css'
import PanelAdmin from './PanelAdmin.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PanelAdmin />
  </StrictMode>,
)
