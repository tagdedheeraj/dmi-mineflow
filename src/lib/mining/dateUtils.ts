
// Convert a date to IST (Indian Standard Time)
export const convertToIST = (date: Date): Date => {
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  const istTime = new Date(utcTime + (5.5 * 60 * 60 * 1000));
  return istTime;
};

// Get IST date string in YYYY-MM-DD format
export const getISTDateString = (date: Date): string => {
  const istDate = convertToIST(date);
  return istDate.toISOString().split('T')[0];
};

// Get formatted IST time string (e.g., "12:01 AM")
export const getISTTimeString = (date: Date): string => {
  const istDate = convertToIST(date);
  return istDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Calculate time until midnight IST
export const getTimeUntilMidnightIST = (): number => {
  const now = new Date();
  const istNow = convertToIST(now);
  
  const tomorrow = new Date(istNow);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 1, 0, 0); // Set to 12:01 AM
  
  const tomorrowLocal = new Date(
    tomorrow.getTime() - (5.5 * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60000)
  );
  
  return tomorrowLocal.getTime() - now.getTime();
};
