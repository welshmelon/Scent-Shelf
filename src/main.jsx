import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // The .js extension has been removed to let the build tool find the file.
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
