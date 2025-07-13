// FILE 3: main.jsx
// This file is the entry point that tells the browser to load your App.js component.
// IMPORTANT: You will need to create a 'src' folder first, and then create this file inside it.
// Name the file main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.js'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```