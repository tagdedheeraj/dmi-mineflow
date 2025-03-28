
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './lib/firebase'; // Initialize Firebase

// Prevent any dynamic loading of Lovable scripts
window.addEventListener('load', () => {
  // Find and remove any dynamically added script tags related to Lovable
  const scripts = document.querySelectorAll('script');
  scripts.forEach(script => {
    if (script.src.includes('lovable') || script.src.includes('gpteng') || script.src.includes('gptengineer') || script.src.includes('edit-with-lovable')) {
      script.remove();
    }
  });
});

createRoot(document.getElementById("root")!).render(<App />);
