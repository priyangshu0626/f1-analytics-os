"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import { streamGemini } from "@/lib/gemini";
import { copilotSuggestions } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Send, Sparkles, Bot, User, Loader2, Trash2, Copy, Download } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const anim = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const ai = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } } };

export default function CopilotModule() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Message = { role: "user", content: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    const assistantMsg: Message = { role: "assistant", content: "", timestamp: new Date() };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      let fullContent = "";
      for await (const chunk of streamGemini(text.trim())) {
        fullContent += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...assistantMsg, content: fullContent };
          return updated;
        });
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...assistantMsg, content: "I apologize, but I encountered an error processing your request. Please try again." };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, lineIdx) => {
      if (line.startsWith('## ')) return <h2 key={lineIdx} className="text-base font-bold text-white mt-4 mb-2">{line.slice(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={lineIdx} className="text-sm font-semibold text-white mt-3 mb-1">{line.slice(4)}</h3>;
      if (line.startsWith('| ')) {
        return <div key={lineIdx} className="text-xs text-zinc-300 font-data bg-white/[0.02] px-2 py-1 border-b border-white/[0.04]">{line}</div>;
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        const content = line.slice(2);
        return (
          <div key={lineIdx} className="flex gap-2 py-0.5">
            <span className="text-[#0ea5e9] mt-1">•</span>
            <span className="text-sm text-zinc-300">{renderBold(content)}</span>
          </div>
        );
      }
      if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
        return <p key={lineIdx} className="text-xs text-zinc-500 italic mt-2">{line.slice(1, -1)}</p>;
      }
      if (line.trim() === '') return <div key={lineIdx} className="h-2" />;
      return <p key={lineIdx} className="text-sm text-zinc-300 leading-relaxed">{renderBold(line)}</p>;
    });
  };

  const renderBold = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 ? <strong key={i} className="text-white font-semibold">{part}</strong> : <span key={i}>{part}</span>
    );
  };

  return (
    <motion.div variants={anim} initial="hidden" animate="show" className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <motion.div variants={ai} className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#a855f7] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">AI Strategy Copilot</h2>
            <div className="flex items-center gap-2">
              <div className="pulse-dot bg-emerald-400" style={{ width: 6, height: 6 }} />
              <span className="text-[10px] text-zinc-500">Powered by Gemini 2.5 Pro</span>
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.04]"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-white/[0.06] bg-[#0c0c0f] p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0ea5e9]/20 to-[#a855f7]/20 flex items-center justify-center mb-6">
              <Bot className="w-8 h-8 text-[#0ea5e9]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">F1 Analytics Copilot</h3>
            <p className="text-sm text-zinc-500 max-w-md mb-8">
              Ask me anything about F1 commercial strategy, sponsorship analysis, fan engagement, or revenue optimization.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {copilotSuggestions.slice(0, 6).map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#0ea5e9]/30 hover:bg-white/[0.04] transition-all text-xs text-zinc-400 hover:text-zinc-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "")}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0ea5e9] to-[#a855f7] flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  msg.role === "user"
                    ? "bg-[#0ea5e9] text-white"
                    : "bg-white/[0.03] border border-white/[0.06]"
                )}>
                  {msg.role === "user" ? (
                    <p className="text-sm">{msg.content}</p>
                  ) : (
                    <div>
                      {msg.content ? renderMarkdown(msg.content) : (
                        <div className="typing-indicator flex gap-1 py-2">
                          <span /><span /><span />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-white/[0.1] flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-zinc-400" />
                  </div>
                )}
              </motion.div>
            ))}
            <div ref={chatEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="mt-4 relative">
        <div className="flex items-end gap-2 p-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] focus-within:border-[#0ea5e9]/30 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about sponsorship ROI, fan growth, or commercial strategy..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none resize-none px-3 py-2 min-h-[40px] max-h-[120px]"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0",
              input.trim() && !isStreaming
                ? "bg-gradient-to-r from-[#0ea5e9] to-[#a855f7] text-white hover:shadow-lg"
                : "bg-white/[0.04] text-zinc-600"
            )}
          >
            {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] text-zinc-600 text-center mt-2">
          Powered by Google Gemini 2.5 Pro · F1 Analytics OS v1.0
        </p>
      </div>
    </motion.div>
  );
}
