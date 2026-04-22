"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SetupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[v0] Setup form submitted");

    if (!formData.name || !formData.email || !formData.role) {
      alert("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    // Store in session storage for the interview
    const sessionData = {
      id: `session-${Date.now()}`,
      candidateName: formData.name,
      candidateEmail: formData.email,
      candidateRole: formData.role,
      startedAt: Date.now(),
      answers: [],
    };

    console.log("[v0] Saving session data:", sessionData);
    sessionStorage.setItem("interviewSession", JSON.stringify(sessionData));

    // Navigate to interview
    setTimeout(() => {
      console.log("[v0] Navigating to interview");
      router.push("/interview");
    }, 100);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Your Information</h1>
          <p className="text-slate-400">
            Please provide your details to begin the interview.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-slate-300">
              Full Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-medium text-slate-300">
              Current Role / Title
            </label>
            <Input
              id="role"
              name="role"
              type="text"
              placeholder="e.g., Senior Product Manager"
              value={formData.role}
              onChange={handleChange}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
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
