import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from './components/ui/provider'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from './components/ui/toaster'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </Provider>
  </StrictMode>,
)
