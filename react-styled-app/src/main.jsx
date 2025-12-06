import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// ThemeProvider와 GlobalStyle은 App.jsx로 이동했습니다.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
