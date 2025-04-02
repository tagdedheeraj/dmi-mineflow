
import React from 'react'
import ReactDOM from 'react-dom/client'
import './lovableBadgeControl.css' // Load this first to ensure badge hiding
import App from './App.tsx'
import './index.css'

// More robust badge control implementation with defensive checks
document.addEventListener('DOMContentLoaded', () => {
  // Force hide any badges
  document.documentElement.setAttribute('data-hide-lovable-badge', 'true');
  document.body.setAttribute('data-hide-lovable-badge', 'true');
  
  // Safely remove badges with proper parent node checks
  const removeBadgeIfExists = (element: Element) => {
    try {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    } catch (error) {
      console.log('Failed to remove badge element:', error);
    }
  };
  
  // Only target elements outside the application root
  const badges = document.querySelectorAll('body > [data-lovable-badge], body > [class*="lovable"], body > [id*="lovable"]');
  badges.forEach(removeBadgeIfExists);
  
  // Setup mutation observer with error handling and defensive approach
  try {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              try {
                const element = node as Element;
                // Only check elements added directly to body, not within the React app
                if (element.parentNode === document.body && (
                  element.hasAttribute('data-lovable-badge') || 
                  (element instanceof HTMLElement && element.className && typeof element.className === 'string' && element.className.includes('lovable')) ||
                  (element instanceof HTMLElement && element.id && element.id.includes('lovable'))
                )) {
                  removeBadgeIfExists(element);
                }
              } catch (error) {
                console.log('Error processing mutation node:', error);
              }
            }
          });
        }
      });
    });
    
    // Only observe the body element for direct children
    observer.observe(document.body, { childList: true, subtree: false });
  } catch (error) {
    console.log('Failed to setup mutation observer:', error);
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
