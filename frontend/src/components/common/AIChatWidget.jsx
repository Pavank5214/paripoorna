import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, MessageSquare, Trash2, ArrowRight } from "lucide-react";

const AIChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            text: "Hello! I'm **SiteMind** 🤖. I can analyze **costs**, track **materials**, and provide **safety** insights. Tap a quick prompt below or ask me anything!",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, loading]);

    const handleClearChat = () => {
        setMessages([
            {
                role: "assistant",
                text: "Chat history cleared. How can I help you now?",
            },
        ]);
    };

    const handleSend = async (e, promptText = null) => {
        if (e) e.preventDefault();
        const textToSend = promptText || input;
        if (!textToSend.trim()) return;

        const userMessage = { role: "user", text: textToSend };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/plan`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ prompt: userMessage.text }),
            });

            if (!res.ok) throw new Error("Failed to get response");

            const data = await res.json();
            const botMessage = { role: "assistant", text: data.summary || data.response || "I've processed your request." };
            setMessages((prev) => [...prev, botMessage]);
        } catch (err) {
            console.error(err);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", text: "I encountered a connection issue. Please check your network or try again later." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Helper to format text with Bold (**text**) and Bullet points
    const formatMessage = (text) => {
        if (!text) return "";

        // Split by lines to handle list items if simple formatting is needed
        // For now, simple bold parsing
        const parts = text.split(/(\*\*.*?\*\*)/g);

        return parts.map((part, index) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={index} className="font-black text-slate-900">{part.slice(2, -2)}</strong>;
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none font-sans">
            {/* Chat Window */}
            <div
                className={`pointer-events-auto bg-white/95 backdrop-blur-xl w-[360px] md:w-[400px] h-[600px] rounded-2xl shadow-2xl border border-white/20 ring-1 ring-slate-900/5 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform origin-bottom-right mb-4 overflow-hidden ${isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-10 pointer-events-none h-0 w-0 mb-0"
                    }`}
            >
                {/* Header */}
                <div className="bg-slate-900 p-4 shrink-0 relative overflow-hidden">
                    {/* Abstract Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 rounded-full blur-[60px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>

                    <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/50 backdrop-blur-md shadow-inner">
                                <Bot className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="font-black text-base text-white uppercase tracking-wider flex items-center gap-2">
                                    SiteMind <span className="text-amber-500">AI</span>
                                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-white font-bold border border-white/10">PRO</span>
                                </h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wide">
                                        Active & Ready
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleClearChat}
                                className="text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 p-2 rounded-lg transition-colors"
                                title="Clear History"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={toggleChat}
                                className="text-slate-400 hover:text-white hover:bg-slate-800/50 p-2 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gradient-to-b from-slate-50 to-white pb-4 scroll-smooth">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-slide-in group`}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                                {/* Avatar for Bot */}
                                {msg.role === 'assistant' && (
                                    <div className="mb-1 flex items-center gap-1.5 ml-1">
                                        <Sparkles className="w-3 h-3 text-amber-500" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SiteMind</span>
                                    </div>
                                )}

                                <div
                                    className={`p-4 text-xs font-medium leading-relaxed shadow-sm transition-all duration-200 hover:shadow-md relative ${msg.role === "user"
                                        ? "bg-slate-900 text-slate-100 rounded-2xl rounded-tr-sm shadow-slate-900/10"
                                        : "bg-white text-slate-600 rounded-2xl rounded-tl-sm border border-slate-100 shadow-slate-200/50"
                                        }`}
                                >
                                    {msg.role === 'assistant' ? formatMessage(msg.text) : msg.text}
                                </div>
                                {msg.role === "user" && (
                                    <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        You
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start animate-slide-in p-1">
                            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm flex items-center gap-3">
                                <Bot className="w-4 h-4 text-slate-400 animate-bounce" />
                                <div className="flex gap-1 items-center">
                                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-0"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100 shrink-0 z-20 relative">
                    <form onSubmit={(e) => handleSend(e)} className="flex gap-2 relative">
                        <div className="relative w-full group">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about costs, risks..."
                                className="w-full bg-slate-50 text-slate-800 rounded-xl pl-4 pr-3 py-3.5 border-none ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm font-semibold placeholder:text-slate-400 transition-all shadow-inner"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="p-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-slate-900/20 active:scale-95 hover:-translate-y-0.5 group"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Floating Button */}
            <div className="relative group">
                {/* Pulse Ring Effect when closed */}
                {!isOpen && (
                    <>
                        <span className="absolute inset-0 rounded-2xl bg-amber-400 opacity-20 animate-ping duration-1000 delay-1000"></span>
                        <span className="absolute inset-0 rounded-2xl bg-slate-900 opacity-5 animate-pulse"></span>
                    </>
                )}

                <button
                    onClick={toggleChat}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={`pointer-events-auto relative z-10 flex items-center justify-center w-14 h-14 rounded-2xl shadow-2xl shadow-amber-900/20 transition-all duration-500 ease-spring border border-white/20 hover:shadow-3xl hover:-translate-y-1 ${isOpen
                        ? "bg-slate-900 text-white rotate-0 rounded-full"
                        : "bg-gradient-to-br from-slate-900 to-slate-800 text-amber-500"
                        }`}
                >
                    {isOpen ? (
                        <X className="w-6 h-6 transition-transform duration-500 rotate-90" />
                    ) : (
                        <Bot className={`w-7 h-7 transition-all duration-500 ${isHovered ? 'animate-bounce-subtle' : ''}`} />
                    )}
                </button>

                {/* Tooltip */}
                <div className={`absolute right-16 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 ${!isOpen && isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                    }`}>
                    <div className="bg-slate-900/90 backdrop-blur text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-white/10 shadow-xl whitespace-nowrap flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        AI Assistant
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChatWidget;
