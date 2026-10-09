import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./styles/index.css";
import "./styles/navbar.css";
import "./styles/auth.css";
import "./styles/problems.css";

import "./styles/submissions.css";
import "./styles/profile.css";
import "./styles/theme.css";
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
