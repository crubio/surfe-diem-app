import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppProvider } from './providers/app'
// import './index.css'
import {MaintenanceCard} from '@features/ui/cards'
import Home from 'pages/home'

const isMaintenanceMode = false

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider >
      {isMaintenanceMode ? <MaintenanceCard /> : <Home />}
    </AppProvider>
  </React.StrictMode>,
)
