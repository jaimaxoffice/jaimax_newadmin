// import React from "react";
// import { X, Check, CheckCheck } from "lucide-react";

// const MessageInfoPanel = ({ data, loading, members, onClose, formatTime }) => {
//   return (
//     <div className="flex-1 flex flex-col bg-[#111b21] overflow-hidden">
//       {/* Header */}
//       <div className="flex items-center gap-3 px-4 py-3 bg-[#202c33] border-b border-[#2a3942]">
//         <button
//           onClick={onClose}
//           className="p-1 hover:bg-[#2a3942] rounded-full"
//         >
//           <X className="w-5 h-5 text-gray-400" />
//         </button>
//         <h3 className="text-white font-medium">Message info</h3>
//       </div>

//       <div className="flex-1 overflow-y-auto sidebar-scroll">
//         {loading ? (
//           <div className="flex items-center justify-center h-40">
//             <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2a3942] border-t-[#00a884]" />
//           </div>
//         ) : data ? (
//           <div className="p-4 space-y-6">
//             {/* Message preview */}
//             <div className="bg-[#005c4b] rounded-lg p-3 max-w-[80%] ml-auto">
//               <p className="text-sm text-gray-100">
//                 {data.msgBody?.message || "Media message"}
//               </p>
//               <p className="text-[10px] text-gray-300 text-right mt-1">
//                 {formatTime(data.timestamp)}
//               </p>
//             </div>

//             {/* Read by */}
//             <div>
//               <div className="flex items-center gap-2 mb-3">
//                 <CheckCheck className="w-5 h-5 text-[#53bdeb]" />
//                 <h4 className="text-[#53bdeb] font-medium text-sm">
//                   Read by
//                 </h4>
//               </div>
//               {data.metaData?.readBy?.length > 0 ? (
//                 <div className="space-y-2">
//                   {data.metaData.readBy.map((r, i) => {
//                     const member = members?.find(
//                       (m) => m.userId?.toString() === r.userId
//                     );
//                     return (
//                       <div
//                         key={i}
//                         className="flex items-center justify-between py-2 px-3 bg-[#202c33] rounded-lg"
//                       >
//                         <div className="flex items-center gap-3">
//                           <div className="w-8 h-8 rounded-full bg-[#2a3942] flex items-center justify-center text-sm text-gray-300">
//                             {(
//                               member?.name ||
//                               r.userId ||
//                               "?"
//                             )[0]?.toUpperCase()}
//                           </div>
//                           <span className="text-sm text-gray-300">
//                             {member?.name || r.userId}
//                           </span>
//                         </div>
//                         <span className="text-xs text-gray-500">
//                           {r.readAt
//                             ? formatTime(r.readAt)
//                             : "—"}
//                         </span>
//                       </div>
//                     );
//                   })}
//                 </div>
//               ) : (
//                 <p className="text-sm text-gray-500 px-3">
//                   Not read by anyone yet
//                 </p>
//               )}
//             </div>

//             {/* Delivered to */}
//             {/* <div>
//               <div className="flex items-center gap-2 mb-3">
//                 <CheckCheck className="w-5 h-5 text-gray-400" />
//                 <h4 className="text-gray-400 font-medium text-sm">
//                   Delivered to
//                 </h4>
//               </div>
//               {data.metaData?.deliveredTo?.length > 0 ? (
//                 <div className="space-y-2">
//                   {data.metaData.deliveredTo.map((d, i) => {
//                     const member = members?.find(
//                       (m) => m.userId?.toString() === d.userId
//                     );
//                     return (
//                       <div
//                         key={i}
//                         className="flex items-center justify-between py-2 px-3 bg-[#202c33] rounded-lg"
//                       >
//                         <div className="flex items-center gap-3">
//                           <div className="w-8 h-8 rounded-full bg-[#2a3942] flex items-center justify-center text-sm text-gray-300">
//                             {(
//                               member?.name ||
//                               d.userId ||
//                               "?"
//                             )[0]?.toUpperCase()}
//                           </div>
//                           <span className="text-sm text-gray-300">
//                             {member?.name || d.userId}
//                           </span>
//                         </div>
//                         <span className="text-xs text-gray-500">
//                           {d.deliveredAt
//                             ? formatTime(d.deliveredAt)
//                             : "—"}
//                         </span>
//                       </div>
//                     );
//                   })}
//                 </div>
//               ) : (
//                 <p className="text-sm text-gray-500 px-3">
//                   Not delivered yet
//                 </p>
//               )}
//             </div> */}

//             {/* Sent info */}
//             <div>
//               <div className="flex items-center gap-2 mb-2">
//                 <Check className="w-5 h-5 text-gray-400" />
//                 <h4 className="text-gray-400 font-medium text-sm">
//                   Sent
//                 </h4>
//               </div>
//               <p className="text-xs text-gray-500 px-3">
//                 {data.metaData?.sentAt
//                   ? new Date(data.metaData.sentAt).toLocaleString()
//                   : formatTime(data.timestamp)}
//               </p>
//             </div>
//           </div>
//         ) : (
//           <div className="flex items-center justify-center h-40 text-gray-500">
//             No data available
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MessageInfoPanel;


import React, { useState, useEffect } from "react";
import { ArrowLeft, Check, CheckCheck } from "lucide-react";
import { decryptMessage } from "../socket/encryptmsg";

const MessageInfoPanel = ({ data, loading, members, groupKey, onClose, formatTime, isMobile }) => {
  const [mounted, setMounted] = useState(false);
  const [decryptedText, setDecryptedText] = useState(null);
  const [decrypting, setDecrypting] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!data?.message?.msgBody) return;
    const run = async () => {
      setDecrypting(true);
      setDecryptedText(null);
      const payload = data.message.msgBody.message;
      if (payload?.cipherText && payload?.iv && payload?.authTag) {
        const result = await decryptMessage(payload, groupKey);
        setDecryptedText(result);
      } else {
        setDecryptedText(
          typeof payload === "string" ? payload : payload?.media?.fileName || "Media message"
        );
      }
      setDecrypting(false);
    };
    run();
  }, [data, groupKey]);

  const handleClose = () => {
    setMounted(false);
    setTimeout(onClose, 300);
  };

  const getMemberName = (userId) => {
    const m = members?.find(
      (m) =>
        m.userId?.toString() === userId?.toString() ||
        m.id?.toString() === userId?.toString()
    );
    return m?.name || userId || "Unknown";
  };

  const Avatar = ({ name }) => (
    <div className="w-9 h-9 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center shrink-0 text-sm font-bold text-[#0a0a0a] bg-gradient-to-br from-[#b9fd5c] to-[#a8e84a]">
      {(name || "?")[0]?.toUpperCase()}
    </div>
  );

  const MemberRow = ({ userId, timeLabel, last }) => {
    const name = getMemberName(userId);
    return (
      <div
        className={`flex items-center justify-between px-4 py-3 transition-colors hover:bg-[#1a1a1a] ${
          last ? "" : "border-b border-[#1a1a1a]"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={name} />
          <span className="text-[13.5px] font-semibold text-white truncate">
            {name}
          </span>
        </div>
        <span className="text-[11.5px] text-white/50 shrink-0 ml-2 font-medium">
          {timeLabel || "—"}
        </span>
      </div>
    );
  };

  const SectionHeader = ({ icon: Icon, label, className = "" }) => (
    <div
      className={`flex items-center gap-2.5 px-4 py-2.5 bg-[#141414] border-b border-[#1a1a1a] ${className}`}
    >
      <Icon className="w-[18px] h-[18px] shrink-0 text-[#b9fd5c]" />
      <span className="text-[11px] font-bold uppercase tracking-widest text-white/60">
        {label}
      </span>
    </div>
  );

  const readBy = data?.message?.metaData?.readBy || [];
  const deliveredTo = data?.message?.metaData?.deliveredTo || [];

  return (
    <div
      className={`absolute top-0 right-0 bottom-0 z-30 flex flex-col
        ${isMobile ? "w-full border-l-0" : "w-[420px] border-l border-[#1a1a1a]"}
        transition-transform duration-300 ease-out
        ${mounted ? "translate-x-0" : "translate-x-full"}
        bg-[#0a0a0a]`}
    >
      {/* ── HEADER ── */}
      <div
        className={`flex items-center gap-3 shrink-0 px-4
          ${isMobile ? "pt-10 pb-4" : "pt-7 pb-4"}
          bg-gradient-to-r from-[#b9fd5c] to-[#a8e84a]
          border-b border-[#b9fd5c]/30`}
        style={{ boxShadow: "0 4px 16px rgba(185, 253, 92, 0.15)" }}
      >
        <button
          onClick={handleClose}
          className="w-[34px] h-[34px] rounded-full flex items-center justify-center
            bg-[#0a0a0a]/20 border-0 cursor-pointer text-[#0a0a0a] shrink-0
            hover:bg-[#0a0a0a]/30 transition-all duration-200 active:scale-95"
        >
          <ArrowLeft className="w-[18px] h-[18px]" />
        </button>
        <h2 className="text-base font-bold text-[#0a0a0a] m-0 tracking-tight">
          Message info
        </h2>
      </div>

      {/* ── BODY ── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1a1a1a] scrollbar-track-transparent">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-44">
            <div className="w-9 h-9 rounded-full border-[3px] border-[#1a1a1a] border-t-[#b9fd5c] animate-spin" />
          </div>
        )}

        {/* No data */}
        {!loading && !data && (
          <div className="flex flex-col items-center justify-center h-44">
            <p className="text-white/40 text-sm font-medium">No data available</p>
          </div>
        )}

        {/* Data */}
        {!loading && data && (
          <>
            {/* ── Message preview bubble ── */}
            <div className="px-4 pt-5 pb-4">
              <div className="max-w-[85%] ml-auto bg-[#141414] rounded-[20px_6px_20px_20px] px-4 py-3 shadow-lg border border-[#1a1a1a]">
                {decrypting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-[#b9fd5c]/30 border-t-[#b9fd5c] animate-spin" />
                    <p className="text-[13px] text-[#b9fd5c]/70 m-0 font-medium">
                      Decrypting…
                    </p>
                  </div>
                ) : (
                  <p className="text-[13.5px] text-white m-0 leading-relaxed break-words font-medium">
                    {decryptedText ?? "…"}
                  </p>
                )}
                <p className="text-[10.5px] text-white/40 text-right mt-2 mb-0 font-medium">
                  {formatTime(data.timestamp)}
                </p>
              </div>
            </div>

            {/* ── Sent at ── */}
            <div className="mx-4 mt-4 bg-[#111111] rounded-xl overflow-hidden border border-[#1a1a1a]">
              <SectionHeader icon={Check} label="Sent" />
              <div className="px-4 pb-3 pt-3">
                <p className="text-[13px] text-white/70 m-0 font-medium">
                  {data.message.metaData?.sentAt
                    ? new Date(data.message.metaData.sentAt).toLocaleString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )
                    : formatTime(data.timestamp)}
                </p>
              </div>
            </div>

       

            {/* ── Read by ── */}
            <div className="mx-4 mt-3 mb-4 bg-[#111111] rounded-xl overflow-hidden border border-[#1a1a1a]">
              <SectionHeader
                icon={CheckCheck}
                label={`Read by · ${readBy.length}`}
              />
              {readBy.length > 0 ? (
                readBy.map((r, i) => (
                  <MemberRow
                    key={i}
                    userId={r.userId}
                    timeLabel={r.readAt ? formatTime(r.readAt) : null}
                    last={i === readBy.length - 1}
                  />
                ))
              ) : (
                <p className="px-4 pt-3 pb-3.5 text-[13px] text-white/40 m-0 font-medium">
                  Not read by anyone yet
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessageInfoPanel;