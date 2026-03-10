export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export const getFileIcon = (fileName) => {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  const icons = {
    pdf: "📄", doc: "📝", docx: "📝",
    xls: "📊", xlsx: "📊",
    ppt: "📊", pptx: "📊",
    txt: "📃", zip: "🗜️", rar: "🗜️",
  };
  return icons[ext] || "📁";
};