"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

interface Message {
  text: string;
  timestamp: string;
}

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io();

    socketInstance.on("connect", () => {
      console.log("Connected to Socket.IO server");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
      setIsConnected(false);
    });

    // Listen for messages
    socketInstance.on("message", (data: Message) => {
      setMessages((prev) => [...prev, { ...data, type: "message" }]);
    });

    // Listen for pings
    socketInstance.on("ping", (data: Message) => {
      setMessages((prev) => [...prev, { ...data, type: "ping" }]);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (socket && inputMessage.trim()) {
      socket.emit("client-message", {
        text: inputMessage,
        timestamp: new Date().toISOString(),
      });
      setInputMessage("");
    }
  };

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-sans">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Socket.IO + Next.js</h1>

        {/* Connection Status */}
        <div className="mb-6 p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="font-medium">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        {/* Message Input */}
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!isConnected || !inputMessage.trim()}
            className="px-6 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>

        {/* Messages Display */}
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 h-96 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Messages</h2>
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages yet...</p>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.timestamp}
                  className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800"
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total messages received:{" "}
            <span className="font-bold">{messages.length}</span>
          </p>
        </div>
      </main>
    </div>
  );
}
