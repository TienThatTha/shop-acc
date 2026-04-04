import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // <-- Dòng này chính là dây điện gọi bộ sơn màu!
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)