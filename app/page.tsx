"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();

  const handleStartInterview = () => {
    router.push("/setup");
  };

  return (
    <main className="min-h-screen w-full bg-slate-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Digital Twin Interview
          </h1>
          <p className="text-lg text-slate-300">
            Experience an interactive conversation with Ali Azan&apos;s digital twin
          </p>
        </div>

        {/* Description */}
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
          <p className="text-slate-200 leading-relaxed mb-4">
            This platform allows you to conduct a live interview with a digital twin powered by cutting-edge AI technology. Ask questions about leadership, innovation, career insights, and more.
          </p>
          <p className="text-slate-400">
            Your answers will be streamed in real-time and compiled into a personalized PDF report at the end.
          </p>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-2xl mb-2">Target</div>
            <h3 className="text-lg font-semibold text-white mb-2">Structured Interview</h3>
            <p className="text-sm text-slate-400">
              6 carefully curated questions covering leadership, innovation, and vision.
            </p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-2xl mb-2">Lightning</div>
            <h3 className="text-lg font-semibold text-white mb-2">Real-time Streaming</h3>
            <p className="text-sm text-slate-400">
              Watch answers appear in real-time with advanced AI streaming.
            </p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-2xl mb-2">Document</div>
            <h3 className="text-lg font-semibold text-white mb-2">PDF Report</h3>
            <p className="text-sm text-slate-400">
              Download a professional PDF report with all answers and insights.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleStartInterview}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 rounded-lg w-full sm:w-auto"
        >
          Start Interview
        </Button>

        {/* Footer Info */}
        <p className="text-xs text-slate-500">
          This interview takes approximately 5-10 minutes to complete.
        </p>
      </div>
    </main>
  );
}
