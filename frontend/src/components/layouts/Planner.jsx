import React, { useState } from "react";
import { Zap, X, Loader2, AlertCircle } from "lucide-react";

const Planner = () => {
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!aiPrompt) return;

    setAiLoading(true);
    setAiError(null);
    setAiResponse(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setAiError("Please log in to use the AI Planner.");
      setAiLoading(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const data = await res.json();
      if (res.ok) {
        setAiResponse(data || {});
      } else {
        setAiError(data.error || "Failed to generate plan.");
      }
    } catch (err) {
      setAiError("Network error. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // Render the AI response
  const renderResponse = (response) => {
    if (!response) {
      return <p className="text-slate-700 text-xs sm:text-sm">No data available.</p>;
    }

    // Handle summary response
    if (response.summary) {
      // Split summary into lines for multi-sentence responses
      const lines = response.summary.split(". ").map((line, index) => (
        <p key={index} className="text-slate-700 text-xs sm:text-sm mb-2">
          {line}{index < response.summary.split(". ").length - 1 ? "." : ""}
        </p>
      ));
      return <div className="leading-relaxed">{lines}</div>;
    }

    // Fallback for unexpected response types
    return (
      <p className="text-slate-700 text-xs sm:text-sm">
        Unable to display response.
      </p>
    );
  };

  return (
    <div className="font-sans">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-10 right-10 sm:bottom-20 sm:right-20 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full p-5 sm:p-5 shadow-xl hover:shadow-2xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 min-w-[44px] min-h-[44px]"
          aria-label="Open AI Planner"
        >
          <Zap className="h-5 w-5 sm:h-7 sm:w-7" />
        </button>
      )}

      {/* Floating Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-full max-w-sm sm:max-w-md md:max-w-lg bg-white rounded-2xl shadow-2xl p-4 sm:p-6 z-50 overflow-y-auto overflow-x-hidden max-h-[80vh] sm:max-h-[85vh] min-h-0 transition-all duration-300 animate-slide-in">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 sm:gap-3 text-slate-800">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-500" /> AI Assist
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-800 transition-colors p-1 sm:p-0 min-w-[32px] min-h-[32px]"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Prompt Input */}
          <form onSubmit={handleAiSubmit} className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <textarea
              className="w-full p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder-slate-400 transition-all duration-200"
              rows={3}
              sm-rows={4}
              placeholder="Ask AI (e.g., 'List project names with budget' or 'What is project management?')"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <button
              type="submit"
              disabled={aiLoading}
              className={`w-full py-2.5 sm:py-3 rounded-lg text-white font-semibold text-xs sm:text-sm transition-all duration-200 min-h-[44px] ${aiLoading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                }`}
            >
              {aiLoading ? (
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> Generating...
                </div>
              ) : (
                "Ask AI"
              )}
            </button>
          </form>

          {/* Error Message */}
          {aiError && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-rose-50 text-rose-700 rounded-lg flex items-center gap-2 sm:gap-3 animate-fade-in">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <p className="text-xs sm:text-sm">{aiError}</p>
            </div>
          )}

          {/* AI Response */}
          {aiResponse && (
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-slate-50 p-4 sm:p-5 rounded-lg border border-slate-100">
                <h3 className="font-semibold text-base sm:text-lg text-slate-800 mb-3 sm:mb-4">
                  AI Response
                </h3>
                {renderResponse(aiResponse)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Planner;