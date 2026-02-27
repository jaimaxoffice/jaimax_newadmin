// src/features/support/SupportChart.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useToast } from "../../reusableComponents/Toasts/ToastContext";
import { useChatGetQuery, useCreateCommentMutation } from "./supportApiSlice";
import Loader from "../../reusableComponents/Loader/Loader";
import {
  ArrowLeft,
  Send,
  Paperclip,
  X,
  User,
  Mail,
  Tag,
  FileText,
  AlertCircle,
  Clock,
  Shield,
  Hash,
  MessageCircle,
  Sparkles,
  ChevronRight,
  Maximize2,
} from "lucide-react";

const SupportChart = () => {
  const toast = useToast();
  const { id } = useParams();
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  const { data, isLoading } = useChatGetQuery(id);
  const [createComment, { isLoading: isSending }] = useCreateCommentMutation();

  const [displayImage, setDisplayImage] = useState("");
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [clickedImage, setClickedImage] = useState("");
  const [state, setState] = useState({ comment: "", image: null });
  const [isFocused, setIsFocused] = useState(false);

  const chartData = data?.data;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chartData?.comments]);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const acceptedFormats = ["image/png", "image/jpeg", "image/jpg"];
      if (!acceptedFormats.includes(file.type)) {
        toast.warning("Only JPG / PNG files are allowed");
        return;
      }
      setDisplayImage(URL.createObjectURL(file));
      setState({ ...state, image: file });
    }
  };

  const sendComment = async () => {
    if (!state.comment.trim() && !state.image) {
      return toast.error("Please enter a message or attach an image");
    }

    const formData = new FormData();
    formData.append("comment", state.comment);
    if (state.image) formData.append("image", state.image);
    formData.append("ticket_id", id);

    try {
      await createComment(formData).unwrap();
      setState({ comment: "", image: null });
      setDisplayImage("");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to send message");
    }
  };

  const getPriorityConfig = (priority) => {
    const p = priority?.toLowerCase();
    if (p === "high" || p === "urgent")
      return {
        color: "text-rose-400",
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
        dot: "bg-rose-400",
      };
    if (p === "medium")
      return {
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        dot: "bg-amber-400",
      };
    return {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      dot: "bg-emerald-400",
    };
  };

  if (isLoading) return <Loader />;

  const priorityConfig = getPriorityConfig(chartData?.ticket?.priority);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1114] via-[#13161a] to-[#0f1114]">
      <div className="max-w-[1500px] mx-auto p-4 sm:p-6 lg:p-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/support"
            className="flex items-center gap-3 group"
          >
            <div className="p-2.5 rounded-2xl bg-[#1e2228] border border-[#2a2e35] group-hover:border-[#b9fd5c]/30 group-hover:bg-[#b9fd5c]/5 transition-all duration-300">
              <ArrowLeft
                size={18}
                className="text-[#6b7280] group-hover:text-[#b9fd5c] transition-colors"
              />
            </div>
            <div>
              <span className="text-sm font-semibold text-[#9ca3af] group-hover:text-white transition-colors">
                Back to Tickets
              </span>
              <div className="flex items-center gap-1 text-[10px] text-[#4b5563]">
                <span>Support</span>
                <ChevronRight size={10} />
                <span className="text-[#b9fd5c]">
                  #{id?.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#1e2228] border border-[#2a2e35]">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-[#b9fd5c]" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#b9fd5c] animate-ping opacity-75" />
              </div>
              <span className="text-[11px] font-bold text-[#b9fd5c] uppercase tracking-[0.15em]">
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Chat Section */}
          <div className="lg:col-span-8 flex flex-col h-[78vh] min-h-[600px] rounded-3xl overflow-hidden relative">
            {/* Glass background */}
            <div className="absolute inset-0 bg-[#181b20]/80 backdrop-blur-xl border border-[#252930] rounded-3xl" />

            {/* Chat Header */}
            <div className="relative z-10 px-6 py-4 border-b border-[#252930]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#b9fd5c] to-[#8bc34a] flex items-center justify-center shadow-lg shadow-[#b9fd5c]/10">
                      <User size={22} className="text-[#111214]" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#b9fd5c] border-2 border-[#181b20]" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base">
                      {chartData?.ticket?.author_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Hash size={11} className="text-[#4b5563]" />
                      <span className="text-[11px] text-[#6b7280] font-mono">
                        {id?.slice(-8).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1e2228] border border-[#2a2e35]">
                    <MessageCircle size={13} className="text-[#6b7280]" />
                    <span className="text-[11px] text-[#6b7280] font-semibold">
                      {chartData?.comments?.length || 0} messages
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="relative z-10 flex-1 overflow-y-auto px-6 py-6 space-y-5 scrollbar-thin scrollbar-thumb-[#2a2e35] scrollbar-track-transparent"
            >
              {chartData?.comments?.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-3xl bg-[#1e2228] border border-[#2a2e35] flex items-center justify-center mb-4">
                    <Sparkles size={28} className="text-[#b9fd5c]" />
                  </div>
                  <p className="text-[#6b7280] text-sm font-medium">
                    No messages yet
                  </p>
                  <p className="text-[#4b5563] text-xs mt-1">
                    Start the conversation below
                  </p>
                </div>
              )}

              {chartData?.comments?.map((item, i) => (
                <ChatBubble
                  key={i}
                  item={item}
                  isAdmin={item?.commented_by?.role === "0"}
                  onImageClick={(img) => {
                    setClickedImage(img);
                    setIsViewerOpen(true);
                  }}
                />
              ))}
            </div>

            {/* Input Area */}
            <div className="relative z-10 p-4 border-t border-[#252930]">
              {displayImage && (
                <div className="mb-3 px-2">
                  <div className="inline-flex items-start gap-3 p-2 rounded-2xl bg-[#1e2228] border border-[#2a2e35]">
                    <div className="relative">
                      <img
                        src={displayImage}
                        className="h-16 w-16 object-cover rounded-xl"
                        alt="preview"
                      />
                      <button
                        onClick={() => {
                          setDisplayImage("");
                          setState({ ...state, image: null });
                        }}
                        className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-lg hover:bg-rose-600 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </div>
                    <div className="pt-1">
                      <p className="text-xs text-[#9ca3af] font-medium">
                        Image attached
                      </p>
                      <p className="text-[10px] text-[#4b5563] mt-0.5">
                        Ready to send
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div
                className={`flex items-center gap-2 p-2 rounded-2xl border transition-all duration-300 ${
                  isFocused
                    ? "bg-[#1e2228] border-[#b9fd5c]/30 shadow-lg shadow-[#b9fd5c]/5"
                    : "bg-[#1a1d22] border-[#252930]"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <button
                  onClick={handleUploadClick}
                  className="p-2.5 rounded-xl text-[#6b7280] hover:text-[#b9fd5c] hover:bg-[#b9fd5c]/5 transition-all"
                >
                  <Paperclip size={20} />
                </button>

                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent border-none text-white text-sm focus:ring-0 focus:outline-none placeholder-[#4b5563] px-2"
                  value={state.comment}
                  onChange={(e) =>
                    setState({ ...state, comment: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && sendComment()}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />

                <button
                  onClick={sendComment}
                  disabled={isSending || (!state.comment.trim() && !state.image)}
                  className="p-2.5 bg-gradient-to-r from-[#b9fd5c] to-[#a3e635] text-[#111214] rounded-xl hover:shadow-lg hover:shadow-[#b9fd5c]/20 active:scale-95 transition-all duration-200 disabled:opacity-30 disabled:hover:shadow-none disabled:active:scale-100"
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-[#111214]/30 border-t-[#111214] rounded-full animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Info Sidebar */}
          <div className="lg:col-span-4 space-y-5">
            {/* Ticket Info Card */}
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-[#181b20]/80 backdrop-blur-xl border border-[#252930] rounded-3xl" />
              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white text-sm font-bold flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#b9fd5c]/10">
                      <FileText size={16} className="text-[#b9fd5c]" />
                    </div>
                    Ticket Details
                  </h3>
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${priorityConfig.bg} border ${priorityConfig.border}`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`}
                    />
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${priorityConfig.color}`}
                    >
                      {chartData?.ticket?.priority || "Normal"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <InfoRow
                    icon={<User size={14} />}
                    label="Customer"
                    value={chartData?.ticket?.author_name}
                    isCaps
                  />
                  <InfoRow
                    icon={<Mail size={14} />}
                    label="Email"
                    value={chartData?.ticket?.author_email}
                    truncate
                  />
                  <InfoRow
                    icon={<Tag size={14} />}
                    label="Subject"
                    value={chartData?.ticket?.title}
                  />
                  <InfoRow
                    icon={<AlertCircle size={14} />}
                    label="Priority"
                    value={chartData?.ticket?.priority}
                    priorityConfig={priorityConfig}
                  />
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-[#181b20]/80 backdrop-blur-xl border border-[#252930] rounded-3xl" />
              <div className="relative z-10 p-6">
                <h4 className="text-[11px] text-[#6b7280] font-bold uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                  <Shield size={12} />
                  Description
                </h4>
                <p className="text-[13px] text-[#9ca3af] leading-relaxed">
                  {chartData?.ticket?.content || "No description provided."}
                </p>
              </div>
            </div>

            {/* Attachment Card */}
            {chartData?.ticket?.image && (
              <div className="relative rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-[#181b20]/80 backdrop-blur-xl border border-[#252930] rounded-3xl" />
                <div className="relative z-10 p-6">
                  <h4 className="text-[11px] text-[#6b7280] font-bold uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                    <Paperclip size={12} />
                    Attachment
                  </h4>
                  <div
                    className="relative group cursor-pointer rounded-2xl overflow-hidden"
                    onClick={() => {
                      setClickedImage(chartData.ticket.image);
                      setIsViewerOpen(true);
                    }}
                  >
                    <img
                      src={chartData.ticket.image}
                      className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
                      alt="attachment"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Maximize2 size={16} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {isViewerOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setIsViewerOpen(false)}
        >
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
          <button className="absolute top-6 right-6 z-10 p-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all">
            <X size={24} />
          </button>
          <img
            src={clickedImage}
            className="relative z-10 max-h-[85vh] max-w-[90vw] rounded-2xl shadow-2xl shadow-black/50 object-contain"
            alt="Preview"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

// ─── Chat Bubble ───
const ChatBubble = ({ item, isAdmin, onImageClick }) => {
  const time = new Date(item.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex gap-3 max-w-[85%] sm:max-w-[72%] ${
          isAdmin ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black ${
              isAdmin
                ? "bg-gradient-to-br from-[#b9fd5c] to-[#8bc34a] text-[#111214]"
                : "bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white"
            }`}
          >
            {isAdmin ? "A" : "U"}
          </div>
        </div>

        {/* Content */}
        <div
          className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
        >
          <div className="flex items-center gap-2 mb-1.5 px-1">
            <span className="text-[11px] font-semibold text-[#6b7280]">
              {item.commented_by?.name}
            </span>
            {isAdmin && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#b9fd5c]/10 text-[#b9fd5c] uppercase tracking-wider">
                Admin
              </span>
            )}
          </div>

          <div
            className={`px-4 py-3 text-sm leading-relaxed ${
              isAdmin
                ? "bg-gradient-to-br from-[#b9fd5c] to-[#a3e635] text-[#111214] rounded-2xl rounded-tr-md font-medium shadow-lg shadow-[#b9fd5c]/10"
                : "bg-[#1e2228] text-[#e5e7eb] rounded-2xl rounded-tl-md border border-[#2a2e35]"
            }`}
          >
            {item.comment && <p>{item.comment}</p>}
            {item.image && (
              <img
                src={item.image}
                className={`${
                  item.comment ? "mt-3" : ""
                } rounded-xl max-h-56 w-full object-cover cursor-pointer hover:brightness-110 transition-all`}
                onClick={() => onImageClick(item.image)}
                alt="attachment"
              />
            )}
          </div>

          <span className="text-[10px] text-[#4b5563] mt-1.5 px-1 font-medium flex items-center gap-1">
            <Clock size={9} />
            {time}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Info Row ───
const InfoRow = ({ icon, label, value, isCaps, truncate, priorityConfig }) => (
  <div className="flex items-center justify-between py-2 group">
    <div className="flex items-center gap-2.5 text-[#6b7280] min-w-0">
      <span className="p-1.5 rounded-lg bg-[#1e2228] border border-[#252930] group-hover:border-[#b9fd5c]/20 group-hover:text-[#b9fd5c] transition-all flex-shrink-0">
        {icon}
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap">
        {label}
      </span>
    </div>
    {priorityConfig ? (
      <span
        className={`text-[11px] font-bold uppercase ${priorityConfig.color}`}
      >
        {value || "Normal"}
      </span>
    ) : (
      <span
        className={`text-sm text-[#d1d5db] font-medium ${
          isCaps ? "capitalize" : ""
        } ${truncate ? "truncate max-w-[160px]" : ""}`}
        title={value}
      >
        {value || "N/A"}
      </span>
    )}
  </div>
);

export default SupportChart;