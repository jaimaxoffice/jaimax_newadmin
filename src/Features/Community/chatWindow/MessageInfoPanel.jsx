import React from "react";
import { X, Check, CheckCheck } from "lucide-react";

const MessageInfoPanel = ({ data, loading, members, onClose, formatTime }) => {
  return (
    <div className="flex-1 flex flex-col bg-[#111b21] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#202c33] border-b border-[#2a3942]">
        <button
          onClick={onClose}
          className="p-1 hover:bg-[#2a3942] rounded-full"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
        <h3 className="text-white font-medium">Message info</h3>
      </div>

      <div className="flex-1 overflow-y-auto sidebar-scroll">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2a3942] border-t-[#00a884]" />
          </div>
        ) : data ? (
          <div className="p-4 space-y-6">
            {/* Message preview */}
            <div className="bg-[#005c4b] rounded-lg p-3 max-w-[80%] ml-auto">
              <p className="text-sm text-gray-100">
                {data.msgBody?.message || "Media message"}
              </p>
              <p className="text-[10px] text-gray-300 text-right mt-1">
                {formatTime(data.timestamp)}
              </p>
            </div>

            {/* Read by */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCheck className="w-5 h-5 text-[#53bdeb]" />
                <h4 className="text-[#53bdeb] font-medium text-sm">
                  Read by
                </h4>
              </div>
              {data.metaData?.readBy?.length > 0 ? (
                <div className="space-y-2">
                  {data.metaData.readBy.map((r, i) => {
                    const member = members?.find(
                      (m) => m.userId?.toString() === r.userId
                    );
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 px-3 bg-[#202c33] rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#2a3942] flex items-center justify-center text-sm text-gray-300">
                            {(
                              member?.name ||
                              r.userId ||
                              "?"
                            )[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-300">
                            {member?.name || r.userId}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {r.readAt
                            ? formatTime(r.readAt)
                            : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 px-3">
                  Not read by anyone yet
                </p>
              )}
            </div>

            {/* Delivered to */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCheck className="w-5 h-5 text-gray-400" />
                <h4 className="text-gray-400 font-medium text-sm">
                  Delivered to
                </h4>
              </div>
              {data.metaData?.deliveredTo?.length > 0 ? (
                <div className="space-y-2">
                  {data.metaData.deliveredTo.map((d, i) => {
                    const member = members?.find(
                      (m) => m.userId?.toString() === d.userId
                    );
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 px-3 bg-[#202c33] rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#2a3942] flex items-center justify-center text-sm text-gray-300">
                            {(
                              member?.name ||
                              d.userId ||
                              "?"
                            )[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-300">
                            {member?.name || d.userId}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {d.deliveredAt
                            ? formatTime(d.deliveredAt)
                            : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 px-3">
                  Not delivered yet
                </p>
              )}
            </div>

            {/* Sent info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-gray-400" />
                <h4 className="text-gray-400 font-medium text-sm">
                  Sent
                </h4>
              </div>
              <p className="text-xs text-gray-500 px-3">
                {data.metaData?.sentAt
                  ? new Date(data.metaData.sentAt).toLocaleString()
                  : formatTime(data.timestamp)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 text-gray-500">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageInfoPanel;