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
    <div className="bg-[#00ff87]/10 border border-[#00ff87]/30 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">👨‍⚕️</span>
        <h3 className="font-semibold text-[#00ff87] text-sm">
          {doctorType} in {location}
        </h3>
      </div>
      <div className="space-y-2">
        {Array.isArray(places) &&
          places.map((place: any, idx: number) => (
            <div
              key={idx}
              className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 hover:border-[#00ff87]/40 transition-colors group"
            >
              <a
                href={place.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-medium hover:text-[#00ff87] text-sm mb-1 block transition-colors"
              >
                {place.name}
              </a>
              <p className="text-xs text-gray-400 line-clamp-2">
                {place.description}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}

function SummaryCard({ summary, itemCount, type }: any) {
  const config = (
    {
      doctor: {
        bg: "bg-[#00ff87]/10",
        border: "border-[#00ff87]/30",
        text: "text-[#00ff87]",
      },
      disease: {
        bg: "bg-[#00e5ff]/10",
        border: "border-[#00e5ff]/30",
        text: "text-[#00e5ff]",
      },
    } as Record<string, any>
  )[type] || {
    bg: "bg-slate-800/50",
    border: "border-slate-700/50",
    text: "text-white",
  };

  return (
    <div
      className={`${config.bg} border ${config.border} rounded-lg p-3 sm:p-4 space-y-2`}
    >
      <h3 className={`font-semibold text-xs sm:text-sm ${config.text}`}>
        Summary ({itemCount})
      </h3>
      <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
        {summary}
      </p>
    </div>
  );
}

function LoadingCard({ message }: { message: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 flex items-center gap-2">
      <div className="animate-spin rounded-full h-3 w-3 border-2 border-[#00ff87] border-t-transparent" />
      <span className="text-xs text-[#00ff87] font-semibold">{message}</span>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="bg-red-500/15 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
      <span className="text-xs text-red-400 font-semibold">⚠️ {message}</span>
    </div>
  );
}

function MessageBubble({ message }: any) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} w-full px-2 sm:px-4`}
    >
      <div
        className={`rounded-lg px-4 py-3 sm:px-5 sm:py-4 max-w-xs sm:max-w-sm md:max-w-md ${
          isUser
            ? "bg-gradient-to-br from-[#00ff87]/20 to-[#00ff87]/10 border border-[#00ff87]/40 text-white rounded-br-sm"
            : "bg-slate-800/60 border border-slate-700/50 text-gray-100 rounded-bl-sm"
        }`}
      >
        <div className="space-y-2 sm:space-y-3">
          {message.parts
            ? message.parts.map((part: any, index: number) => {
                switch (part.type) {
                  case "text":
                    return (
                      <div
                        key={`${message.id}-part-${index}`}
                        className="text-sm sm:text-base leading-relaxed font-normal whitespace-pre-wrap break-words"
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
                            message="Finding specialists..."
                          />
                        );
                      case "input-available":
                        return (
                          <div
                            key={`${message.id}-getDoctor-${index}`}
                            className="text-xs bg-[#00ff87]/10 border border-[#00ff87]/30 px-3 py-2 sm:px-4 sm:py-3 rounded-lg font-semibold text-[#00ff87]"
                          >
                            👨‍⚕️ Searching for {part.input.doctorType} in{" "}
                            {part.input.location}
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
                <p className="text-sm sm:text-base leading-relaxed font-normal whitespace-pre-wrap break-words">
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
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 w-14 sm:w-16 h-14 sm:h-16 bg-gradient-to-br from-[#00ff87]/20 to-[#00ff87]/10 border border-[#00ff87]/50 text-[#00ff87] rounded-full hover:from-[#00ff87]/30 hover:to-[#00ff87]/20 hover:border-[#00ff87] shadow-lg hover:shadow-xl shadow-[#00ff87]/20 hover:shadow-[#00ff87]/40 flex items-center justify-center z-50 backdrop-blur-md transition-all duration-300"
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
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed inset-0 md:inset-auto md:bottom-32 md:right-8 z-50 flex items-center justify-center md:items-end md:justify-end p-3 sm:p-4 md:p-0"
            >
              <div className="w-full h-full md:h-[650px] md:w-[550px] bg-gradient-to-br from-slate-900 via-black to-slate-900 border border-[#00ff87]/20 rounded-2xl md:rounded-2xl shadow-2xl shadow-[#00ff87]/10 flex flex-col overflow-hidden relative">
                {/* Subtle Grid Background */}
                <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-[#00ff87]/20 p-3 sm:p-4 flex items-center justify-between shrink-0 relative z-10">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#00ff87]/30 to-[#00ff87]/10 border border-[#00ff87]/40 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-[#00ff87]/20">
                      <IoChatbubbles
                        size={20}
                        className="sm:size-6 text-[#00ff87]"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">
                        MedScan<span className="text-[#00ff87]">AI</span>
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00ff87] animate-pulse" />
                        <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#00ff87]/80">
                          {(status as any) === "idle" ||
                          (status as any) === "ready"
                            ? "Core Online"
                            : "Processing Neural Waves..."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(false)}
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-slate-700/50 hover:bg-red-500/20 hover:text-red-400 text-gray-300 rounded-lg border border-slate-600/50 hover:border-red-500/40 transition-all"
                  >
                    <IoClose size={20} />
                  </motion.button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 relative z-10 scrollbar-hide">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 sm:space-y-8">
                      <motion.div
                        animate={{
                          scale: [1, 1.02, 1],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#00ff87]/20 to-[#00ff87]/5 border border-[#00ff87]/30 rounded-2xl flex items-center justify-center"
                      >
                        <IoChatbubbles
                          size={32}
                          className="sm:size-10 text-[#00ff87]"
                        />
                      </motion.div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 uppercase tracking-tight">
                          Start Conversation
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 max-w-sm sm:max-w-md mx-auto">
                          {[
                            "Analyze scan results",
                            "Symptom verification",
                            "Medical specialist targeting",
                          ].map((text, i) => (
                            <div
                              key={i}
                              className="px-2 sm:px-3 py-2 sm:py-2.5 bg-slate-800/50 border border-slate-700/50 hover:border-[#00ff87]/40 rounded-lg text-[10px] sm:text-xs font-medium text-gray-300 hover:text-[#00ff87] uppercase tracking-wide transition-all cursor-pointer"
                            >
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
                      className="flex justify-start px-2 sm:px-4"
                    >
                      <div className="bg-slate-800/50 border border-slate-700/50 px-4 py-3 sm:px-5 sm:py-4 rounded-lg rounded-bl-none flex items-center gap-3 sm:gap-4">
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-[#00ff87] border-t-transparent" />
                        <span className="text-xs text-[#00ff87] font-semibold">
                          Processing...
                        </span>
                        <button
                          onClick={stop}
                          className="ml-2 sm:ml-4 px-2 sm:px-3 py-1 bg-red-500/15 border border-red-500/30 text-red-400 rounded-lg text-[10px] sm:text-xs font-semibold hover:bg-red-500/25 transition-all"
                        >
                          Abort
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-t border-[#00ff87]/20 p-3 sm:p-4 space-y-3 sm:space-y-4 shrink-0 relative z-10">
                  {uploadError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-2 sm:p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                    >
                      <p className="text-[9px] sm:text-xs text-red-400 font-semibold uppercase tracking-wide flex items-center gap-2">
                        <span>⚠️</span>
                        {uploadError}
                      </p>
                    </motion.div>
                  )}

                  {uploadedImages.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {uploadedImages.map((img, idx) => (
                        <div
                          key={img}
                          className="relative shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg border border-[#00ff87]/30 overflow-hidden group"
                        >
                          <img
                            src={img}
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                            alt="upload"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute inset-0 flex items-center justify-center bg-red-600/70 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ))}
                      <span className="text-xs text-[#00ff87] font-semibold whitespace-nowrap">
                        {uploadedImages.length} uploaded
                      </span>
                    </div>
                  )}

                  <form className="flex gap-2" onSubmit={onSubmit}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      multiple
                      disabled={isUploading || status !== "ready"}
                      className="hidden"
                      title="Upload image"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || status !== "ready" || isLoading}
                      className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 bg-slate-700/50 border border-slate-600/50 hover:border-[#00ff87]/40 text-gray-300 hover:text-[#00ff87] rounded-lg flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
                      title="Upload image"
                    >
                      <Upload className="w-5 h-5" />
                    </button>

                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={isLoading}
                      placeholder="Ask me..."
                      className="flex-1 h-10 sm:h-11 px-3 sm:px-4 rounded-lg border border-slate-600/50 bg-slate-800/50 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff87]/50 focus:ring-1 focus:ring-[#00ff87]/30 transition-all text-sm"
                    />

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={sendButtonDisabled}
                      className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-[#00ff87] to-[#00cc6f] text-black hover:from-[#1eff93] hover:to-[#00ff87] rounded-lg flex items-center justify-center disabled:opacity-40 disabled:grayscale transition-all shadow-lg hover:shadow-xl shadow-[#00ff87]/30"
                      title="Send message"
                    >
                      <IoSend size={20} />
                    </motion.button>
                  </form>

                  <div className="flex items-center justify-center gap-3 opacity-50">
                    <div className="h-px bg-slate-600/50 flex-1" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      MedScan AI v1.0
                    </span>
                    <div className="h-px bg-slate-600/50 flex-1" />
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
