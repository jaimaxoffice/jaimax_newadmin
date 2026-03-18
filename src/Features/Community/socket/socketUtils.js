import { decryptMessage } from "./encryptmsg.js";
import DOMPurify from "dompurify";

// ─── Shared pure helpers ───────────────────────────────────────────────────

export const decodeHtmlEntities = (str) => {
  if (typeof str !== "string") return str;
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
};

export const safeDecrypt = async (field, secretKey) => {
  if (field && typeof field === "object" && field.cipherText) {
    try {
      return decodeHtmlEntities(await decryptMessage(field, secretKey));
    } catch {
      return "[Decryption failed]";
    }
  }
  const raw = typeof field === "string" ? field : String(field ?? "");
  return decodeHtmlEntities(raw);
};

export const decryptMessages = async (msgs, secretKey) => {
  if (!Array.isArray(msgs)) return [];

  return Promise.all(
    msgs.map(async (msg) => ({
      ...msg,
      _id: msg?._id || msg?.msgId,
      msgId: msg?.msgId || msg?._id?.toString(),
      msgBody: {
        ...msg?.msgBody,
        message: await safeDecrypt(msg?.msgBody?.message, secretKey),
      },
    })),
  );
};

export const filterDeleted = (msgs, currentUserId) =>
  msgs.filter((msg) => {
    if (!Array.isArray(msg.deletedFor)) return true;
    return !msg.deletedFor.some(
      (id) => id?.toString() === currentUserId?.toString(),
    );
  });

export const isRateLimitError = (error = "") =>
  /rate limit|too many|slow down|wait|limit exceeded|per minute|per second/i.test(
    error,
  );

export const sanitizeMessage = (message) => {
  // console.log(message, "message")
  return DOMPurify.sanitize(message, {
    // ALLOWED_TAGS: [],
    // ALLOWED_ATTR: [],
    // FORBID_TAGS: ["script", "style", "iframe", "object", "embed"],
    // FORBID_ATTR: ["onerror", "onclick", "onload", "onmouseover", "style"],
    // KEEP_CONTENT: true,
    // RETURN_TRUSTED_TYPE: false,
  }).trim();
};

export const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
  const today = new Date().toDateString(); // "Mon Mar 09 2026"
  const yesterday = new Date(Date.now() - 86400000).toDateString(); // "Sun Mar 08 2026"

  if (dateKey === today) return "Today";
  if (dateKey === yesterday) return "Yesterday";

  // Format older dates nicely
  const date = new Date(dateKey);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
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

export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export const ALLOWED_DOC_EXTENSIONS =
  /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar)$/i;

// ─── Pure helpers ─────────────────────────────────────────────────────────────
export const makeId = (prefix = "temp") =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
