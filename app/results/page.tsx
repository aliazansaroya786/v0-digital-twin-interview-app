"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InterviewSession } from "@/lib/types";

export default function ResultsPage() {
  const router = useRouter();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isExporting, setIsExporting] = useState(false);

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

  const generatePDF = async () => {
    if (!session) return;

    setIsExporting(true);

    try {
      // Dynamically import html2pdf only in the browser
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default || html2pdfModule;
      
      const element = document.getElementById("pdf-content");
      if (!element) {
        throw new Error("Report content not found");
      }

      const filename = `interview-report-${new Date().toISOString().split("T")[0]}.pdf`;

      const options = {
        margin: 10 as const,
        filename: filename,
        image: { type: "png" as const, quality: 0.98 },
        html2canvas: { scale: 2, logging: false },
        jsPDF: { orientation: "portrait" as const, unit: "mm" as const, format: "a4" as const },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      // Call html2pdf with proper chaining
      await html2pdf().set(options).from(element).save();
    } catch (error) {
      console.error("[v0] PDF generation error:", error);
      alert("Failed to generate PDF. Please try again. Error: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsExporting(false);
    }
  };

  if (!session) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </main>
    );
  }

  const totalTime = session.completedAt
    ? Math.round((session.completedAt - session.startedAt) / 60000)
    : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Interview Report - Ali Azan</h1>
          <p className="text-slate-400">
            {session.jobTitle} Interview Results
          </p>
        </div>

        {/* Interview Details */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Interviewer</p>
              <p className="text-lg font-semibold text-white">{session.interviewerName}</p>
              <p className="text-slate-400 text-sm">{session.interviewerEmail}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Company / Office</p>
              <p className="text-lg font-semibold text-white">{session.officeName}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Position</p>
              <p className="text-lg font-semibold text-white">{session.jobTitle}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Date</p>
              <p className="text-lg font-semibold text-white">
                {new Date(session.startedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Standard Questions</p>
            <p className="text-2xl font-bold text-white">{session.answers.length}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Additional Questions</p>
            <p className="text-2xl font-bold text-white">{session.additionalQuestions?.length || 0}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Time Taken</p>
            <p className="text-2xl font-bold text-white">{totalTime} mins</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Completion Date</p>
            <p className="text-2xl font-bold text-white">
              {new Date(session.completedAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* PDF Content for Export */}
        <div id="pdf-content" className="bg-white p-8 rounded-lg" style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Digital Twin Interview Report
            </h1>
            <p className="text-gray-600">
              Interview with Ali Azan&apos;s Digital Twin
            </p>
          </div>

          {/* Interview Info */}
          <div className="mb-8 border-b pb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Interview Details</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Interviewer:</strong> {session.interviewerName}
              </p>
              <p>
                <strong>Email:</strong> {session.interviewerEmail}
              </p>
              <p>
                <strong>Company/Office:</strong> {session.officeName}
              </p>
              <p>
                <strong>Position:</strong> {session.jobTitle}
              </p>
              <p>
                <strong>Job Description:</strong> {session.jobDescription}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(session.startedAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Duration:</strong> {totalTime} minutes
              </p>
            </div>
          </div>

          {/* Answers */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Interview Responses</h2>
            <div className="space-y-8">
              {session.answers.map((answer, index) => (
                <div key={answer.questionId} className="border-b pb-8">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">
                      {answer.category}
                    </span>
                    <p className="text-xs text-gray-500">Question {index + 1}</p>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {answer.questionText}
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {answer.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Questions */}
          {session.additionalQuestions && session.additionalQuestions.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Questions</h2>
              <div className="space-y-8">
                {session.additionalQuestions.map((qa, index) => (
                  <div key={index} className="border-b pb-8">
                    <p className="text-xs text-gray-500 mb-2">Additional Question {index + 1}</p>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {qa.question}
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {qa.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-8 border-t text-center text-gray-500 text-sm">
            <p>This report was generated by the Digital Twin Interview Platform</p>
            <p>{new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* Answers Preview */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Your Answers</h2>
          <div className="space-y-6">
            {session.answers.map((answer, index) => (
              <div key={answer.questionId} className="border-b border-slate-700 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
                    {answer.category}
                  </span>
                  <p className="text-xs text-slate-500">Question {index + 1}</p>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {answer.questionText}
                </h3>
                <p className="text-slate-300 leading-relaxed line-clamp-3">
                  {answer.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Questions */}
        {session.additionalQuestions && session.additionalQuestions.length > 0 && (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">
              Additional Questions ({session.additionalQuestions.length})
            </h2>
            <div className="space-y-6">
              {session.additionalQuestions.map((qa, index) => (
                <div key={index} className="border-b border-slate-700 pb-6 last:border-0">
                  <p className="text-sm text-slate-400 mb-2">Question {index + 1}</p>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {qa.question}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {qa.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 flex-col sm:flex-row">
          <Button
            onClick={generatePDF}
            disabled={isExporting}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3"
          >
            {isExporting ? "Generating PDF..." : "Download Report (PDF)"}
          </Button>
          <Button
            onClick={() => {
              sessionStorage.removeItem("interviewSession");
              router.push("/");
            }}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3"
          >
            Start New Interview
          </Button>
        </div>
      </div>
    </main>
  );
}
