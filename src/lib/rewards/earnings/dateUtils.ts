
// Date utility functions specific to earnings

/**
 * Gets today's date in YYYY-MM-DD format based on IST timezone
 */
export const getTodayDateKey = (): string => {
  // Create a date object for current UTC time
  const now = new Date();
  
  // Convert to IST (UTC+5:30)
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istTime = new Date(utcTime + (5.5 * 60 * 60 * 1000));
  
  // Format to YYYY-MM-DD
  return istTime.toISOString().split('T')[0];
};

/**
 * Converts a date to IST timezone
 */
export const convertToIST = (date: Date): Date => {
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utcTime + (5.5 * 60 * 60 * 1000));
};

/**
 * Gets the time string in IST timezone (e.g., "12:01 AM")
 */
export const getISTTimeString = (date: Date): string => {
  const istDate = convertToIST(date);
  return istDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};
