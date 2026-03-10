import { useRef } from "react";

/**
 * useTyping
 * Manages typing indicator emit/stop logic.
 * Call handleTyping() on every keystroke in the input.
 */
const useTyping = (socketRef, selectedGroup, currentUser, setTypingUsers) => {
  const typingTimeoutRef = useRef(null);

  const handleTyping = () => {
    if (!socketRef.current || !selectedGroup) return;

    socketRef.current.emit("user:typing", {
      chatId: selectedGroup.chatId,
      userId: currentUser.id,
      userName: currentUser.name,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("user:stop-typing", {
        chatId: selectedGroup.chatId,
        userId: currentUser.id,
      });
    }, 2000);
  };

  return { handleTyping };
};

export default useTyping;