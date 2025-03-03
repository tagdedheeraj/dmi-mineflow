
/**
 * Animation utilities for smooth UI interactions
 */

export const fadeIn = (element: HTMLElement, duration = 300) => {
  element.style.opacity = '0';
  element.style.display = 'block';

  let start: number | null = null;
  
  const animate = (timestamp: number) => {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    const opacity = Math.min(progress / duration, 1);
    
    element.style.opacity = opacity.toString();
    
    if (progress < duration) {
      window.requestAnimationFrame(animate);
    }
  };
  
  window.requestAnimationFrame(animate);
};

export const fadeOut = (element: HTMLElement, duration = 300) => {
  return new Promise<void>((resolve) => {
    let start: number | null = null;
    
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const opacity = 1 - Math.min(progress / duration, 1);
      
      element.style.opacity = opacity.toString();
      
      if (progress < duration) {
        window.requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
        resolve();
      }
    };
    
    window.requestAnimationFrame(animate);
  });
};

export const slideUp = (element: HTMLElement, duration = 400, distance = 20) => {
  element.style.opacity = '0';
  element.style.transform = `translateY(${distance}px)`;
  element.style.display = 'block';

  let start: number | null = null;
  
  const animate = (timestamp: number) => {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    const ratio = Math.min(progress / duration, 1);
    
    element.style.opacity = ratio.toString();
    element.style.transform = `translateY(${(1 - ratio) * distance}px)`;
    
    if (progress < duration) {
      window.requestAnimationFrame(animate);
    }
  };
  
  window.requestAnimationFrame(animate);
};

export const pulseElement = (element: HTMLElement) => {
  element.classList.add('animate-pulse-subtle');
  setTimeout(() => {
    element.classList.remove('animate-pulse-subtle');
  }, 2000);
};
