// import React from "react";
// import EmojiPicker from "emoji-picker-react";
// import { safeReplyText } from "./MessageText";
// import {
//   Image,
//   FileText,
//   Music,
//   Video,
//   File,
//   Sheet,
//   Presentation,
//   Archive,
//   Send,
//   Paperclip,
//   Smile,
//   X,
//   AlertTriangle,
// } from "lucide-react";

// const MediaIcon = ({ media }) => {
//   const fileName = media?.fileName || "";
//   const fileType = media?.file_type || "";

//   if (
//     fileType.startsWith("image/") ||
//     /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName)
//   )
//     return (
//       <>
//         <Image className="w-3 h-3 inline mr-1" /> Photo
//       </>
//     );
//   if (fileType.includes("pdf") || /\.pdf$/i.test(fileName))
//     return (
//       <>
//         <FileText className="w-3 h-3 inline mr-1" /> PDF
//       </>
//     );
//   if (fileType.includes("audio") || /\.(mp3|wav|ogg|m4a)$/i.test(fileName))
//     return (
//       <>
//         <Music className="w-3 h-3 inline mr-1" /> Audio
//       </>
//     );
//   if (fileType.includes("video") || /\.(mp4|mov|avi|webm)$/i.test(fileName))
//     return (
//       <>
//         <Video className="w-3 h-3 inline mr-1" /> Video
//       </>
//     );
//   if (fileType.includes("word") || /\.(doc|docx)$/i.test(fileName))
//     return (
//       <>
//         <FileText className="w-3 h-3 inline mr-1" /> Document
//       </>
//     );
//   if (fileType.includes("sheet") || /\.(xls|xlsx)$/i.test(fileName))
//     return (
//       <>
//         <Sheet className="w-3 h-3 inline mr-1" /> Spreadsheet
//       </>
//     );
//   if (fileType.includes("presentation") || /\.(ppt|pptx)$/i.test(fileName))
//     return (
//       <>
//         <Presentation className="w-3 h-3 inline mr-1" /> Presentation
//       </>
//     );
//   if (/\.(zip|rar)$/i.test(fileName))
//     return (
//       <>
//         <Archive className="w-3 h-3 inline mr-1" /> Archive
//       </>
//     );
//   return (
//     <>
//       <File className="w-3 h-3 inline mr-1" /> File
//     </>
//   );
// };
// const MessageInput = ({
//   message,
//   setMessage,
//   onSendMessage,
//   isInputDisabled,
//   setIsInputDisabled,
//   countdown,
//   replyToMessage,
//   cancelReply,
//   groupKey,
//   handleTyping,
//   showEmojiPicker,
//   setShowEmojiPicker,
//   setShowFileTypeModal,
//   inputRef,
//   emojiPickerRef,
//   emojiButtonRef,
//   emojiClickInsideRef,
//   rateLimitError,
// }) => {
//   // ── FIX: emoji click adds emoji but does NOT close the picker ─────────────
//   const handleEmojiClick = (emojiObject) => {
//     setMessage((prev) => prev + emojiObject.emoji);
//     setTimeout(() => inputRef.current?.focus(), 0);
//   };

//   return (
//     <div className="bg-[#202c33] border-t border-[#3b4a54] z-20 flex-shrink-0">
//       {/* Reply preview — flush above input, WhatsApp style */}
//       {replyToMessage && (
//         <div className="flex items-center gap-2 px-3 pt-2 pb-0">
//           <div className="flex-1 min-w-0 flex items-stretch bg-[#1a2530] rounded-lg overflow-hidden">
//             <div className="w-1 flex-shrink-0 bg-[#00a884]" />
//             <div className="flex-1 min-w-0 px-2 py-1.5">
//               <p className="text-xs font-semibold text-[#00a884] truncate leading-tight">
//                 {replyToMessage.fromUserId || "User"}
//               </p>
//               <p className="text-xs text-gray-400 truncate leading-tight mt-0.5 flex items-center">
//                 {replyToMessage.msgBody?.media?.file_url ? (
//                   <MediaIcon media={replyToMessage.msgBody.media} />
//                 ) : typeof replyToMessage.msgBody?.message === "string" ? (
//                   replyToMessage.msgBody.message.slice(0, 100)
//                 ) : (
//                   safeReplyText(replyToMessage.msgBody?.message, groupKey)
//                 )}
//               </p>
//             </div>
//             {replyToMessage.msgBody?.media?.file_url &&
//               replyToMessage.msgBody?.media?.file_type?.startsWith(
//                 "image/",
//               ) && (
//                 <img
//                   src={replyToMessage.msgBody.media.file_url}
//                   alt=""
//                   className="w-10 h-10 object-cover flex-shrink-0"
//                 />
//               )}
//           </div>
//           <button
//             onClick={cancelReply}
//             className="flex-shrink-0 p-1.5 hover:bg-white/10 rounded-full transition-colors"
//             aria-label="Cancel reply"
//           >
//             <X className="w-4 h-4 text-gray-400" />
//           </button>
//         </div>
//       )}
//       {/* Input row wrapper */}
//       <div className="p-2 sm:p-3">
//         {isInputDisabled && (
//           <div className="mb-2 rounded-xl px-4 py-2.5 flex items-center gap-3 border border-teal-500/30 bg-[#000000]">
//             <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#000000] border border-teal-500/30 flex items-center justify-center">
//               <AlertTriangle className="w-3.5 h-3.5 text-white" />
//             </div>
//             <div className="flex-1">
//               <p className="text-xs font-medium text-gray-200 tracking-wide">
//                 {rateLimitError || "Message rate limit exceeded"}
//               </p>
//               <p className="text-[10px] text-gray-500 mt-0.5">
//                 Input will re-enable automatically
//               </p>
//             </div>
//             <div className="flex items-center gap-1.5 bg-black/50 border border-teal-500/30 rounded-lg px-3 py-1.5">
//               <span
//                 className="text-sm font-bold font-mono tracking-widest"
//                 style={{ color: "#b9fd5c", textShadow: "0 0 8px #14b8a6" }}
//               >
//                 0:{countdown.toString().padStart(2, "0")}
//               </span>
//             </div>
//           </div>
//         )}

//         <div
//           className="flex items-center gap-1 sm:gap-2 relative"
//           style={{ minWidth: 0 }}
//         >
//           {/* Emoji button */}
//           <button
//             ref={emojiButtonRef}
//             onPointerDown={(e) => {
//               e.stopPropagation();
//               setShowEmojiPicker((p) => !p);
//             }}
//             disabled={isInputDisabled}
//             className={`p-2 transition-colors flex-shrink-0 ${isInputDisabled ? "text-gray-600 cursor-not-allowed opacity-50" : "text-gray-400 hover:text-white"}`}
//           >
//             <Smile className="w-5 h-5" />
//           </button>

//           {/* Emoji picker */}
//           {showEmojiPicker && !isInputDisabled && (
//             <div
//               ref={emojiPickerRef}
//               className="absolute bottom-14 left-0 z-50"
//               onPointerDown={() => {
//                 if (emojiClickInsideRef) emojiClickInsideRef.current = true;
//               }}
//             >
//               <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
//             </div>
//           )}

//           {/* Attachment button */}
//           <button
//             onClick={() => setShowFileTypeModal(true)}
//             disabled={isInputDisabled}
//             className={`p-2 transition-colors flex-shrink-0 ${isInputDisabled ? "text-gray-600 cursor-not-allowed opacity-50" : "text-gray-400 hover:text-white"}`}
//           >
//             <Paperclip className="w-5 h-5" />
//           </button>

//           {/* Text input */}
//           <input
//             ref={inputRef}
//             type="text"
//             value={message}
//             onChange={(e) => {
//               setMessage(e.target.value);
//               handleTyping?.();
//             }}
//             onKeyDown={(e) => {
//               if (e.key === "Enter" && !e.shiftKey) {
//                 e.preventDefault();
//                 if (isInputDisabled) {
//                   const el = document.createElement("div");
//                   el.className =
//                     "fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] font-semibold";
//                   el.textContent =
//                     rateLimitError ||
//                     "Please wait! You are sending messages too quickly.";
//                   document.body.appendChild(el);
//                   setTimeout(() => el.remove(), 3000);
//                   return;
//                 }
//                 if (message?.trim()) onSendMessage?.();
//               }
//             }}
//             disabled={isInputDisabled}
//             placeholder="Type a message"
//             className={`flex-1 min-w-0 w-0 px-3 sm:px-4 py-2 sm:py-3 bg-[#2a3942] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#085358] placeholder-gray-400 text-sm sm:text-base transition-opacity ${isInputDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
//           />

//           {/* Send button */}
//           {message?.trim() && (
//             <button
//               onPointerDown={(e) => {
//                 e.preventDefault();
//                 if (!isInputDisabled && message?.trim()) onSendMessage?.();
//               }}
//               disabled={isInputDisabled}
//               className={`flex-shrink-0 p-2 sm:p-3 rounded-full transition-colors ${isInputDisabled ? "bg-gray-600 opacity-50 cursor-not-allowed" : "bg-[#b9fd5c]"}`}
//             >
//               <Send className="w-5 h-5 text-black" />
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MessageInput;
import React, { useState, useRef, useCallback, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import { safeReplyText } from "./MessageText";
import {
  Image,
  FileText,
  Music,
  Video,
  File,
  Sheet,
  Presentation,
  Archive,
  Send,
  Paperclip,
  Smile,
  X,
  AlertTriangle,
  Camera,
  SwitchCamera,
  FlashlightOff,
  Flashlight,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  XCircle,
  ImagePlus,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
//  Media Icon Helper
// ═══════════════════════════════════════════════════════════
const MediaIcon = ({ media }) => {
  const fileName = media?.fileName || "";
  const fileType = media?.file_type || "";

  if (
    fileType.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName)
  )
    return (
      <>
        <Image className="w-3 h-3 inline mr-1" /> Photo
      </>
    );
  if (fileType.includes("pdf") || /\.pdf$/i.test(fileName))
    return (
      <>
        <FileText className="w-3 h-3 inline mr-1" /> PDF
      </>
    );
  if (fileType.includes("audio") || /\.(mp3|wav|ogg|m4a)$/i.test(fileName))
    return (
      <>
        <Music className="w-3 h-3 inline mr-1" /> Audio
      </>
    );
  if (fileType.includes("video") || /\.(mp4|mov|avi|webm)$/i.test(fileName))
    return (
      <>
        <Video className="w-3 h-3 inline mr-1" /> Video
      </>
    );
  if (fileType.includes("word") || /\.(doc|docx)$/i.test(fileName))
    return (
      <>
        <FileText className="w-3 h-3 inline mr-1" /> Document
      </>
    );
  if (fileType.includes("sheet") || /\.(xls|xlsx)$/i.test(fileName))
    return (
      <>
        <Sheet className="w-3 h-3 inline mr-1" /> Spreadsheet
      </>
    );
  if (fileType.includes("presentation") || /\.(ppt|pptx)$/i.test(fileName))
    return (
      <>
        <Presentation className="w-3 h-3 inline mr-1" /> Presentation
      </>
    );
  if (/\.(zip|rar)$/i.test(fileName))
    return (
      <>
        <Archive className="w-3 h-3 inline mr-1" /> Archive
      </>
    );
  return (
    <>
      <File className="w-3 h-3 inline mr-1" /> File
    </>
  );
};

// ═══════════════════════════════════════════════════════════
//  Live Camera Component
// ═══════════════════════════════════════════════════════════
const LiveCamera = ({ onCapture, onClose, isMobile }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [facingMode, setFacingMode] = useState("environment");
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [flashSupported, setFlashSupported] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [cameraError, setCameraError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [maxZoom, setMaxZoom] = useState(1);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [countdown, setCountdown] = useState(null);

  // Check for multiple cameras
  useEffect(() => {
    navigator.mediaDevices
      ?.enumerateDevices()
      .then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        setHasMultipleCameras(videoDevices.length > 1);
      })
      .catch(() => {});
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setCameraError(null);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = track.getCapabilities?.();

        if (capabilities?.torch) {
          setFlashSupported(true);
        } else {
          setFlashSupported(false);
          setFlashEnabled(false);
        }

        if (capabilities?.zoom) {
          setMaxZoom(capabilities.zoom.max || 1);
          setZoomLevel(capabilities.zoom.min || 1);
        } else {
          setMaxZoom(1);
        }
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Camera error:", err);

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera permission denied. Please allow camera access in your browser settings.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("No camera found on this device.");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setCameraError("Camera is already in use by another application.");
      } else if (err.name === "OverconstrainedError") {
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          streamRef.current = fallbackStream;
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            await videoRef.current.play();
          }
          setIsLoading(false);
          return;
        } catch {
          setCameraError("Unable to access camera.");
        }
      } else {
        setCameraError("Unable to access camera. Please check permissions.");
      }

      setIsLoading(false);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [startCamera]);

  const toggleFlash = useCallback(async () => {
    if (!streamRef.current || !flashSupported) return;

    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    const newFlashState = !flashEnabled;

    try {
      await track.applyConstraints({
        advanced: [{ torch: newFlashState }],
      });
      setFlashEnabled(newFlashState);
    } catch (err) {
      console.warn("Flash toggle failed:", err);
    }
  }, [flashEnabled, flashSupported]);

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }, []);

  const handleZoom = useCallback(
    async (direction) => {
      if (!streamRef.current || maxZoom <= 1) return;

      const track = streamRef.current.getVideoTracks()[0];
      if (!track) return;

      const step = (maxZoom - 1) / 10;
      const newZoom =
        direction === "in"
          ? Math.min(zoomLevel + step, maxZoom)
          : Math.max(zoomLevel - step, 1);

      try {
        await track.applyConstraints({
          advanced: [{ zoom: newZoom }],
        });
        setZoomLevel(newZoom);
      } catch (err) {
        console.warn("Zoom failed:", err);
      }
    },
    [zoomLevel, maxZoom]
  );

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(dataUrl);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  }, [facingMode]);

  const startTimerCapture = useCallback(
    (seconds) => {
      setCountdown(seconds);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            capturePhoto();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [capturePhoto]
  );

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setCaption("");
    startCamera();
  }, [startCamera]);

  const sendPhoto = useCallback(() => {
    if (!capturedImage) return;

    const byteString = atob(capturedImage.split(",")[1]);
    const mimeType = capturedImage.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([ab], { type: mimeType });
    const fileName = `camera_${Date.now()}.jpg`;
    const file = new window.File([blob], fileName, { type: mimeType });

    onCapture({
      file,
      preview: capturedImage,
      caption: caption.trim(),
      fileName,
      fileType: mimeType,
      fileSize: blob.size,
    });
  }, [capturedImage, caption, onCapture]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        if (capturedImage) {
          retakePhoto();
        } else {
          onClose();
        }
      }
      if (e.key === " " && !capturedImage && !cameraError) {
        e.preventDefault();
        capturePhoto();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [capturedImage, cameraError, capturePhoto, retakePhoto, onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <canvas ref={canvasRef} className="hidden" />

      {capturedImage ? (
        <div className="flex-1 flex flex-col">
          {/* Top bar - Preview mode */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-black/80 backdrop-blur-sm safe-top">
            <button
              onClick={retakePhoto}
              className="flex items-center gap-2 text-white text-sm hover:text-[#00a884] transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="hidden sm:inline">Retake</span>
            </button>
            <span className="text-white text-sm font-medium">Preview</span>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Image preview */}
          <div className="flex-1 flex items-center justify-center bg-black p-2 sm:p-4 overflow-hidden">
            <img
              src={capturedImage}
              alt="Captured"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Bottom bar with caption + send */}
          <div className="bg-[#202c33] border-t border-[#3b4a54] px-3 sm:px-4 py-3 safe-bottom">
            <div className="flex items-center gap-2 sm:gap-3 max-w-2xl mx-auto">
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendPhoto();
                  }
                }}
                placeholder="Add a caption..."
                className="flex-1 min-w-0 bg-[#2a3942] text-white rounded-lg px-3 sm:px-4 py-2.5 text-sm outline-none border border-[#374751] focus:border-[#00a884] transition-colors placeholder-gray-500"
                autoFocus
              />
              <button
                onClick={sendPhoto}
                className="flex-shrink-0 p-2.5 sm:p-3 rounded-full bg-[#00a884] hover:bg-[#06cf9c] transition-colors active:scale-95 shadow-lg"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Top controls - Camera mode */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 sm:px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent safe-top">
            <button
              onClick={onClose}
              className="p-2.5 text-white hover:text-gray-300 transition-colors rounded-full hover:bg-white/10 backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-1">
              {flashSupported && (
                <button
                  onClick={toggleFlash}
                  className={`p-2.5 rounded-full transition-all backdrop-blur-sm ${
                    flashEnabled
                      ? "bg-yellow-500/30 text-yellow-400 shadow-lg shadow-yellow-500/20"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  {flashEnabled ? (
                    <Flashlight className="w-5 h-5" />
                  ) : (
                    <FlashlightOff className="w-5 h-5" />
                  )}
                </button>
              )}

              <button
                onClick={() => startTimerCapture(3)}
                className="p-2.5 rounded-full text-white hover:bg-white/10 transition-colors backdrop-blur-sm text-xs font-bold min-w-[40px]"
                title="3 second timer"
              >
                3s
              </button>
            </div>
          </div>

          {/* Video feed */}
          <div className="flex-1 relative overflow-hidden bg-black">
            {isLoading && !cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/60 backdrop-blur-sm">
                <div className="w-12 h-12 border-4 border-gray-600 border-t-[#00a884] rounded-full animate-spin" />
                <p className="text-gray-300 text-sm mt-4 font-medium">
                  Starting camera…
                </p>
              </div>
            )}

            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6 bg-black/80 backdrop-blur-sm">
                <div className="w-20 h-20 rounded-full bg-[#202c33] flex items-center justify-center mb-5 border border-[#3b4a54]">
                  <XCircle className="w-10 h-10 text-red-400" />
                </div>
                <p className="text-white text-center text-base mb-2 font-semibold">
                  Camera Error
                </p>
                <p className="text-gray-400 text-center text-sm leading-relaxed max-w-xs mb-6">
                  {cameraError}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={startCamera}
                    className="px-5 py-2.5 bg-[#00a884] text-white text-sm font-medium rounded-lg hover:bg-[#06cf9c] transition-colors active:scale-95"
                  >
                    Retry
                  </button>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 bg-[#2a3942] text-gray-300 text-sm font-medium rounded-lg hover:bg-[#374751] transition-colors active:scale-95"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                facingMode === "user" ? "scale-x-[-1]" : ""
              }`}
            />

            {/* Countdown overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/50 backdrop-blur-sm">
                <div className="relative">
                  <span className="text-white text-8xl sm:text-9xl font-bold drop-shadow-2xl">
                    {countdown}
                  </span>
                  <div className="absolute inset-0 animate-ping text-white text-8xl sm:text-9xl font-bold opacity-20">
                    {countdown}
                  </div>
                </div>
              </div>
            )}

            {/* Zoom indicator */}
            {maxZoom > 1 && zoomLevel > 1 && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
                <span className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">
                  {zoomLevel.toFixed(1)}x
                </span>
              </div>
            )}

            {/* Focus frame */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 sm:w-64 sm:h-64 border-2 border-white/30 rounded-2xl" />
            </div>
          </div>

          {/* Bottom controls */}
          <div className="bg-gradient-to-t from-black via-black/80 to-transparent px-4 py-5 sm:py-6 safe-bottom">
            <div className="flex items-center justify-center gap-6 sm:gap-8 max-w-md mx-auto">
              {/* Left button - Zoom out or empty */}
              <div className="w-12 h-12 flex items-center justify-center">
                {maxZoom > 1 ? (
                  <button
                    onClick={() => handleZoom("out")}
                    disabled={zoomLevel <= 1}
                    className="p-3 text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                ) : hasMultipleCameras ? null : (
                  <div />
                )}
              </div>

              {/* Capture button */}
              <button
                onClick={capturePhoto}
                disabled={isLoading || !!cameraError}
                className="relative w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-full border-4 border-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed group active:scale-90 shadow-xl"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white group-hover:bg-gray-100 group-active:bg-gray-200 transition-colors shadow-inner" />
              </button>

              {/* Right button - Zoom in or switch camera */}
              <div className="w-12 h-12 flex items-center justify-center">
                {hasMultipleCameras ? (
                  <button
                    onClick={switchCamera}
                    className="p-3 text-white hover:bg-white/10 rounded-full transition-colors active:scale-90"
                  >
                    <SwitchCamera className="w-5 h-5" />
                  </button>
                ) : maxZoom > 1 ? (
                  <button
                    onClick={() => handleZoom("in")}
                    disabled={zoomLevel >= maxZoom}
                    className="p-3 text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                ) : (
                  <div />
                )}
              </div>
            </div>

            {/* Switch camera below if both zoom and switch available */}
            {hasMultipleCameras && maxZoom > 1 && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={switchCamera}
                  className="flex items-center gap-2 text-white/80 text-xs hover:text-white hover:bg-white/10 rounded-full px-4 py-2 transition-colors"
                >
                  <SwitchCamera className="w-4 h-4" />
                  <span>Switch Camera</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @supports (padding: env(safe-area-inset-top)) {
          .safe-top {
            padding-top: env(safe-area-inset-top);
          }
        }
        @supports (padding: env(safe-area-inset-bottom)) {
          .safe-bottom {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
//  MESSAGE INPUT COMPONENT
// ═══════════════════════════════════════════════════════════
const MessageInput = ({
  message,
  setMessage,
  onSendMessage,
  isInputDisabled,
  setIsInputDisabled,
  countdown,
  replyToMessage,
  cancelReply,
  groupKey,
  handleTyping,
  showEmojiPicker,
  setShowEmojiPicker,
  setShowFileTypeModal,
  inputRef,
  emojiPickerRef,
  emojiButtonRef,
  emojiClickInsideRef,
  rateLimitError,
  isMobile = false,
  // Optional - for sending camera photos
  onCameraCapture,
  onCameraImageReady,
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  const handleEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Handle camera capture
  const handleCameraCapture = useCallback(
    (captureData) => {
      setShowCamera(false);

      // If parent provides a handler, use it
      if (onCameraCapture) {
        onCameraCapture(captureData);
        return;
      }

      // If parent provides image ready handler, use it
      if (onCameraImageReady) {
        onCameraImageReady(captureData);
        return;
      }

      // Default: store captured photo for preview
      // Parent can handle this through onCameraImageReady prop
      setCapturedPhoto(captureData);

      // Auto-clear after showing (parent should handle sending)
      console.log("Camera captured:", captureData);

      // If you want to auto-trigger file modal or something similar:
      // You could emit an event or call a callback here
    },
    [onCameraCapture, onCameraImageReady]
  );

  // Clear captured photo
  const clearCapturedPhoto = useCallback(() => {
    setCapturedPhoto(null);
  }, []);

  return (
    <>
      {/* Camera Modal */}
      {showCamera && (
        <LiveCamera
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
          isMobile={isMobile}
        />
      )}

      {/* Captured Photo Preview (if no parent handler) */}
      {capturedPhoto && !onCameraCapture && !onCameraImageReady && (
        <div className="fixed inset-0 z-[90] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#202c33] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#3b4a54]">
              <h3 className="text-white font-medium">Photo Ready</h3>
              <button
                onClick={clearCapturedPhoto}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={capturedPhoto.preview}
                alt="Captured"
                className="w-full rounded-lg"
              />
              {capturedPhoto.caption && (
                <p className="text-gray-300 text-sm mt-2">
                  {capturedPhoto.caption}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-2">
                {(capturedPhoto.fileSize / 1024).toFixed(1)} KB •{" "}
                {capturedPhoto.fileName}
              </p>
            </div>
            <div className="flex gap-3 px-4 pb-4">
              <button
                onClick={clearCapturedPhoto}
                className="flex-1 py-2.5 bg-[#2a3942] text-gray-300 rounded-lg hover:bg-[#374751] transition-colors text-sm font-medium"
              >
                Discard
              </button>
              <button
                onClick={() => {
                  // Here you would typically send the file
                  console.log("Send photo:", capturedPhoto);
                  clearCapturedPhoto();
                }}
                className="flex-1 py-2.5 bg-[#00a884] text-white rounded-lg hover:bg-[#06cf9c] transition-colors text-sm font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#202c33] border-t border-[#3b4a54] z-20 flex-shrink-0">
        {/* Reply preview */}
        {replyToMessage && (
          <div className="flex items-center gap-2 px-2 sm:px-3 pt-2 pb-0">
            <div className="flex-1 min-w-0 flex items-stretch bg-[#1a2530] rounded-lg overflow-hidden">
              <div className="w-1 flex-shrink-0 bg-[#00a884]" />
              <div className="flex-1 min-w-0 px-2 py-1.5">
                <p className="text-[11px] sm:text-xs font-semibold text-[#00a884] truncate leading-tight">
                  {replyToMessage.fromUserId || "User"}
                </p>
                <p className="text-[11px] sm:text-xs text-gray-400 truncate leading-tight mt-0.5 flex items-center">
                  {replyToMessage.msgBody?.media?.file_url ? (
                    <MediaIcon media={replyToMessage.msgBody.media} />
                  ) : typeof replyToMessage.msgBody?.message === "string" ? (
                    replyToMessage.msgBody.message.slice(0, 100)
                  ) : (
                    safeReplyText(replyToMessage.msgBody?.message, groupKey)
                  )}
                </p>
              </div>
              {replyToMessage.msgBody?.media?.file_url &&
                replyToMessage.msgBody?.media?.file_type?.startsWith("image/") && (
                  <img
                    src={replyToMessage.msgBody.media.file_url}
                    alt=""
                    className="w-10 h-10 object-cover flex-shrink-0"
                  />
                )}
            </div>
            <button
              onClick={cancelReply}
              className="flex-shrink-0 p-1.5 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Cancel reply"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        )}

        {/* Input row wrapper */}
        <div className="p-1.5 sm:p-2 md:p-3">
          {/* Rate limit warning */}
          {isInputDisabled && (
            <div className="mb-2 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 sm:gap-3 border border-red-500/30 bg-red-950/30">
              <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] sm:text-xs font-medium text-red-300 tracking-wide truncate">
                  {rateLimitError || "Message rate limit exceeded"}
                </p>
                <p className="text-[9px] sm:text-[10px] text-red-400/70 mt-0.5">
                  Please wait before sending more messages
                </p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5">
                <span className="text-xs sm:text-sm font-bold font-mono tracking-widest text-red-400">
                  0:{countdown?.toString().padStart(2, "0") || "00"}
                </span>
              </div>
            </div>
          )}

          {/* Main input row */}
          <div className="flex items-center gap-0.5 sm:gap-1 relative" style={{ minWidth: 0 }}>
            {/* Emoji button */}
            <button
              ref={emojiButtonRef}
              onPointerDown={(e) => {
                e.stopPropagation();
                setShowEmojiPicker((p) => !p);
              }}
              disabled={isInputDisabled}
              className={`p-1.5 sm:p-2 transition-colors flex-shrink-0 rounded-full ${
                isInputDisabled
                  ? "text-gray-600 cursor-not-allowed opacity-50"
                  : "text-gray-400 hover:text-white hover:bg-white/5 active:bg-white/10"
              }`}
              title="Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Emoji picker */}
            {showEmojiPicker && !isInputDisabled && (
              <div
                ref={emojiPickerRef}
                className={`absolute z-50 ${
                  isMobile ? "bottom-14 left-0 right-0 mx-2" : "bottom-14 left-0"
                }`}
                onPointerDown={() => {
                  if (emojiClickInsideRef) emojiClickInsideRef.current = true;
                }}
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme="dark"
                  width={isMobile ? "100%" : 350}
                  height={isMobile ? 320 : 400}
                  searchPlaceHolder="Search emoji..."
                  skinTonesDisabled={isMobile}
                  previewConfig={{ showPreview: !isMobile }}
                />
              </div>
            )}

            {/* Attachment button */}
            <button
              onClick={() => setShowFileTypeModal(true)}
              disabled={isInputDisabled}
              className={`p-1.5 sm:p-2 transition-colors flex-shrink-0 rounded-full ${
                isInputDisabled
                  ? "text-gray-600 cursor-not-allowed opacity-50"
                  : "text-gray-400 hover:text-white hover:bg-white/5 active:bg-white/10"
              }`}
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Camera button */}
            <button
              onClick={() => setShowCamera(true)}
              disabled={isInputDisabled}
              className={`p-1.5 sm:p-2 transition-colors flex-shrink-0 rounded-full ${
                isInputDisabled
                  ? "text-gray-600 cursor-not-allowed opacity-50"
                  : "text-gray-400 hover:text-white hover:bg-white/5 active:bg-white/10"
              }`}
              title="Take photo"
            >
              <Camera className="w-5 h-5" />
            </button>

            {/* Text input */}
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping?.();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (isInputDisabled) {
                    const el = document.createElement("div");
                    el.className =
                      "fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] font-semibold text-sm";
                    el.textContent =
                      rateLimitError || "Please wait! You are sending messages too quickly.";
                    document.body.appendChild(el);
                    setTimeout(() => el.remove(), 3000);
                    return;
                  }
                  if (message?.trim()) onSendMessage?.();
                }
              }}
              disabled={isInputDisabled}
              placeholder="Type a message"
              className={`flex-1 min-w-0 w-0 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#2a3942] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a884]/50 placeholder-gray-500 text-sm transition-all ${
                isInputDisabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />

            {/* Send button */}
            {message?.trim() && (
              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  if (!isInputDisabled && message?.trim()) onSendMessage?.();
                }}
                disabled={isInputDisabled}
                className={`flex-shrink-0 p-2 sm:p-2.5 rounded-full transition-all active:scale-90 ${
                  isInputDisabled
                    ? "bg-gray-600 opacity-50 cursor-not-allowed"
                    : "bg-[#00a884] hover:bg-[#06cf9c] shadow-lg shadow-[#00a884]/20"
                }`}
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageInput;