export const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const formatDateHeader = (dateKey) => {
  const today = new Date().toDateString();         // "Mon Mar 09 2026"
  const yesterday = new Date(Date.now() - 86400000).toDateString(); // "Sun Mar 08 2026"

  if (dateKey === today) return "Today";
  if (dateKey === yesterday) return "Yesterday";

  // Format older dates nicely
  const date = new Date(dateKey);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

export const groupMessagesByDate = (messages) => {
  const grouped = {};
  messages.forEach((msg) => {
    const date = new Date(msg.timestamp);
    const dateKey = date.toDateString();
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(msg);
  });
  return grouped;
};