import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ChatPage, VisualizePage } from './pages'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="/visualize" element={<VisualizePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
