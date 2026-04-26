"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SetupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    interviewerName: "",
    interviewerEmail: "",
    officeName: "",
    jobTitle: "",
    jobDescription: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { interviewerName, interviewerEmail, officeName, jobTitle, jobDescription } = formData;

    if (!interviewerName || !interviewerEmail || !officeName || !jobTitle || !jobDescription) {
      alert("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    // Store in session storage for the interview
    const sessionData = {
      id: `session-${Date.now()}`,
      interviewerName,
      interviewerEmail,
      officeName,
      jobTitle,
      jobDescription,
      startedAt: Date.now(),
      answers: [],
      additionalQuestions: [],
    };

    sessionStorage.setItem("interviewSession", JSON.stringify(sessionData));

    // Navigate to interview
    setTimeout(() => {
      router.push("/interview");
    }, 100);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Interview Setup</h1>
          <p className="text-slate-400">
            Provide your information and the position details for Ali Azan&apos;s interview.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Interviewer Section */}
          <div className="border-t border-slate-700 pt-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">Interviewer Information</h2>
            
            <div className="space-y-2">
              <label htmlFor="interviewerName" className="block text-sm font-medium text-slate-300">
                Interviewer Name
              </label>
              <Input
                id="interviewerName"
                name="interviewerName"
                type="text"
                placeholder="John Doe"
                value={formData.interviewerName}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="interviewerEmail" className="block text-sm font-medium text-slate-300">
                Email Address
              </label>
              <Input
                id="interviewerEmail"
                name="interviewerEmail"
                type="email"
                placeholder="john@example.com"
                value={formData.interviewerEmail}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="officeName" className="block text-sm font-medium text-slate-300">
                Company / Office Name
              </label>
              <Input
                id="officeName"
                name="officeName"
                type="text"
                placeholder="e.g., Acme Corp"
                value={formData.officeName}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                required
              />
            </div>
          </div>

          {/* Position Section */}
          <div className="border-t border-slate-700 pt-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">Position Details</h2>
            
            <div className="space-y-2">
              <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-300">
                Job Title / Position
              </label>
              <Input
                id="jobTitle"
                name="jobTitle"
                type="text"
                placeholder="e.g., Chief Technology Officer"
                value={formData.jobTitle}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="jobDescription" className="block text-sm font-medium text-slate-300">
                Job Description / Key Responsibilities
              </label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                value={formData.jobDescription}
                onChange={handleChange}
                className="bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-md px-3 py-2 w-full min-h-[100px] resize-none"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2"
          >
            {isLoading ? "Starting..." : "Start Interview"}
          </Button>
        </form>

        {/* Back Link */}
        <button
          onClick={() => router.back()}
          className="w-full text-center text-slate-400 hover:text-slate-300 text-sm"
        >
          ← Back
        </button>
      </div>
    </main>
  );
}
