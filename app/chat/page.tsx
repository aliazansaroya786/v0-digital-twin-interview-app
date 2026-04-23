"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InterviewSession, InterviewAnswer, ChatMessage } from "@/lib/types";

export default function ChatPage() {
  const router = useRouter();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session and load welcome message
  useEffect(() => {
    const storedSession = sessionStorage.getItem("interviewSession");

    if (!storedSession) {
      router.push("/setup");
      return;
    }

    try {
      const parsedSession = JSON.parse(storedSession) as InterviewSession;
      setSession(parsedSession);

      // Add welcome message
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Thank you for completing the interview, ${parsedSession.candidateName}! Now you can ask me any questions about Ali Azan. Feel free to explore topics like leadership philosophy, innovation strategies, career insights, or anything else you'd like to know. When you're ready, you can generate your interview report.`,
          timestamp: Date.now(),
        },
      ]);
    } catch (err) {
      console.error("Error parsing session:", err);
      router.push("/setup");
    }
  }, [router]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || !session) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      // Call streaming API with user question
      const response = await fetch("/api/interview/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: inputValue }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      // Stream the response
      let assistantContent = "";
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const assistantMessageId = `assistant-${Date.now()}`;

      // Add empty assistant message to be filled with streamed content
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantContent += chunk;

        // Update the assistant message with new content
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: assistantContent }
              : msg
          )
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      console.error("Chat error:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!session) return;

    // Update session with completion timestamp and chat messages
    const updatedSession = {
      ...session,
      completedAt: Date.now(),
      chatMessages: messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
    };

    sessionStorage.setItem("interviewSession", JSON.stringify(updatedSession));
    router.push("/results");
  };

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col px-4 py-6">
      <div className="max-w-2xl mx-auto w-full flex flex-col h-screen">
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-slate-700">
          <h1 className="text-3xl font-bold text-white mb-2">Chat with Ali Azan</h1>
          <p className="text-slate-400">
            Ask any questions about Ali Azan. Your interview responses are saved and you can generate your report whenever you&apos;re ready.
          </p>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-4 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-200 px-4 py-3 rounded-lg rounded-bl-none border border-slate-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <span className="text-sm text-slate-400">Thinking...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-start">
              <div className="bg-red-900/20 border border-red-700 text-red-200 px-4 py-3 rounded-lg rounded-bl-none text-sm">
                Error: {error}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="space-y-4 border-t border-slate-700 pt-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question about Ali Azan..."
              disabled={isLoading}
              className="flex-1 bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-600 disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg disabled:opacity-50"
            >
              Send
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleGenerateReport}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg"
            >
              Generate Report & Download PDF
            </Button>
            <Button
              type="button"
              onClick={() => {
                sessionStorage.removeItem("interviewSession");
                router.push("/");
              }}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg"
            >
              Start Over
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
