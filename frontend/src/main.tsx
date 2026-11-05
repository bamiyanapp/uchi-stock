import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.jsx' // symlink

// 他コンポーネントと同じフォールバック先（dev-standards/docs/client-error-reporting-pattern.md）
const API_URL = import.meta.env.VITE_API_URL || "https://b974xlcqia.execute-api.ap-northeast-1.amazonaws.com/dev";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary reportUrl={`${API_URL}/report-client-error`}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
