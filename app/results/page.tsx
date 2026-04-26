"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InterviewSession } from "@/lib/types";

// Ali Azan's fixed details shown as the candidate in the report
const CANDIDATE = {
  name: "Ali Azan",
  email: "aliazansaroya786@gmail.com",
  phone: "0432 986 327",
  location: "Blacktown, NSW",
  degree: "Bachelor of Business Information Systems Management (Minor in Accounting)",
  university: "Victoria University, Sydney",
};

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
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } =
        await import("docx");
      const { saveAs } = await import("file-saver");

      const totalTime = session.completedAt
        ? Math.round((session.completedAt - session.startedAt) / 60000)
        : 0;
      const score = Math.min(100, Math.round((session.answers.length / 6) * 100));

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

        // ── Candidate Information (Ali Azan) ──
        new Paragraph({
          text: "Candidate Information",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Name: ", bold: true }), new TextRun(CANDIDATE.name)],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Email: ", bold: true }), new TextRun(CANDIDATE.email)],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Phone: ", bold: true }), new TextRun(CANDIDATE.phone)],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Location: ", bold: true }), new TextRun(CANDIDATE.location)],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Degree: ", bold: true }), new TextRun(CANDIDATE.degree)],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "University: ", bold: true }), new TextRun(CANDIDATE.university)],
          spacing: { after: 400 },
        }),

        // ── Interviewer Information ──
        new Paragraph({
          text: "Interviewer Information",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Name: ", bold: true }), new TextRun(session.interviewerName)],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Email: ", bold: true }), new TextRun(session.interviewerEmail)],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Company / Office: ", bold: true }), new TextRun(session.interviewerOffice)],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Role Interviewed For: ", bold: true }), new TextRun(session.jobTitle)],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Interview Date: ", bold: true }),
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

        // ── Job Description ──
        new Paragraph({
          text: "Job Description",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          text: session.jobDescription,
          spacing: { after: 400 },
        }),

        // ── Interview Responses ──
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

      // ── Additional Q&A from chat ──
      if (session.chatMessages && session.chatMessages.length > 1) {
        children.push(
          new Paragraph({
            text: "Additional Questions & Answers",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 100 },
          })
        );

        session.chatMessages.slice(1).forEach((message) => {
          if (message.role === "user") {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: "Question: ", bold: true, color: "1D4ED8" }),
                  new TextRun(message.content),
                ],
                spacing: { after: 100 },
              })
            );
          } else {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: "Response: ", bold: true, color: "15803D" }),
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

      const doc = new Document({
        sections: [{ properties: {}, children }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `ali-azan-interview-${session.jobTitle.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.docx`);
    } catch (error) {
      console.error("DOCX generation error:", error);
      alert("DOCX generation failed. Please try TXT or MD instead.");
    } finally {
      setIsExporting(false);
    }
  };

  const generateTXT = () => {
    if (!session) return;

    const totalTime = session.completedAt
      ? Math.round((session.completedAt - session.startedAt) / 60000)
      : 0;
    const score = Math.min(100, Math.round((session.answers.length / 6) * 100));

    let content = `DIGITAL TWIN INTERVIEW REPORT
===============================

CANDIDATE INFORMATION (Ali Azan):
- Name: ${CANDIDATE.name}
- Email: ${CANDIDATE.email}
- Phone: ${CANDIDATE.phone}
- Location: ${CANDIDATE.location}
- Degree: ${CANDIDATE.degree}
- University: ${CANDIDATE.university}

INTERVIEWER INFORMATION:
- Name: ${session.interviewerName}
- Email: ${session.interviewerEmail}
- Company / Office: ${session.interviewerOffice}
- Role Interviewed For: ${session.jobTitle}
- Interview Date: ${new Date(session.completedAt || Date.now()).toLocaleDateString()}
- Duration: ${totalTime} minutes
- Completion Score: ${score}/100

JOB DESCRIPTION:
${session.jobDescription}

INTERVIEW RESPONSES:
`;

    session.answers.forEach((answer, index) => {
      content += `\n${index + 1}. ${answer.questionText}\n   Category: ${answer.category}\n   Response: ${answer.answer}\n`;
    });

    if (session.chatMessages && session.chatMessages.length > 1) {
      content += `\n\nADDITIONAL Q&A:\n`;
      session.chatMessages.slice(1).forEach((message) => {
        if (message.role === "user") {
          content += `\nQuestion: ${message.content}\n`;
        } else {
          content += `Response: ${message.content}\n`;
        }
      });
    }

    content += `\n\nReport generated on: ${new Date().toLocaleString()}\n`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ali-azan-interview-${new Date().toISOString().split("T")[0]}.txt`;
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
    const score = Math.min(100, Math.round((session.answers.length / 6) * 100));

    let content = `# Digital Twin Interview Report

## Candidate Information (Ali Azan)
- **Name:** ${CANDIDATE.name}
- **Email:** ${CANDIDATE.email}
- **Phone:** ${CANDIDATE.phone}
- **Location:** ${CANDIDATE.location}
- **Degree:** ${CANDIDATE.degree}
- **University:** ${CANDIDATE.university}

## Interviewer Information
- **Name:** ${session.interviewerName}
- **Email:** ${session.interviewerEmail}
- **Company / Office:** ${session.interviewerOffice}
- **Role Interviewed For:** ${session.jobTitle}
- **Interview Date:** ${new Date(session.completedAt || Date.now()).toLocaleDateString()}
- **Duration:** ${totalTime} minutes
- **Completion Score:** ${score}/100

## Job Description
${session.jobDescription}

## Interview Responses
`;

    session.answers.forEach((answer, index) => {
      content += `\n### ${index + 1}. ${answer.questionText}\n**Category:** ${answer.category}\n\n${answer.answer}\n`;
    });

    if (session.chatMessages && session.chatMessages.length > 1) {
      content += `\n## Additional Q&A\n`;
      session.chatMessages.slice(1).forEach((message) => {
        if (message.role === "user") {
          content += `\n**Question:** ${message.content}\n`;
        } else {
          content += `**Response:** ${message.content}\n`;
        }
      });
    }

    content += `\n---\n*Report generated on: ${new Date().toLocaleString()}*\n`;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ali-azan-interview-${new Date().toISOString().split("T")[0]}.md`;
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

  // Count additional questions asked in chat (user messages only, skip welcome)
  const additionalQuestionCount = session.chatMessages
    ? session.chatMessages.slice(1).filter((m) => m.role === "user").length
    : 0;
  const totalQuestions = session.answers.length + additionalQuestionCount;

  const score = Math.min(100, Math.round((session.answers.length / 6) * 100));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Interview Complete</h1>
          <p className="text-slate-400">
            Interview for <span className="text-blue-400 font-medium">{session.jobTitle}</span>
            {" "}conducted by <span className="text-slate-300">{session.interviewerName}</span>
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Questions</p>
            <p className="text-2xl font-bold text-white">{totalQuestions}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Time Taken</p>
            <p className="text-2xl font-bold text-white">{totalTime} mins</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Completion</p>
            <p className="text-2xl font-bold text-green-400">{score}/100</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Date</p>
            <p className="text-lg font-bold text-white">
              {new Date(session.completedAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Candidate & Interviewer side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Candidate = Ali Azan */}
          <div className="bg-slate-800 rounded-lg p-5 border border-slate-700 space-y-2">
            <h2 className="text-lg font-bold text-white mb-3">Candidate</h2>
            <p className="text-slate-300 text-sm"><span className="text-slate-500">Name:</span> {CANDIDATE.name}</p>
            <p className="text-slate-300 text-sm"><span className="text-slate-500">Email:</span> {CANDIDATE.email}</p>
            <p className="text-slate-300 text-sm"><span className="text-slate-500">Phone:</span> {CANDIDATE.phone}</p>
            <p className="text-slate-300 text-sm"><span className="text-slate-500">Location:</span> {CANDIDATE.location}</p>
            <p className="text-slate-300 text-sm"><span className="text-slate-500">Degree:</span> {CANDIDATE.degree}</p>
            <p className="text-slate-300 text-sm"><span className="text-slate-500">University:</span> {CANDIDATE.university}</p>
          </div>

          {/* Interviewer */}
          <div className="bg-slate-800 rounded-lg p-5 border border-slate-700 space-y-2">
            <h2 className="text-lg font-bold text-white mb-3">Interviewer</h2>
            <p className="text-slate-300 text-sm"><span className="text-slate-500">Name:</span> {session.interviewerName}</p>
            <p className="text-slate-300 text-sm"><span className="text-slate-500">Email:</span> {session.interviewerEmail}</p>
            <p className="text-slate-300 text-sm"><span className="text-slate-500">Company:</span> {session.interviewerOffice}</p>
            <p className="text-slate-300 text-sm"><span className="text-slate-500">Role:</span> {session.jobTitle}</p>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-3">Job Description</h2>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{session.jobDescription}</p>
        </div>

        {/* Interview Answers */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Interview Responses</h2>
          <div className="space-y-6">
            {session.answers.map((answer, index) => (
              <div key={answer.questionId} className="border-b border-slate-700 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
                    {answer.category}
                  </span>
                  <p className="text-xs text-slate-500">Question {index + 1}</p>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{answer.questionText}</h3>
                <p className="text-slate-300 leading-relaxed line-clamp-3">{answer.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Q&A from chat */}
        {session.chatMessages && session.chatMessages.length > 1 && (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Additional Q&amp;A</h2>
            <div className="space-y-6">
              {session.chatMessages.slice(1).map((message) => (
                <div key={message.id} className="border-b border-slate-700 pb-6">
                  {message.role === "user" ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
                          {session.interviewerName}&apos;s Question
                        </span>
                        <p className="text-xs text-slate-500">
                          {new Date(message.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-3">{message.content}</h3>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-3 py-1 bg-green-600 text-white rounded-full text-xs font-medium">
                          Ali Azan&apos;s Response
                        </span>
                        <p className="text-xs text-slate-500">
                          {new Date(message.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-slate-300 leading-relaxed line-clamp-3">{message.content}</p>
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
