import { useState, useRef } from "react";
import { sanitizeMessage } from "../sanitize.js";
import { encryptMessage } from "../encryptmsg.js";
import { getFileIcon } from "../comunityUtils/fileHelpers.js";

const SECRET_KEY = import.meta.env.VITE_APP_CHATSECRETKEY?.trim();

/**
 * useFileUpload
 * Manages image, document and raw-file selection, preview, send and cancel.
 */
const useFileUpload = (socketRef, selectedGroup, currentUser, setMessages, replyToMessage, setReplyToMessage) => {
  // ---------- raw file (legacy single-file flow) ----------
  const [selectedFile, setSelectedFile]     = useState(null);
  const [filePreview, setFilePreview]       = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);

  // ---------- multi-image flow ----------
  const [selectedImages, setSelectedImages]     = useState([]);
  const [imageCaption, setImageCaption]         = useState("");
  const [showImagePreview, setShowImagePreview] = useState(false);

  // ---------- document flow ----------
  const [selectedDocument, setSelectedDocument]     = useState(null);
  const [documentCaption, setDocumentCaption]       = useState("");
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // ── helpers ────────────────────────────────────────────────────────────────
  const buildReplyPayload = () =>
    replyToMessage
      ? {
          msgId: replyToMessage.msgId || replyToMessage.id,
          message: replyToMessage.msgBody?.message,
          senderName: replyToMessage.publisherName || replyToMessage.senderName,
          senderId: replyToMessage.fromUserId,
        }
      : null;

  // ── image select ───────────────────────────────────────────────────────────
  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const valid = files.filter(
      (f) => f.type.startsWith("image/") && f.size <= 50 * 1024 * 1024
    );
    if (!valid.length) return;

    const imageObjects = valid.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      name: f.name,
      size: f.size,
    }));

    setSelectedImages(imageObjects);
    setShowImagePreview(true);
    setImageCaption("");
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const cancelImageUpload = () => {
    selectedImages.forEach((img) => URL.revokeObjectURL(img.preview));
    setSelectedImages([]);
    setShowImagePreview(false);
    setImageCaption("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendImageMessage = async () => {
    if (!selectedImages.length || !selectedGroup || !currentUser.id) return;
    const timestamp = Date.now();

    for (let i = 0; i < selectedImages.length; i++) {
      const imageObj = selectedImages[i];
      const tempId = `temp_img_${timestamp}_${i}_${Math.random().toString(36).substr(2, 9)}`;
      const correlationId = `${currentUser.id}_img_${timestamp}_${i}_${Math.random().toString(36).substr(2, 9)}`;
      const sanitizedCaption = imageCaption.trim() ? sanitizeMessage(imageCaption.trim()) : "";

      const messageData = {
        rowId: tempId, msgId: tempId, correlationId,
        chatId: selectedGroup.chatId, chatType: "groupChat",
        messageType: "image",
        senderId: currentUser.id, fromUserId: currentUser.id,
        publisherName: currentUser.name, senderName: currentUser.name,
        receiverId: "",
        msgBody: {
          message: sanitizedCaption, originalText: sanitizedCaption,
          message_type: "image",
          media: {
            fileName: imageObj.name, file_type: imageObj.file.type,
            file_size: imageObj.size, file_url: imageObj.preview,
            tempPreview: imageObj.preview, file_key: "", duration: "",
            caption: sanitizedCaption, thumb_image: imageObj.preview,
            local_path: "", is_uploading: true, is_downloaded: false,
            isLargeFile: imageObj.size > 25 * 1024 * 1024,
          },
          UserName: currentUser.name,
        },
        msgStatus: "pending", timestamp, createdAt: new Date(),
        deleteStatus: 0, status: "pending",
        metaData: { isSent: false, sentAt: null, isDelivered: false, deliveredAt: null, isRead: false, readAt: null },
        replyTo: buildReplyPayload(),
      };

      setMessages((prev) => [...prev, messageData]);

      try {
        const buffer = await imageObj.file.arrayBuffer();
        if (socketRef.current?.connected) {
          socketRef.current.emit("send_file", {
            fileBuffer: buffer, fileName: imageObj.name,
            fileType: imageObj.file.type, caption: sanitizedCaption, messageData,
          });
        } else throw new Error("Socket not connected");
      } catch (error) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.msgId === tempId
              ? { ...msg, status: "failed", msgStatus: "failed",
                  msgBody: { ...msg.msgBody, media: { ...msg.msgBody.media, is_uploading: false } },
                  error: error.message }
              : msg
          )
        );
      }
    }

    cancelImageUpload();
    setReplyToMessage(null);
  };

  // ── document select ────────────────────────────────────────────────────────
  const handleDocumentSelect = (event) => {
    const file = event.target.files[0];
    if (!file || file.size > 100 * 1024 * 1024) return;

    const allowedTypes = [
      "application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain", "application/zip", "application/x-rar-compressed",
    ];
    const validExt = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar)$/i.test(file.name);
    if (!allowedTypes.includes(file.type) && !validExt) return;

    setSelectedDocument({ file, name: file.name, size: file.size, type: file.type, icon: getFileIcon(file.name) });
    setShowDocumentPreview(true);
    setDocumentCaption("");
  };

  const cancelDocumentUpload = () => {
    setSelectedDocument(null);
    setShowDocumentPreview(false);
    setDocumentCaption("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendDocumentMessage = async () => {
    if (!selectedDocument || !selectedGroup || !currentUser.id) return;
    const tempId = `temp_doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const correlationId = `${currentUser.id}_doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sanitizedCaption = documentCaption.trim() ? sanitizeMessage(documentCaption.trim()) : "";

    const messageData = {
      rowId: tempId, msgId: tempId, _id: tempId, correlationId,
      chatId: selectedGroup.chatId, chatType: "groupChat", messageType: "document",
      senderId: currentUser.id, fromUserId: currentUser.id,
      publisherName: currentUser.name, senderName: currentUser.name, receiverId: "",
      msgBody: {
        message: selectedDocument.name, originalText: selectedDocument.name,
        message_type: "document",
        media: {
          fileName: selectedDocument.name, file_type: selectedDocument.type,
          file_size: selectedDocument.size, file_url: "", file_key: "",
          duration: "", caption: sanitizedCaption, thumb_image: "",
          local_path: "", is_uploading: true, is_downloaded: false,
          isLargeFile: selectedDocument.size > 25 * 1024 * 1024,
          fileIcon: selectedDocument.icon,
        },
        UserName: currentUser.name,
      },
      msgStatus: "pending", timestamp: Date.now(), createdAt: new Date(),
      deleteStatus: 0, status: "pending",
      metaData: { isSent: false, sentAt: null, isDelivered: false, deliveredAt: null, isRead: false, readAt: null },
      replyTo: buildReplyPayload(),
    };

    setMessages((prev) => [...prev, messageData]);
    cancelDocumentUpload();

    try {
      const buffer = await selectedDocument.file.arrayBuffer();
      if (socketRef.current?.connected) {
        socketRef.current.emit("send_file", {
          fileBuffer: buffer, fileName: selectedDocument.name,
          fileType: selectedDocument.type, caption: sanitizedCaption, messageData,
        });
      } else throw new Error("Socket not connected");
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.msgId === tempId
            ? { ...msg, status: "failed", msgStatus: "failed",
                msgBody: { ...msg.msgBody, media: { ...msg.msgBody.media, is_uploading: false } },
                error: error.message }
            : msg
        )
      );
    }

    setReplyToMessage(null);
  };

  // ── legacy single-file flow ────────────────────────────────────────────────
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file || file.size > 10 * 1024 * 1024) return;
    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => { setFilePreview(e.target.result); setShowFilePreview(true); };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
      setShowFilePreview(true);
    }
  };

  const cancelFileUpload = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setShowFilePreview(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendFileMessage = async () => {
    if (!selectedFile || !selectedGroup || !currentUser.id) return;
    const tempId = `temp_file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const correlationId = `${currentUser.id}_file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sanitizedFileName = sanitizeMessage(selectedFile.name.trim());
    if (!sanitizedFileName) return;

    const encryptedMessage = await encryptMessage(sanitizedFileName, SECRET_KEY);

    const messageData = {
      rowId: tempId, msgId: tempId, _id: tempId, correlationId,
      chatId: selectedGroup.chatId, chatType: "groupChat", messageType: "file",
      senderId: currentUser.id, fromUserId: currentUser.id,
      publisherName: currentUser.name, senderName: currentUser.name, receiverId: "",
      msgBody: {
        message: encryptedMessage, originalText: sanitizedFileName, message_type: "file",
        media: {
          fileName: encryptedMessage, file_type: selectedFile.type, file_size: selectedFile.size,
          file_url: "", file_key: "", duration: "", caption: "",
          thumb_image: filePreview || "", local_path: "",
          is_uploading: true, is_downloaded: false,
          isLargeFile: selectedFile.size > 25 * 1024 * 1024,
        },
        UserName: currentUser.name,
      },
      msgStatus: "pending", timestamp: Date.now(), createdAt: new Date(),
      deleteStatus: 0, status: "pending",
      metaData: { isSent: false, sentAt: null, isDelivered: false, deliveredAt: null, isRead: false, readAt: null },
      replyTo: buildReplyPayload(),
    };

    setMessages((prev) => [...prev, messageData]);
    cancelFileUpload();

    try {
      const buffer = await selectedFile.arrayBuffer();
      if (socketRef.current?.connected) {
        socketRef.current.emit("send_file", { fileBuffer: buffer, fileName: sanitizedFileName, fileType: selectedFile.type, messageData });
      } else throw new Error("Socket not connected");
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.msgId === tempId
            ? { ...msg, status: "failed", msgStatus: "failed",
                msgBody: { ...msg.msgBody, media: { ...msg.msgBody.media, is_uploading: false } },
                error: error.message }
            : msg
        )
      );
    }
  };

  return {
    // raw file
    selectedFile, setSelectedFile, filePreview, setFilePreview,
    showFilePreview, setShowFilePreview, handleFileSelect, cancelFileUpload, sendFileMessage,
    // images
    selectedImages, setSelectedImages, imageCaption, setImageCaption,
    showImagePreview, setShowImagePreview,
    handleImageSelect, removeImage, cancelImageUpload, sendImageMessage,
    // documents
    selectedDocument, setSelectedDocument, documentCaption, setDocumentCaption,
    showDocumentPreview, setShowDocumentPreview,
    handleDocumentSelect, cancelDocumentUpload, sendDocumentMessage,
    // shared
    uploadProgress, setUploadProgress, fileInputRef,
  };
};

export default useFileUpload;