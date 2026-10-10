import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx';
import { ReadingListProvider } from './context/ReadingListContext.jsx';

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <ReadingListProvider>
      <App />
    </ReadingListProvider>
  </AuthProvider>
)
