// config/permissions.js
export const allPermissions = [
  "DASHBOARD",
  "WALLET MANAGEMENT",
  "KYC MANAGEMENT",
  "BUY HISTORY",
  "WITHDRAW MANAGEMENT",
  "USER INFO",
  "SETTING",
  "SUPPORT",
  "PAYMENT GATEWAYS",
  "AVAILABLE BALANCE",
  "SUPER BONUS",
  "GRADUAL BONUS",
  "WEALTH PLANS",
  "BUSINESS ANALYTICS",
  "TEAM REPORT",
  "BLOGS",
  "APP ANNOUNCEMENTS",
  "REPORTS",
  "NOTIFICATIONS",
  "MANUAL TRANSACTION",
  "FREEZED GROUPS",
  "MANUAL KYC",
  "NOT VERIFIED USERS",
  "ZOOM MEETING",
  "ICO MANAGEMENT",
  "LEGAL UPDATION",
  "DELETE ACCOUNTS",
];

export const formatPermissionName = (permission) => {
  return permission
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// Color Theme
export const colors = {
  primary: "#eb660f",
  primaryHover: "#d55a0d",
  bgDark: "#000000",
  bgCard: "#111111",
  bgInput: "#1a1a1a",
  bgHover: "#222222",
  textPrimary: "#ffffff",
  textMuted: "#888888",
  border: "#2a2a2a",
  success: "#28a745",
  danger: "#dc3545",
  info: "#17a2b8",
};