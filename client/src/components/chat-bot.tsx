import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MessagesSquare, X, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatBotProps {
  theme?: {
    buttonColor: string;
    themeColor: string;
    avatarUrl?: string;
  };
  buttonColor?: string; 
  bubbleColor?: string;
  textColor?: string;
  font?: string;
  enabled?: boolean;
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  systemPrompt: string;
  welcomeMessage: string;
  placeholderText: string;
  name?: string;
}

// Slayz.cc logo as SVG for the avatar
const SLAYZ_LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="12" fill="#111111"/>
  <path d="M7 7.5C7 6.67157 7.67157 6 8.5 6H15.5C16.3284 6 17 6.67157 17 7.5C17 8.32843 16.3284 9 15.5 9H8.5C7.67157 9 7 8.32843 7 7.5Z" fill="#7C3AED"/>
  <path d="M7 12C7 11.1716 7.67157 10.5 8.5 10.5H15.5C16.3284 10.5 17 11.1716 17 12C17 12.8284 16.3284 13.5 15.5 13.5H8.5C7.67157 13.5 7 12.8284 7 12Z" fill="#7C3AED"/>
  <path d="M8.5 15C7.67157 15 7 15.6716 7 16.5C7 17.3284 7.67157 18 8.5 18H15.5C16.3284 18 17 17.3284 17 16.5C17 15.6716 16.3284 15 15.5 15H8.5Z" fill="#7C3AED"/>
</svg>
`;

const FALLBACK_AVATAR_SVG = `data:image/svg+xml,${encodeURIComponent(SLAYZ_LOGO_SVG)}`;

export function ChatBot({
  theme = {
    buttonColor: "#7C3AED", // Default to purple
    themeColor: "#111111", // Dark theme
  },
  position = "bottom-right",
  systemPrompt,
  welcomeMessage,
  placeholderText = "Type your message...",
  name = "Slayz Assistant",
}: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: welcomeMessage || "Hello! How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    socketRef.current = io(`${protocol}//${host}`, {
      transports: ["websocket"],
      path: "/socket.io",
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected");
    });

    socketRef.current.on("bot-response", (message: string) => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: message,
        },
      ]);
      setIsLoading(false);
    });

    socketRef.current.on("connect_error", (error: Error) => {
      console.error("Socket connection error:", error);
      setIsLoading(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && chatWindowRef.current) {
      // Adjust position for top positions to prevent going off-screen
      const chatWindow = chatWindowRef.current;
      const rect = chatWindow.getBoundingClientRect();
      if (position.startsWith("top") && rect.top < 0) {
        chatWindow.style.top = "1rem";
      }
      // Focus the input when chat opens
      inputRef.current?.focus();
    }
  }, [isOpen, position]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    socketRef.current.emit("user-message", {
      message: input,
      systemPrompt,
    });

    setInput("");
  };

  const positionClasses = {
    "bottom-right": "right-4 bottom-4",
    "bottom-left": "left-4 bottom-4",
    "top-right": "right-4 top-4",
    "top-left": "left-4 top-4",
  };

  return (
    <div className={cn("fixed z-50", positionClasses[position])}>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            ref={chatWindowRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-4rem)]",
              "bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden",
              "shadow-[0_0_30px_rgba(124,58,237,0.3)]", // Purple glow effect
              "backdrop-blur-sm flex flex-col"
            )}
          >
            {/* Header */}
            <div
              className="p-4 flex items-center justify-between border-b border-[#222222]"
              style={{
                background: "linear-gradient(to right, #111111, #1a1a1a)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center overflow-hidden shadow-[0_0_10px_rgba(124,58,237,0.5)]">
                  <img
                    src={`data:image/svg+xml,${encodeURIComponent(SLAYZ_LOGO_SVG)}`}
                    alt="Slayz Logo"
                    className="w-6 h-6"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{name}</h3>
                  <p className="text-xs text-[#7C3AED]">slayz.cc</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-white hover:bg-[#222222] hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#111111] bg-opacity-95 scrollbar-thin scrollbar-thumb-[#333333] scrollbar-track-transparent">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3",
                      message.role === "user"
                        ? "bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                        : "bg-[#222222] text-white shadow-md"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-[#222222] text-white shadow-md">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" style={{ animationDelay: "300ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" style={{ animationDelay: "600ms" }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-[#222222] bg-[#151515]">
              <div className="flex gap-2 items-center">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={placeholderText}
                  className="flex-1 bg-[#222222] border-[#333333] rounded-xl h-11 px-4 text-white focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-all"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 w-11 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="icon"
              className="h-14 w-14 rounded-full shadow-[0_0_20px_rgba(124,58,237,0.5)] bg-[#7C3AED] hover:bg-[#6D28D9] transition-all"
            >
              <MessagesSquare className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}