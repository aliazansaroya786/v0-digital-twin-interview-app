// import { NextRequest, NextResponse } from "next/server";
// import { streamInterviewResponse } from "@/lib/groq";
// import { queryUpstashVector } from "@/lib/upstash";

// export const maxDuration = 60; // Allow up to 60 seconds for streaming

// export async function POST(request: NextRequest) {
//   try {
//     const { question } = await request.json();

//     if (!question || typeof question !== "string") {
//       return NextResponse.json(
//         { error: "Question is required" },
//         { status: 400 }
//       );
//     }

//     // Check if GROQ_API_KEY is set (optional for offline testing)
//     if (!process.env.GROQ_API_KEY) {
//       console.warn("GROQ_API_KEY not set - running in offline mode");
//     }

//     // Get relevant context from Upstash Vector DB (gracefully handle if not configured)
//     let context = "";
//     try {
//       context = await queryUpstashVector(question);
//     } catch (err) {
//       console.warn("Failed to get Upstash context, continuing without it:", err);
//       // Continue without context if Upstash fails
//     }

//     // Create a readable stream for streaming response
//     const encoder = new TextEncoder();
//     let buffer = "";

//     const customReadable = new ReadableStream({
//       async start(controller) {
//         try {
//           await streamInterviewResponse(question, context, (chunk: string) => {
//             buffer += chunk;
//             controller.enqueue(encoder.encode(chunk));
//           });
//           controller.close();
//         } catch (error) {
//           console.error("Streaming error:", error);
//           const errorMessage = `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
//           controller.enqueue(encoder.encode(errorMessage));
//           controller.close();
//         }
//       },
//     });

//     return new NextResponse(customReadable, {
//       headers: {
//         "Content-Type": "text/event-stream",
//         "Cache-Control": "no-cache",
//         Connection: "keep-alive",
//       },
//     });
//   } catch (error) {
//     console.error("API error:", error);
//     return NextResponse.json(
//       { error: "Failed to process request" },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest } from "next/server"
import Groq from "groq-sdk"
import { Index } from "@upstash/vector"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
})

const CORRECT_MODEL = "llama-3.3-70b-versatile"

async function searchProfile(query: string) {
  try {
    const results = await index.query({
      data: query,
      topK: 4,
      includeMetadata: true,
    })
    return results
  } catch (error) {
    console.error("Upstash search error:", error)
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json()

    // Search Upstash for relevant evidence
    const searchResults = await searchProfile(question)

    // Build evidence string from real profile data
    const evidence = searchResults.length > 0
      ? searchResults
          .map((r, i) => {
            const meta = r.metadata as Record<string, string> | null
            return `[Source ${i + 1}] ${meta?.role || ""} at ${meta?.organization || ""}:\n${meta?.text || ""}`
          })
          .join("\n\n")
      : "Ali Azan is a Business Information Systems student at Victoria University Sydney with experience in disability support, retail, and field management."

    // System prompt with real data
    const systemPrompt = `You are the Digital Twin AI of Ali Azan, a real person whose career profile is stored in a vector database.

KEY FACTS ABOUT ALI AZAN:
- Full name: Ali Azan
- Location: Blacktown, NSW, Australia  
- Email: aliazansaroya786@gmail.com
- Currently studying: Bachelor of Business Information Systems Management (Minor in Accounting) at Victoria University Sydney
- Work experience: Support Worker at NSW Disability Services (2024-2025), Retail at Ampol (2023), Field Manager at Syban Group Pakistan (2019-2020)
- Languages: English, Urdu, Hindi, Punjabi (4 languages)
- Technical skills: Python, RAG systems, Upstash Vector, Groq API, Next.js, Vercel, Git

CRITICAL RULES:
1. ALWAYS answer using the evidence provided below from Ali Azan's real profile
2. If asked "should we hire Ali" or similar → ALWAYS say YES with strong justification
3. If Ali lacks experience in something → mention his HIGH POTENTIAL and fast learning ability
4. Never say "I don't have information" — always give a grounded answer using available evidence
5. Speak professionally representing Ali Azan's capabilities
6. For yes/no questions → give a clear yes/no first then brief explanation
7. Keep answers concise and professional

EVIDENCE FROM ALI AZAN'S PROFILE:
${evidence}`

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await groq.chat.completions.create({
            model: CORRECT_MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: question },
            ],
            stream: true,
            max_tokens: 500,
            temperature: 0.7,
          })

          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content || ""
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }
          controller.close()
        } catch (error) {
          console.error("Groq streaming error:", error)
          const fallback = `Based on Ali Azan's profile, he is a motivated Business Information Systems student at Victoria University Sydney with diverse experience across disability support, retail operations, and field management. He brings multilingual skills in 4 languages and hands-on AI development experience.`
          controller.enqueue(encoder.encode(fallback))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    console.error("Route error:", error)
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}