"use client";
import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoClose,
  IoSend,
  IoChatbubbles,
  IoCheckmarkDone,
} from "react-icons/io5";
import { Square, Upload, X, Trash2 } from "lucide-react";

function DoctorCard({ places, doctorType, location }: any) {
  return (
    <div className="bg-[#00ff87]/5 border-l-4 border-[#00ff87] rounded-xl p-6 space-y-4 backdrop-blur-md border border-[#00ff87]/20 shadow-[0_0_20px_rgba(0,255,135,0.1)]">
      <div className="flex items-center gap-3">
        <span className="text-xl">👨‍⚕️</span>
        <h3 className="font-black text-[#00ff87] uppercase tracking-wider text-sm">
          {doctorType} Specialists in {location}
        </h3>
      </div>
      <div className="space-y-3">
        {Array.isArray(places) &&
          places.map((place: any, idx: number) => (
            <div
              key={idx}
              className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-[#00ff87]/40 hover:bg-[#00ff87]/5 transition-all duration-300 group"
            >
              <a
                href={place.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-bold hover:text-[#00ff87] block text-sm mb-2 transition-colors"
              >
                {idx + 1}. {place.name}
              </a>
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 italic">
                {place.description}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}

function SummaryCard({ summary, itemCount, type }: any) {
  const config = ({
    doctor: {
      bg: "bg-[#00ff87]/10",
      border: "border-[#00ff87]/30",
      text: "text-[#00ff87]",
      icon: "✨",
    },
    disease: {
      bg: "bg-[#00e5ff]/10",
      border: "border-[#00e5ff]/30",
      text: "text-[#00e5ff]",
      icon: "🎯",
    },
  } as Record<string, any>)[type] || {
    bg: "bg-white/5",
    border: "border-white/20",
    text: "text-white",
    icon: "📝",
  };

  return (
    <div
      className={`${config.bg} border ${config.border} rounded-xl p-5 space-y-3 mt-4 backdrop-blur-md relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 p-2 opacity-10">
        <span className="text-2xl">{config.icon}</span>
      </div>
      <div className="flex items-center gap-2">
        <h3 className={`font-black text-[10px] uppercase tracking-[0.2em] ${config.text}`}>Analytical Summary ({itemCount})</h3>
      </div>
      <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap italic">
        {summary}
      </p>
    </div>
  );
}

function LoadingCard({ message }: { message: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 backdrop-blur-sm">
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#00ff87] border-t-transparent shadow-[0_0_10px_rgba(0,255,135,0.5)]" />
      <span className="text-xs text-[#00ff87] font-black uppercase tracking-widest animate-pulse">{message}</span>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 backdrop-blur-sm">
      <div className="text-xs text-red-500 font-bold uppercase tracking-widest">
        <span className="mr-2">⚠️</span> System Error: {message}
      </div>
    </div>
  );
}

function MessageBubble({ message }: any) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} px-2`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-5 py-4 ${isUser
          ? "bg-[#00ff87]/10 border border-[#00ff87]/30 text-white rounded-br-none shadow-[0_0_20px_rgba(0,255,135,0.05)]"
          : "bg-white/5 border border-white/10 text-gray-200 rounded-bl-none backdrop-blur-md"
          }`}
      >
        <div className="space-y-4">
          {message.parts
            ? message.parts.map((part: any, index: number) => {
              switch (part.type) {
                case "text":
                  return (
                    <div
                      key={`${message.id}-part-${index}`}
                      className="whitespace-pre-wrap text-[13px] leading-relaxed font-medium"
                    >
                      {part.text}
                    </div>
                  );

                case "tool-getDoctor":
                  switch (part.state) {
                    case "input-streaming":
                      return (
                        <LoadingCard
                          key={`${message.id}-getDoctor-${index}`}
                          message="Locating Medical Personnel..."
                        />
                      );
                    case "input-available":
                      return (
                        <div
                          key={`${message.id}-getDoctor-${index}`}
                          className="text-[10px] bg-[#00ff87]/5 border border-[#00ff87]/20 px-3 py-2 rounded-lg font-black uppercase tracking-widest text-[#00ff87]"
                        >
                          👨‍⚕️ Targeting: {part.input.doctorType} in {part.input.location}
                        </div>
                      );
                    case "output-available": {
                      const places = Array.isArray(part.output.places)
                        ? part.output.places
                        : part.output;
                      const summary = part.output.combinedSummary;
                      return (
                        <div
                          key={`${message.id}-getDoctor-${index}`}
                          className="space-y-4"
                        >
                          <DoctorCard
                            places={places}
                            doctorType={part.input.doctorType}
                            location={part.input.location}
                          />
                          {summary && (
                            <SummaryCard
                              summary={summary}
                              itemCount={places.length}
                              type="doctor"
                            />
                          )}
                        </div>
                      );
                    }
                    case "output-error":
                      return (
                        <ErrorCard
                          key={`${message.id}-getDoctor-${index}`}
                          message={part.errorText}
                        />
                      );
                    default:
                      return null;
                  }

                default:
                  return null;
              }
            })
            : typeof message.content === "string" && (
              <p className="whitespace-pre-wrap text-[13px] leading-relaxed font-medium">
                {message.content}
              </p>
            )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ChatUi() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, stop, sendMessage, status } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    setUploadError("");
    const newImages: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          setUploadError("Format Violation: Images Only.");
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          setUploadError("Capacity Violation: Max 10MB.");
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Relay Failure");
        }

        const data = await response.json();
        if (data?.secure_url) {
          newImages.push(data.secure_url);
        }
      }

      if (newImages.length > 0) {
        setUploadedImages((prev) => [...prev, ...newImages]);
      }
    } catch (error) {
      setUploadError("Neural Link Failed. Retry Transmission.");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (status !== "ready" || isUploading) return;

    const userPrompt = input.trim();
    if (!userPrompt) return;

    if (uploadedImages.length > 0) {
      const cloudinaryUrls = uploadedImages.map((url) => `- ${url}`).join("\n");
      sendMessage({
        text: `${userPrompt}\n\nCLOUDINARY_IMAGE_URLS:\n${cloudinaryUrls}`,
      });
      setUploadedImages([]);
    } else {
      sendMessage({ text: userPrompt });
    }

    setInput("");
    setUploadError("");
  };

  const lastMessage = messages.length ? messages[messages.length - 1] : null;
  const isLoading =
    (status === "submitted" || status === "streaming") &&
    lastMessage?.role === "user";

  const sendButtonDisabled =
    status !== "ready" || isLoading || isUploading || !input.trim();

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-black border border-[#00ff87]/40 text-[#00ff87] rounded-2xl shadow-[0_0_20px_rgba(0,255,135,0.2)] hover:shadow-[0_0_30px_rgba(0,255,135,0.4)] hover:border-[#00ff87] flex items-center justify-center z-50 backdrop-blur-xl group transition-all duration-300"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <IoClose size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="relative"
            >
              <IoChatbubbles size={28} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00ff87] rounded-full neon-pulse border border-black" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
            />

            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4 md:p-8"
            >
              <div className="w-full h-full max-w-4xl max-h-[800px] bg-black border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative">
                {/* Subtle Grid Background */}
                <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

                {/* Header */}
                <div className="bg-white/3 border-b border-white/10 p-6 flex items-center justify-between shrink-0 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-[#00ff87]/10 border border-[#00ff87]/30 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(0,255,135,0.1)]">
                      <IoChatbubbles size={28} className="text-[#00ff87]" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-white tracking-tight">MedScanAI <span className="text-[#00ff87]">ASSISTANT</span></h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-[#00ff87] neon-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00ff87]/70">
                          {((status as any) === "idle" || (status as any) === "ready")
                            ? "Core Online"
                            : "Processing Neural Waves..."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(false)}
                    className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-xl border border-white/10 transition-all"
                  >
                    <IoClose size={24} />
                  </motion.button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 relative z-10 scrollbar-hide">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
                      <motion.div
                        animate={{
                          boxShadow: ['0 0 20px rgba(0,255,135,0.1)', '0 0 60px rgba(0,255,135,0.3)', '0 0 20px rgba(0,255,135,0.1)'],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="w-24 h-24 bg-[#00ff87]/5 border border-[#00ff87]/20 rounded-3xl flex items-center justify-center"
                      >
                        <IoChatbubbles size={48} className="text-[#00ff87]" />
                      </motion.div>
                      <div>
                        <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">
                          Initialize Protocol
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                          {[
                            "Analyze scan results",
                            "Symptom verification",
                            "Medical specialist targeting"
                          ].map((text, i) => (
                            <div key={i} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:border-[#00ff87]/40 hover:text-white transition-all cursor-pointer">
                              {text}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                      ))}
                    </div>
                  )}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start px-2"
                    >
                      <div className="bg-white/5 border border-white/10 px-5 py-4 rounded-2xl rounded-bl-none flex items-center gap-4 backdrop-blur-md">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#00ff87] border-t-transparent" />
                        <span className="text-[10px] text-[#00ff87] font-black uppercase tracking-[0.2em] animate-pulse">
                          Decoding Neural Response...
                        </span>
                        <button
                          onClick={stop}
                          className="ml-4 px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                        >
                          Abort
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="bg-white/2 border-t border-white/10 p-6 md:p-8 space-y-6 shrink-0 relative z-10">
                  {uploadError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                    >
                      <p className="text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center gap-2">
                        <span>⚠️</span> Protocol Violation: {uploadError}
                      </p>
                    </motion.div>
                  )}

                  {uploadedImages.length > 0 && (
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {uploadedImages.map((img, idx) => (
                        <div
                          key={img}
                          className="relative flex-shrink-0 w-16 h-16 rounded-xl border border-[#00ff87]/30 overflow-hidden group"
                        >
                          <img src={img} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" alt="upload" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute inset-0 flex items-center justify-center bg-red-600/60 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      ))}
                      <div className="text-[10px] font-black text-[#00ff87] uppercase tracking-widest mr-4">
                        Data Up-links Active [{uploadedImages.length}]
                      </div>
                    </div>
                  )}

                  <form className="flex gap-4" onSubmit={onSubmit}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      multiple
                      disabled={isUploading || status !== "ready"}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || status !== "ready" || isLoading}
                      className="flex-shrink-0 w-14 h-14 bg-white/5 border border-white/10 hover:border-[#00ff87]/50 text-gray-400 hover:text-[#00ff87] rounded-2xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                    >
                      <Upload className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </button>

                    <div className="flex-1 relative group">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        placeholder="Inquire Neural Core..."
                        className="w-full h-14 px-6 rounded-2xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff87]/50 focus:bg-[#00ff87]/5 transition-all text-sm font-medium"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-[#00ff87]/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity" />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0,255,135,0.4)' }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={sendButtonDisabled}
                      className="w-14 h-14 bg-[#00ff87] text-black rounded-2xl flex items-center justify-center disabled:opacity-20 disabled:grayscale transition-all shrink-0"
                    >
                      <IoSend size={24} />
                    </motion.button>
                  </form>

                  <div className="flex items-center justify-center gap-6 opacity-30">
                    <div className="h-px bg-white/20 flex-1" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">AI Diagnostic Module V2.0</span>
                    <div className="h-px bg-white/20 flex-1" />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}