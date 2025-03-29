
import React from 'react'
import ReactDOM from 'react-dom/client'
import './lovableBadgeControl.css' // Load this first to ensure badge hiding
import App from './App.tsx'
import './index.css'

// Additional runtime check for the lovable badge
document.addEventListener('DOMContentLoaded', () => {
  // Force hide any badges
  document.documentElement.setAttribute('data-hide-lovable-badge', 'true');
  document.body.setAttribute('data-hide-lovable-badge', 'true');
  
  // Remove any existing badges
  const badges = document.querySelectorAll('[data-lovable-badge], [class*="lovable"], [id*="lovable"]');
  badges.forEach(badge => badge.remove());
  
  // Setup mutation observer to catch any dynamically added badges
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const element = node as Element;
            if (
              element.hasAttribute('data-lovable-badge') || 
              element.className.includes('lovable') ||
              element.id.includes('lovable')
            ) {
              element.remove();
            }
          }
        });
      }
    }
  });
  
  // Start observing
  observer.observe(document.body, { childList: true, subtree: true });
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
