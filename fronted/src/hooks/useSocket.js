import { useEffect, useState, useCallback } from "react";
import io from "socket.io-client";

const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL;

let globalSocket = null;

export const useSocket = (candidateId, onNewMessage, onUserTagged) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (!token || !user?._id) return;

    if (!globalSocket) {
      globalSocket = io(SOCKET_SERVER_URL, {
        query: { token, userId: user._id },
      });

      globalSocket.on("connect", () => setIsConnected(true));
      globalSocket.on("disconnect", () => setIsConnected(false));

      // newMessage from candidate room
      globalSocket.on("newMessage", (msg) => {
        if (onNewMessage) onNewMessage(msg);
      });

      // tagged notification
      globalSocket.on("tagged", (notif) => {
        if (onUserTagged) onUserTagged(notif);
      });
    }

    if (candidateId) {
      globalSocket.emit("joinCandidate", candidateId);
    }

    return () => {
      if (candidateId) globalSocket.emit("leaveCandidate", candidateId);
    };
  }, [candidateId]);

  const sendMessage = useCallback(
    (content) => {
      if (globalSocket && isConnected) {
        globalSocket.emit("send_message", { candidateId, content });
      }
    },
    [candidateId, isConnected]
  );

  return { isConnected, sendMessage };
};
