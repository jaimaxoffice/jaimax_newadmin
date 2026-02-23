// src/features/support/SupportChart.jsx
import React, { useCallback, useEffect, useState, useRef } from "react";
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
  Image as ImageIcon,
  CheckCircle2
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

  const chartData = data?.data;

  // Scroll logic
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
      const response = await createComment(formData).unwrap();
      setState({ comment: "", image: null });
      setDisplayImage("");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to send message");
    }
  };

  if (isLoading) return <div className="p-10 text-center text-[#8a8d93]">Loading Conversation...</div>;

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6">
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          to="/support" 
          className="flex items-center gap-2 text-[#8a8d93] hover:text-[#b9fd5c] transition-colors group"
        >
          <div className="p-2 rounded-xl bg-[#282f35] group-hover:bg-[#b9fd5c]/10">
            <ArrowLeft size={20} />
          </div>
          <span className="font-semibold">Back to Tickets</span>
        </Link>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#b9fd5c]/10 border border-[#b9fd5c]/20">
          <div className="w-2 h-2 rounded-full bg-[#b9fd5c] animate-pulse" />
          <span className="text-[12px] font-bold text-[#b9fd5c] uppercase tracking-wider">Live Support</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Chat Section (Left/Center) */}
        <div className="lg:col-span-8 flex flex-col h-[750px] bg-[#282f35] rounded-3xl border border-[#2a2c2f] overflow-hidden shadow-2xl">
          {/* Inner Header */}
          <div className="px-6 py-4 border-b border-[#2a2c2f] bg-[#2d343b] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#b9fd5c] flex items-center justify-center text-[#111214]">
                <User size={20} />
              </div>
              <div>
                <h3 className="text-white font-bold leading-none">{chartData?.ticket?.author_name}</h3>
                <span className="text-[11px] text-[#8a8d93]">Ticket ID: #{id?.slice(-6).toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-[#3a3f44] scrollbar-track-transparent"
          >
            {chartData?.comments?.map((item, i) => (
              <ChatBubble 
                key={i} 
                item={item} 
                isAdmin={item?.commented_by?.role === "0"} 
                onImageClick={(img) => { setClickedImage(img); setIsViewerOpen(true); }}
              />
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-[#1c2126] border-t border-[#2a2c2f]">
            {displayImage && (
              <div className="relative inline-block mb-3 ml-2 group">
                <img src={displayImage} className="h-20 w-20 object-cover rounded-xl border-2 border-[#b9fd5c]" alt="preview" />
                <button 
                  onClick={() => { setDisplayImage(""); setState({...state, image: null}); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            
            <div className="flex items-center gap-3 bg-[#282f35] p-2 rounded-2xl border border-[#3a3f44] focus-within:border-[#b9fd5c]/50 transition-all">
              <input 
                type="file" 
                ref={fileInputRef} 
                hidden 
                accept="image/*" 
                onChange={handleFileChange} 
              />
              <button 
                onClick={handleUploadClick}
                className="p-3 text-[#8a8d93] hover:text-[#b9fd5c] transition-colors"
              >
                <Paperclip size={22} />
              </button>
              
              <input 
                type="text"
                placeholder="Write your message..."
                className="flex-1 bg-transparent border-none text-white focus:ring-0 placeholder-[#555]"
                value={state.comment}
                onChange={(e) => setState({...state, comment: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && sendComment()}
              />
              
              <button 
                onClick={sendComment}
                disabled={isSending}
                className="p-3 bg-[#b9fd5c] text-[#111214] rounded-xl hover:bg-[#a8e650] active:scale-95 transition-all disabled:opacity-50"
              >
                {isSending ? <Loader /> : <Send size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Info Sidebar (Right) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#282f35] border border-[#2a2c2f] rounded-3xl p-6 shadow-xl">
            <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2">
              <FileText size={20} className="text-[#b9fd5c]" />
              Ticket Information
            </h3>
            
            <div className="space-y-5">
              <InfoRow icon={<User size={16}/>} label="Customer" value={chartData?.ticket?.author_name} isCaps />
              <InfoRow icon={<Mail size={16}/>} label="Email Address" value={chartData?.ticket?.author_email} />
              <InfoRow icon={<Tag size={16}/>} label="Subject" value={chartData?.ticket?.title} />
              <InfoRow icon={<AlertCircle size={16}/>} label="Priority" value={chartData?.ticket?.priority} badge />
              
              <div className="pt-4 border-t border-[#3a3f44]">
                <label className="text-[11px] text-[#8a8d93] font-bold uppercase tracking-widest block mb-2">Description</label>
                <p className="text-sm text-gray-300 leading-relaxed bg-[#1c2126] p-4 rounded-xl border border-[#2a2c2f]">
                  {chartData?.ticket?.content}
                </p>
              </div>

              {chartData?.ticket?.image && (
                <div className="pt-4">
                   <label className="text-[11px] text-[#8a8d93] font-bold uppercase tracking-widest block mb-2">Attached Asset</label>
                   <img 
                    src={chartData.ticket.image} 
                    className="w-full h-48 object-cover rounded-2xl cursor-pointer hover:opacity-80 transition-opacity border border-[#3a3f44]" 
                    onClick={() => { setClickedImage(chartData.ticket.image); setIsViewerOpen(true); }}
                    alt="attachment"
                   />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reusable Image Viewer */}
      {isViewerOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsViewerOpen(false)}>
          <button className="absolute top-6 right-6 text-white hover:text-[#b9fd5c]"><X size={32}/></button>
          <img src={clickedImage} className="max-h-full max-w-full rounded-lg shadow-2xl" alt="Preview" />
        </div>
      )}
    </div>
  );
};

// ─── Internal Sub-Components ───

const ChatBubble = ({ item, isAdmin, onImageClick }) => (
  <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
    <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isAdmin ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-center gap-2 mb-1 px-1`}>
        {!isAdmin && <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">U</div>}
        <span className="text-[12px] font-bold text-gray-400">{item.commented_by?.name}</span>
        {isAdmin && <div className="w-6 h-6 rounded-full bg-[#b9fd5c]/20 text-[#b9fd5c] flex items-center justify-center text-[10px] font-bold">A</div>}
      </div>

      <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm leading-relaxed ${
        isAdmin 
          ? 'bg-[#b9fd5c] text-[#111214] rounded-tr-none font-medium' 
          : 'bg-[#3a3f44] text-white rounded-tl-none border border-[#4a4f55]'
      }`}>
        {item.comment}
        {item.image && (
          <img 
            src={item.image} 
            className="mt-3 rounded-lg max-h-60 w-full object-cover cursor-pointer hover:brightness-110 transition-all border border-black/10" 
            onClick={() => onImageClick(item.image)}
            alt="attachment"
          />
        )}
      </div>
      <span className="text-[10px] text-[#5c636a] mt-1 font-medium flex items-center gap-1">
        <Clock size={10} /> {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  </div>
);

const InfoRow = ({ icon, label, value, isCaps, badge }) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-3 text-[#8a8d93]">
      <span className="p-1.5 rounded-lg bg-[#1c2126] group-hover:text-[#b9fd5c] transition-colors">{icon}</span>
      <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
    </div>
    {badge ? (
      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
        value?.toLowerCase() === 'high' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'
      }`}>
        {value}
      </span>
    ) : (
      <span className={`text-sm text-white font-medium ${isCaps ? 'capitalize' : ''}`}>{value || "N/A"}</span>
    )}
  </div>
);



export default SupportChart;