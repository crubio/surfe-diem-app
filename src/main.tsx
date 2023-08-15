import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppProvider } from './providers/app'
import {
  RouterProvider,
} from "react-router-dom";
import { router } from 'routes'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider >
      <RouterProvider router={router} />
    </AppProvider>
  </React.StrictMode>,
)
