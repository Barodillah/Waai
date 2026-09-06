export const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
};

export const formatTime = (timeString) => {
  if (!timeString) return '';
  // If it's already in HH:mm format, just return it
  if (/^\d{2}:\d{2}$/.test(timeString)) return timeString;
  
  try {
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return timeString; // Return as-is if invalid
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  } catch (e) {
    return timeString;
  }
};

export const formatDateSeparator = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Hari ini';
  } else if (diffDays === 1) {
    return 'Kemarin';
  } else if (diffDays > 1 && diffDays < 7) {
    // Return day name (e.g., Senin, Selasa)
    return targetDate.toLocaleDateString('id-ID', { weekday: 'long' });
  } else {
    // Return date formatted as dd/MM/yyyy
    return targetDate.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
};
