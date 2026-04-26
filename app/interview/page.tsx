"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DEFAULT_QUESTIONS, InterviewAnswer, InterviewSession } from "@/lib/types";

export default function InterviewPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedSession = sessionStorage.getItem("interviewSession");

    if (!storedSession) {
      router.push("/setup");
      return;
    }

    try {
      const parsedSession = JSON.parse(storedSession) as InterviewSession;
      setSession(parsedSession);
    } catch (error) {
      console.error("Error parsing session:", error);
      router.push("/setup");
    }
  }, [router]);

  const currentQuestion = DEFAULT_QUESTIONS[currentQuestionIndex];

  const handleStreamAnswer = useCallback(async () => {
    if (!currentQuestion || isStreaming || !session) return;

    setIsStreaming(true);
    setCurrentAnswer("");
    setError(null);

    try {
      const response = await fetch("/api/interview/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion.text,
          jobTitle: session.jobTitle,
          jobDescription: session.jobDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setCurrentAnswer((prev) => prev + chunk);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Streaming error:", errorMessage);
      setError(errorMessage);
      setCurrentAnswer("");
    } finally {
      setIsStreaming(false);
    }
  }, [currentQuestion, isStreaming, session]);

  const handleNext = () => {
    if (!currentAnswer.trim()) {
      alert("Please generate an answer before proceeding.");
      return;
    }

    const newAnswer: InterviewAnswer = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      answer: currentAnswer,
      category: currentQuestion.category,
      timestamp: Date.now(),
    };

    setAnswers((prev) => [...prev, newAnswer]);

    if (currentQuestionIndex < DEFAULT_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setCurrentAnswer("");
    } else {
      const completedSession: InterviewSession = {
        ...session!,
        answers: [...answers, newAnswer],
      };
      sessionStorage.setItem("interviewSession", JSON.stringify(completedSession));
      router.push("/chat");
    }
  };

  if (!session) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Interview</h1>
              <p className="text-slate-400 text-sm mt-1">
                Role: <span className="text-blue-400 font-medium">{session.jobTitle}</span>
                {" · "}{session.interviewerOffice}
              </p>
            </div>
            <span className="text-sm text-slate-400">
              Question {currentQuestionIndex + 1} of {DEFAULT_QUESTIONS.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / DEFAULT_QUESTIONS.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
              {currentQuestion.category}
            </div>
            <h2 className="text-2xl font-bold text-white">{currentQuestion.text}</h2>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <p className="text-red-200 text-sm">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Answer Display Area */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 min-h-48">
          {currentAnswer ? (
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                {currentAnswer}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <p className="text-center">
                {isStreaming
                  ? "Generating response..."
                  : "Click below to generate an answer from the digital twin"}
              </p>
            </div>
          )}

          {isStreaming && (
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              <span className="text-sm text-slate-400">Streaming response...</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleStreamAnswer}
            disabled={isStreaming || (!!currentAnswer && !error)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3"
          >
            {isStreaming
              ? "Generating..."
              : currentAnswer && !error
              ? "Regenerate Answer"
              : "Generate Answer"}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!currentAnswer || isStreaming || !!error}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            {currentQuestionIndex < DEFAULT_QUESTIONS.length - 1
              ? "Next Question"
              : "Finish Interview"}
          </Button>
        </div>
      </div>
    </main>
  );
}
