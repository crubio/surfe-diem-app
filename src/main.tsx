import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppProvider } from './providers/app'
import './index.css'

const tempApp = () => {
  return (
    <>
      <h1>surfe diem</h1>
      <div className="card">
        <p>
          coming soon
        </p>
      </div>
    </>
  )
  }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider >
      {tempApp()}
    </AppProvider>
  </React.StrictMode>,
)
