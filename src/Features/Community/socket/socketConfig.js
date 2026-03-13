import io from "socket.io-client";

export const createSocket = ({ socketUrl, currentUser }) => {
  const socketQuery = { userId: currentUser.id };

  if (currentUser.userregisteredDate !== undefined) {
    socketQuery.date = currentUser.userregisteredDate;
  }

  return io(socketUrl, {
    transports: ["websocket"],
    query: socketQuery,

    pingTimeout: 120_000,      // wait 2 min for pong before declaring dead
    pingInterval: 25_000,      // send ping every 25s

    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 30_000,
    randomizationFactor: 0.5,
  });
};