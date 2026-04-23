import { NextRequest, NextResponse } from "next/server";
import { streamInterviewResponse } from "@/lib/groq";
import { queryUpstashVector } from "@/lib/upstash";

export const maxDuration = 60; // Allow up to 60 seconds for streaming

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // Check if GROQ_API_KEY is set (optional for offline testing)
    if (!process.env.GROQ_API_KEY) {
      console.warn("GROQ_API_KEY not set - running in offline mode");
    }

    // Get relevant context from Upstash Vector DB (gracefully handle if not configured)
    let context = "";
    try {
      context = await queryUpstashVector(question);
    } catch (err) {
      console.warn("Failed to get Upstash context, continuing without it:", err);
      // Continue without context if Upstash fails
    }

    // Create a readable stream for streaming response
    const encoder = new TextEncoder();
    let buffer = "";

    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          await streamInterviewResponse(question, context, (chunk: string) => {
            buffer += chunk;
            controller.enqueue(encoder.encode(chunk));
          });
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorMessage = `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
          controller.enqueue(encoder.encode(errorMessage));
          controller.close();
        }
      },
    });

    return new NextResponse(customReadable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
