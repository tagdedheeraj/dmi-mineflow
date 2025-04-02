
import React from 'react'
import ReactDOM from 'react-dom/client'
import './lovableBadgeControl.css' // Load this first to ensure badge hiding
import App from './App.tsx'
import './index.css'

// More robust badge control implementation without causing DOM errors
document.addEventListener('DOMContentLoaded', () => {
  // Force hide any badges
  document.documentElement.setAttribute('data-hide-lovable-badge', 'true');
  document.body.setAttribute('data-hide-lovable-badge', 'true');
  
  // Safely remove only existing badges that are actually in the DOM
  const removeBadges = () => {
    try {
      const badges = document.querySelectorAll('[data-lovable-badge], [class*="lovable"], [id*="lovable"]');
      badges.forEach(badge => {
        if (badge.parentNode && badge.parentElement) {
          badge.parentNode.removeChild(badge);
        }
      });
    } catch (error) {
      console.log('Badge removal handled gracefully:', error);
    }
  };
  
  // Initial removal
  removeBadges();
  
  // Setup mutation observer with improved error handling
  try {
    const observer = new MutationObserver((mutations) => {
      let needsRemoval = false;
      
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) { // Element node
              try {
                const element = node as Element;
                if (
                  (element.hasAttribute && element.hasAttribute('data-lovable-badge')) || 
                  (element.className && typeof element.className === 'string' && element.className.includes('lovable')) ||
                  (element.id && element.id.includes('lovable'))
                ) {
                  needsRemoval = true;
                  break;
                }
              } catch (error) {
                // Silently handle errors in node processing
              }
            }
          }
        }
      }
      
      // Only attempt removal if badges were actually found
      if (needsRemoval) {
        removeBadges();
      }
    });
    
    // Start observing with error catching
    observer.observe(document.body, { childList: true, subtree: true });
  } catch (error) {
    console.log('Observer setup handled gracefully:', error);
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
