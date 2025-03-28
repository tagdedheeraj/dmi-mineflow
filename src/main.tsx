
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './lib/firebase'; // Initialize Firebase

// Aggressive cleanup of Lovable scripts
const removeLovableElements = () => {
  // Remove any scripts
  const scripts = document.querySelectorAll('script');
  scripts.forEach(script => {
    if (script.src.includes('lovable') || 
        script.src.includes('gpteng') || 
        script.src.includes('gptengineer') || 
        script.src.includes('edit-with')) {
      script.remove();
    }
  });

  // Remove any DOM elements related to Lovable
  const elements = document.querySelectorAll('div, button, a, iframe');
  elements.forEach(element => {
    if ((element.id && (element.id.includes('lovable') || element.id.includes('gpteng') || element.id.includes('edit-with'))) || 
        (element.className && (element.className.includes('lovable') || element.className.includes('gpteng') || element.className.includes('edit-with'))) || 
        (element.innerHTML && (element.innerHTML.includes('lovable') || element.innerHTML.includes('gpteng') || element.innerHTML.includes('edit-with')))) {
      element.remove();
    }
  });

  // Also remove any style elements that might be related
  const styles = document.querySelectorAll('style');
  styles.forEach(style => {
    if (style.innerHTML.includes('lovable') || style.innerHTML.includes('gpteng') || style.innerHTML.includes('edit-with')) {
      style.remove();
    }
  });
};

// Run on load and periodically to catch any dynamically added elements
window.addEventListener('load', removeLovableElements);
// Run cleanup every 2 seconds to catch dynamic elements
setInterval(removeLovableElements, 2000);

// Prevent any external scripts from adding Lovable elements
const originalCreateElement = document.createElement;
document.createElement = function(tagName) {
  const element = originalCreateElement.call(document, tagName);
  if (tagName.toLowerCase() === 'script') {
    Object.defineProperty(element, 'src', {
      set: function(value) {
        if (value && (value.includes('lovable') || value.includes('gpteng') || value.includes('edit-with'))) {
          return; // Block the setting of src for Lovable scripts
        }
        this.setAttribute('src', value);
      },
      get: function() {
        return this.getAttribute('src');
      }
    });
  }
  return element;
};

createRoot(document.getElementById("root")!).render(<App />);
