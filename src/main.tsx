import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'lenis/dist/lenis.css'
import App from './App'
import './styles/global.css'

const savedThemeMode = localStorage.getItem('airsoft-theme')
document.documentElement.dataset.theme = savedThemeMode === 'light' ? 'light' : 'dark'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
