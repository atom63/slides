import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@atom63/slides/theme-defaults'
import '@atom63/slides/styles'
import { App } from './app'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
