import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppProvider } from './providers/app'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider children={undefined} >
    </AppProvider>
  </React.StrictMode>,
)
