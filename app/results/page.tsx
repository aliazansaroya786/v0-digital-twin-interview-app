"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InterviewSession, ChatMessage } from "@/lib/types";

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

  const generateDOCX = async () => {
    if (!session) return;

    setIsExporting(true);

    try {
      // Dynamically import docx and file-saver only in the browser
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import("docx");
      const { saveAs } = await import("file-saver");

      const totalTime = session.completedAt
        ? Math.round((session.completedAt - session.startedAt) / 60000)
        : 0;

      const score = Math.min(100, Math.round((session.answers.length / 5) * 100));

      // Build document children
      const children: any[] = [
        // Title
        new Paragraph({
          text: "Digital Twin Interview Report",
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: "Interview with Ali Azan's Digital Twin",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),

        // Candidate Information
        new Paragraph({
          text: "Candidate Information",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Name: ", bold: true }),
            new TextRun(session.candidateName),
          ],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Email: ", bold: true }),
            new TextRun(session.candidateEmail),
          ],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Role: ", bold: true }),
            new TextRun(session.candidateRole),
          ],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Date: ", bold: true }),
            new TextRun(new Date(session.completedAt || Date.now()).toLocaleDateString()),
          ],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Duration: ", bold: true }),
            new TextRun(`${totalTime} minutes`),
          ],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Completion Score: ", bold: true }),
            new TextRun(`${score}/100`),
          ],
          spacing: { after: 400 },
        }),

        // Interview Responses
        new Paragraph({
          text: "Interview Responses",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
      ];

      // Add answers
      session.answers.forEach((answer, index) => {
        children.push(
          new Paragraph({
            text: `${index + 1}. ${answer.questionText}`,
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 50 },
          })
        );
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: "Category: ", bold: true }),
              new TextRun(answer.category),
            ],
            spacing: { after: 50 },
          })
        );
        children.push(
          new Paragraph({
            text: answer.answer,
            spacing: { after: 200 },
          })
        );
      });

      // Add Chat Messages if available
      if (session.chatMessages && session.chatMessages.length > 1) {
        children.push(
          new Paragraph({
            text: "Additional Q&A",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );

        session.chatMessages.slice(1).forEach((message) => {
          if (message.role === "user") {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: "Question: ", bold: true, color: "0000FF" }),
                  new TextRun(message.content),
                ],
                spacing: { after: 100 },
              })
            );
          } else {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: "Response: ", bold: true, color: "008000" }),
                  new TextRun(message.content),
                ],
                spacing: { after: 200 },
              })
            );
          }
        });
      }

      // Footer
      children.push(
        new Paragraph({
          text: `Report generated on: ${new Date().toLocaleString()}`,
          spacing: { before: 400 },
        })
      );

      // Create document
      const doc = new Document({
        sections: [{
          properties: {},
          children: children,
        }],
      });

      // Generate and download
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `interview-report-${new Date().toISOString().split("T")[0]}.docx`);
    } catch (error) {
      console.error("[v0] DOCX generation error:", error);
      alert("DOCX generation failed. Please try downloading as TXT or MD instead.");
    } finally {
      setIsExporting(false);
    }
  };

  const generateTXT = () => {
    if (!session) return;

    const totalTime = session.completedAt
      ? Math.round((session.completedAt - session.startedAt) / 60000)
      : 0;

    const score = Math.min(100, Math.round((session.answers.length / 5) * 100)); // Simple completion score

    let content = `DIGITAL TWIN INTERVIEW REPORT
===============================

Candidate Information:
- Name: ${session.candidateName}
- Email: ${session.candidateEmail}
- Role: ${session.candidateRole}
- Date: ${new Date(session.completedAt || Date.now()).toLocaleDateString()}
- Duration: ${totalTime} minutes
- Completion Score: ${score}/100

Interview Responses:
`;

    session.answers.forEach((answer, index) => {
      content += `
${index + 1}. ${answer.questionText}
   Category: ${answer.category}
   Response: ${answer.answer}
`;
    });

    if (session.chatMessages && session.chatMessages.length > 1) {
      content += `

Additional Q&A:
`;

      session.chatMessages.slice(1).forEach((message) => {
        if (message.role === "user") {
          content += `
Question: ${message.content}
`;
        } else {
          content += `Response: ${message.content}
`;
        }
      });
    }

    content += `

Report generated on: ${new Date().toLocaleString()}
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-report-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateMD = () => {
    if (!session) return;

    const totalTime = session.completedAt
      ? Math.round((session.completedAt - session.startedAt) / 60000)
      : 0;

    const score = Math.min(100, Math.round((session.answers.length / 5) * 100));

    let content = `# Digital Twin Interview Report

## Candidate Information
- **Name:** ${session.candidateName}
- **Email:** ${session.candidateEmail}
- **Role:** ${session.candidateRole}
- **Date:** ${new Date(session.completedAt || Date.now()).toLocaleDateString()}
- **Duration:** ${totalTime} minutes
- **Completion Score:** ${score}/100

## Interview Responses
`;

    session.answers.forEach((answer, index) => {
      content += `
### ${index + 1}. ${answer.questionText}
**Category:** ${answer.category}

${answer.answer}
`;
    });

    if (session.chatMessages && session.chatMessages.length > 1) {
      content += `
## Additional Q&A
`;

      session.chatMessages.slice(1).forEach((message) => {
        if (message.role === "user") {
          content += `
**Question:** ${message.content}
`;
        } else {
          content += `**Response:** ${message.content}
`;
        }
      });
    }

    content += `
---
*Report generated on: ${new Date().toLocaleString()}*
`;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-report-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  const score = Math.min(100, Math.round((session.answers.length / 5) * 100)); // Simple completion score

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Interview Complete</h1>
          <p className="text-slate-400">
            Thank you, {session.candidateName}! Here are your interview results.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Questions Answered</p>
            <p className="text-2xl font-bold text-white">{session.answers.length}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Time Taken</p>
            <p className="text-2xl font-bold text-white">{totalTime} mins</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Completion Score</p>
            <p className="text-2xl font-bold text-green-400">{score}/100</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Completion Date</p>
            <p className="text-2xl font-bold text-white">
              {new Date(session.completedAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* DOCX Content for Export */}
        <div id="docx-content" className="bg-white p-8 rounded-lg hidden">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Digital Twin Interview Report
            </h1>
            <p className="text-gray-600">
              Interview with Ali Azan&apos;s Digital Twin
            </p>
          </div>

          {/* Candidate Info */}
          <div className="mb-8 border-b pb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Candidate Information</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Name:</strong> {session.candidateName}
              </p>
              <p>
                <strong>Email:</strong> {session.candidateEmail}
              </p>
              <p>
                <strong>Role:</strong> {session.candidateRole}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(session.completedAt || Date.now()).toLocaleDateString()}
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

          {/* Chat Messages */}
          {session.chatMessages && session.chatMessages.length > 1 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Q&A</h2>
              <div className="space-y-6">
                {session.chatMessages.slice(1).map((message, index) => (
                  <div key={message.id} className="border-b pb-6">
                    {message.role === "user" ? (
                      <div>
                        <div className="mb-2">
                          <span className="inline-block px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs font-medium">
                            Your Question
                          </span>
                          <p className="text-xs text-gray-500 ml-2">
                            {new Date(message.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {message.content}
                        </h3>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-2">
                          <span className="inline-block px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-medium">
                            Ali Azan's Response
                          </span>
                          <p className="text-xs text-gray-500 ml-2">
                            {new Date(message.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    )}
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

        {/* Chat Messages Preview */}
        {session.chatMessages && session.chatMessages.length > 1 && (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Additional Q&A</h2>
            <div className="space-y-6">
              {session.chatMessages.slice(1).map((message, index) => (
                <div key={message.id} className="border-b border-slate-700 pb-6">
                  {message.role === "user" ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
                          Your Question
                        </span>
                        <p className="text-xs text-slate-500">
                          {new Date(message.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        {message.content}
                      </h3>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-3 py-1 bg-green-600 text-white rounded-full text-xs font-medium">
                          Ali Azan's Response
                        </span>
                        <p className="text-xs text-slate-500">
                          {new Date(message.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-slate-300 leading-relaxed line-clamp-3">
                        {message.content}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 flex-col sm:flex-row">
          <Button
            onClick={generateDOCX}
            disabled={isExporting}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3"
          >
            {isExporting ? "Generating DOCX..." : "Download Report (DOCX)"}
          </Button>
          <Button
            onClick={generateTXT}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            Download Report (TXT)
          </Button>
          <Button
            onClick={generateMD}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3"
          >
            Download Report (MD)
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
