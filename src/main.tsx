import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

try {
  const rootElement = document.getElementById('root')
  if (!rootElement) throw new Error('Root element not found')
  
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} catch (error) {
  console.error('Failed to mount app:', error)
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML = `<div style="color: #d4af37; padding: 20px; text-align: center; font-size: 18px;">
      Erro ao carregar o jogo. Recarregue a página.
      <br/><br/>
      <small style="color: #999;">${error instanceof Error ? error.message : 'Unknown error'}</small>
    </div>`
  }
}
