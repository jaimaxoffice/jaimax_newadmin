import React, { useState } from "react";
import { decryptMessage } from "../socket/encryptmsg";

export const safeReplyText = (raw, groupKey) => {
  if (!raw) return "Media message";
  if (typeof raw === "object" && raw !== null) {
    if (raw.cipherText) {
      try {
        return decryptMessage(raw, groupKey);
      } catch {
        return "[Encrypted]";
      }
    }
    return "Media message";
  }
  if (typeof raw === "string") {
    if (
      raw.length > 200 &&
      (raw.includes("export ") || raw.includes("import ") || raw.includes("=>"))
    ) {
      return "[Message]";
    }
    return raw;
  }
  return "Media message";
};

const CHAR_LIMIT = 250;

const MessageText = ({
  text,
  isCurrentUser,
  isReported,
  renderMessageWithLinks,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = (text?.length || 0) > CHAR_LIMIT;

  if (isReported) {
    return (
      <div className="text-sm italic text-gray-400">
        Reported content hidden
      </div>
    );
  }

  return (
    <div
      className="text-sm break-words whitespace-pre-wrap"
      style={{ overflowWrap: "anywhere" }}
    >
      {isLong && !isExpanded ? (
        <>
          {renderMessageWithLinks(text.slice(0, CHAR_LIMIT) + "…")}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
            className={`block mt-2 text-xs font-semibold ${isCurrentUser ? "text-black/60 hover:text-black" : "text-[#00a884] hover:text-[#00c49a]"}`}
          >
            Read more
          </button>
        </>
      ) : (
        <>
          {renderMessageWithLinks(text)}
          {isLong && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className={`block mt-2 text-xs font-semibold ${isCurrentUser ? "text-black/60 hover:text-black" : "text-[#00a884] hover:text-[#00c49a]"}`}
            >
              Show less
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default MessageText;
