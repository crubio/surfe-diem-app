import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppProvider } from './providers/app'
import './index.css'
import {MaintenanceCard} from '@features/ui/cards'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider >
      <MaintenanceCard />
    </AppProvider>
  </React.StrictMode>,
)
