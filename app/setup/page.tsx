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
    interviewerOffice: "",
    jobTitle: "",
    jobDescription: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.interviewerName ||
      !formData.interviewerEmail ||
      !formData.interviewerOffice ||
      !formData.jobTitle ||
      !formData.jobDescription
    ) {
      alert("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    const sessionData = {
      id: `session-${Date.now()}`,
      interviewerName: formData.interviewerName,
      interviewerEmail: formData.interviewerEmail,
      interviewerOffice: formData.interviewerOffice,
      jobTitle: formData.jobTitle,
      jobDescription: formData.jobDescription,
      startedAt: Date.now(),
      answers: [],
    };

    sessionStorage.setItem("interviewSession", JSON.stringify(sessionData));

    setTimeout(() => {
      router.push("/interview");
    }, 100);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Interviewer Details</h1>
          <p className="text-slate-400">
            Enter your information and the role you are interviewing Ali Azan for.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Interviewer section */}
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest pt-2">
            Your information
          </p>

          <div className="space-y-2">
            <label htmlFor="interviewerName" className="block text-sm font-medium text-slate-300">
              Your Full Name
            </label>
            <Input
              id="interviewerName"
              name="interviewerName"
              type="text"
              placeholder="e.g. Sarah Johnson"
              value={formData.interviewerName}
              onChange={handleChange}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="interviewerEmail" className="block text-sm font-medium text-slate-300">
              Your Email Address
            </label>
            <Input
              id="interviewerEmail"
              name="interviewerEmail"
              type="email"
              placeholder="sarah@company.com"
              value={formData.interviewerEmail}
              onChange={handleChange}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="interviewerOffice" className="block text-sm font-medium text-slate-300">
              Company / Office Name
            </label>
            <Input
              id="interviewerOffice"
              name="interviewerOffice"
              type="text"
              placeholder="e.g. Acme Corp — Sydney Office"
              value={formData.interviewerOffice}
              onChange={handleChange}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              required
            />
          </div>

          {/* Job section */}
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest pt-4">
            Role being interviewed for
          </p>

          <div className="space-y-2">
            <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-300">
              Job Title
            </label>
            <Input
              id="jobTitle"
              name="jobTitle"
              type="text"
              placeholder="e.g. Junior Business Analyst"
              value={formData.jobTitle}
              onChange={handleChange}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="jobDescription" className="block text-sm font-medium text-slate-300">
              Job Description
            </label>
            <textarea
              id="jobDescription"
              name="jobDescription"
              rows={5}
              placeholder="Paste the job description here. The AI will tailor all 6 interview answers to this specific role."
              value={formData.jobDescription}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              required
            />
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
