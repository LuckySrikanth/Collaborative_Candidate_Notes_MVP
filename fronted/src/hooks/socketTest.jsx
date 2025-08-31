import { useState } from "react";
import { useSocket } from "./useSocket";

export default function SocketTest() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const { isConnected, sendMessage } = useSocket(
    "candidate123",
    (newMessage) => {
      console.log("📩 Got message on frontend:", newMessage);
      setMessages((prev) => [...prev, newMessage]);
    },
    (notification) => {
      console.log("🔔 Got tagged notification:", notification);
    }
  );

  return (
    <div>
      <h2>Socket Test ({isConnected ? "Connected" : "Disconnected"})</h2>

      <div
        style={{
          border: "1px solid #ccc",
          padding: 10,
          height: 200,
          overflow: "auto",
        }}
      >
        {messages.map((msg, i) => (
          <p key={i}>
            <b>{msg.userId}:</b> {msg.content}
          </p>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type message..."
      />
      <button
        onClick={() => {
          sendMessage(input);
          setInput("");
        }}
      >
        Send
      </button>
    </div>
  );
}
