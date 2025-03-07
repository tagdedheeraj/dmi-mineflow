
// Date utility functions for rewards

// Convert to IST (UTC+5:30)
export const convertToIST = (date: Date) => {
  // IST is UTC+5:30
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  const istTime = new Date(utcTime + (5.5 * 60 * 60 * 1000));
  return istTime;
};

// Get today's date in YYYY-MM-DD format in IST
export const getTodayDateKey = () => {
  const today = convertToIST(new Date());
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};
