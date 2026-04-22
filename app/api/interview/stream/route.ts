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

    // Get relevant context from Upstash Vector DB
    const context = await queryUpstashVector(question);

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
          controller.error(error);
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
