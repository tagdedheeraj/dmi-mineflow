
import React from 'react'
import ReactDOM from 'react-dom/client'
import './lovableBadgeControl.css' // Load this first to ensure badge hiding
import App from './App.tsx'
import './index.css'

// More robust badge control implementation
document.addEventListener('DOMContentLoaded', () => {
  // Force hide any badges
  document.documentElement.setAttribute('data-hide-lovable-badge', 'true');
  document.body.setAttribute('data-hide-lovable-badge', 'true');
  
  // Safely remove any existing badges
  const badges = document.querySelectorAll('[data-lovable-badge], [class*="lovable"], [id*="lovable"]');
  badges.forEach(badge => {
    try {
      // Check if the element is actually in the DOM before removing
      if (badge.parentNode) {
        badge.parentNode.removeChild(badge);
      }
    } catch (error) {
      console.log('Failed to remove badge element:', error);
    }
  });
  
  // Setup mutation observer with error handling
  try {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              try {
                const element = node as Element;
                if (
                  (element.hasAttribute && element.hasAttribute('data-lovable-badge')) || 
                  (element.className && typeof element.className === 'string' && element.className.includes('lovable')) ||
                  (element.id && element.id.includes('lovable'))
                ) {
                  // Only remove if element has a parent
                  if (element.parentNode) {
                    element.parentNode.removeChild(element);
                  }
                }
              } catch (error) {
                console.log('Error processing mutation node:', error);
              }
            }
          });
        }
      }
    });
    
    // Start observing with error catching
    observer.observe(document.body, { childList: true, subtree: true });
  } catch (error) {
    console.log('Failed to setup mutation observer:', error);
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
