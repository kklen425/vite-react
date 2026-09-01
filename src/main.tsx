import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'

registerSW({ immediate: true })

const isBusRoute = /^\/(bus|california-garden-bus)(\/|$)/.test(window.location.pathname)
document.documentElement.dataset.app = isBusRoute ? 'bus' : 'fitness'
const RoutedApp = isBusRoute
  ? lazy(() => import('./bus/BusApp.tsx'))
  : lazy(() => import('./App.tsx'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <RoutedApp />
    </Suspense>
  </StrictMode>,
)
