export const formatDateWithAmPm = (isoString) => {
  const date = new Date(isoString);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  let hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const amAndPm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;
  return `${day}-${month}-${year} ${hours}:${minutes} ${amAndPm}`;
};
export const formatCurrency = (amount, currency) => {
  const symbol = currency === "INR" ? "₹" : "$";
  return `${symbol}${Number(amount).toFixed(2)}`;
};
// src/features/team/teamHelpers.js
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
};

export const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatAmount = (amount) => {
  if (!amount && amount !== 0) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getTotalInvestment = (investments) => {
  if (!investments || investments.length === 0) return 0;
  return investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
};

export const convertToApiDateFormat = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${year}-${month}-${day}`;
};

export const sortMembers = (members, sortBy, sortOrder) => {
  if (!members) return [];
  return [...members].sort((a, b) => {
    let valA, valB;
    switch (sortBy) {
      case "investment":
        valA = getTotalInvestment(a.investments);
        valB = getTotalInvestment(b.investments);
        break;
      case "date":
        valA = new Date(a.registeredDate || 0).getTime();
        valB = new Date(b.registeredDate || 0).getTime();
        break;
      default:
        valA = (a.name || "").toLowerCase();
        valB = (b.name || "").toLowerCase();
    }
    return sortOrder === "asc" ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });
};