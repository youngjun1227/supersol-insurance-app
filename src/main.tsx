import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app/App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './styles/global.css'

const root = document.getElementById('root')
if (!root) throw new Error('#root 를 찾을 수 없어요.')

createRoot(root).render(
  <StrictMode>
    {/* 라우터 밖에 둔다 — 라우터 자체가 던져도 폴백이 뜬다 (#80) */}
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
