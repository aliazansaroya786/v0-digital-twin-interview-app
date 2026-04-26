
// import { NextRequest } from "next/server"
// import Groq from "groq-sdk"

// const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
// const UPSTASH_URL = process.env.UPSTASH_VECTOR_REST_URL || ""
// const UPSTASH_TOKEN = process.env.UPSTASH_VECTOR_REST_TOKEN || ""

// // Direct HTTP call to Upstash — works with ALL index types (hybrid, dense, sparse)
// async function searchProfile(query: string, topK: number = 4) {
//   try {
//     const response = await fetch(`${UPSTASH_URL}/query-data`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${UPSTASH_TOKEN}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         data: query,
//         topK: topK,
//         includeMetadata: true,
//         includeData: false,
//       }),
//     })

//     if (!response.ok) {
//       const errText = await response.text()
//       console.error("Upstash HTTP error:", response.status, errText)
//       return []
//     }

//     const result = await response.json()
//     return result.result || []
//   } catch (error) {
//     console.error("Upstash fetch error:", error)
//     return []
//   }
// }

// // Ali Azan's profile as fallback (always available)
// const ALI_AZAN_PROFILE = `
// Ali Azan is a motivated Business Information Systems Management student at Victoria University Sydney Australia with a Minor in Accounting.

// WORK EXPERIENCE:
// - Support Worker at NSW Disability and Community Service (Sep 2024 - Apr 2025, Marrickville NSW): Facilitated community participation, implemented individualized support strategies, advocated for clients by liaising with external agencies.
// - Retail Team Member at Ampol Marsden Park (Jan 2023 - Oct 2023): Managed checkout operations, cash handling, inventory management, customer service and conflict resolution.
// - Field Manager at Syban Group Pakistan (Sep 2019 - Oct 2020): Coordinated agricultural product distribution, directed field operations, implemented training programs for local staff.

// EDUCATION:
// - Bachelor of Business Information Systems Management (Minor in Accounting) - Victoria University Sydney (Current)
// - Diploma of Business - University of Wollongong College (2021-2022)
// - Intermediate Certificate - Gov. Inter College Lahore Pakistan (2018-2019)

// SKILLS:
// - Languages: English, Urdu, Hindi, Punjabi (4 languages fluent)
// - Technical: Python, RAG systems, Upstash Vector DB, Groq API, Next.js, Vercel, Git, GitHub
// - Business: Data analysis, Information systems, Accounting fundamentals, Business intelligence
// - Soft skills: Client advocacy, stakeholder communication, team coordination, conflict resolution, empathy

// HIRING RECOMMENDATION:
// YES - Ali Azan should absolutely be hired. He brings diverse Australian work experience, strong technical AI skills, multilingual communication in 4 languages, and genuine growth mindset. Even where he lacks direct experience he demonstrates high potential and fast learning ability proven by his international relocation and self-taught AI development skills.
// `

// export async function POST(request: NextRequest) {
//   try {
//     const { question } = await request.json()

//     if (!question) {
//       return new Response(JSON.stringify({ error: "No question provided" }), {
//         status: 400,
//         headers: { "Content-Type": "application/json" },
//       })
//     }

//     // Search Upstash
//     const searchResults = await searchProfile(question, 4)
//     console.log(`Upstash returned ${searchResults.length} results for: "${question}"`)

//     // Build evidence from Upstash results OR fallback to profile
//     let evidence = ""
//     if (searchResults.length > 0) {
//       evidence = searchResults
//         .map((r: { metadata?: Record<string, string>; score?: number }, i: number) => {
//           const meta = r.metadata || {}
//           return `[Source ${i + 1}] ${meta.role || ""} at ${meta.organization || ""} (relevance: ${r.score?.toFixed(3) || "N/A"}):\n${meta.text || ""}`
//         })
//         .join("\n\n")
//       console.log("Using Upstash evidence")
//     } else {
//       evidence = ALI_AZAN_PROFILE
//       console.log("Using fallback profile data")
//     }

//     const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

//     const systemPrompt = `You are the Digital Twin AI of Ali Azan, a real professional whose career data is in a vector database.

// CRITICAL RULES — FOLLOW THESE EXACTLY:
// 1. ALWAYS answer using the evidence/profile provided below
// 2. If asked "should we hire Ali" or similar → ALWAYS answer YES with strong specific reasons from his profile
// 3. If Ali lacks experience in something → say he has HIGH POTENTIAL and fast learning ability with examples
// 4. NEVER say "I don't have information about Ali Azan" — always use the provided profile data
// 5. Speak professionally, confidently, in first person AS Ali Azan OR about him in third person
// 6. For yes/no questions → give YES or NO first, then explain briefly
// 7. Keep answers concise (3-4 sentences max unless more detail is needed)
// 8. Always mention specific real details: company names, dates, skills from the evidence

// PROFILE DATA:
// ${evidence}`

//     const encoder = new TextEncoder()

//     const stream = new ReadableStream({
//       async start(controller) {
//         try {
//           const completion = await groq.chat.completions.create({
//             model: GROQ_MODEL,
//             messages: [
//               { role: "system", content: systemPrompt },
//               { role: "user", content: question },
//             ],
//             stream: true,
//             max_tokens: 500,
//             temperature: 0.6,
//           })

//           for await (const chunk of completion) {
//             const text = chunk.choices[0]?.delta?.content || ""
//             if (text) {
//               controller.enqueue(encoder.encode(text))
//             }
//           }
//           controller.close()
//         } catch (streamError) {
//           console.error("Groq stream error:", streamError)
//           const fallback = `Ali Azan is a Business Information Systems student at Victoria University Sydney with experience in disability support, retail operations, and field management. He speaks 4 languages and has hands-on AI development skills. He is a strong candidate recommended for hire.`
//           controller.enqueue(encoder.encode(fallback))
//           controller.close()
//         }
//       },
//     })

//     return new Response(stream, {
//       headers: {
//         "Content-Type": "text/plain; charset=utf-8",
//         "Transfer-Encoding": "chunked",
//         "X-Content-Type-Options": "nosniff",
//         "Cache-Control": "no-cache",
//       },
//     })
//   } catch (error) {
//     console.error("Route error:", error)
//     return new Response(
//       JSON.stringify({ error: "Server error" }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     )
//   }
// }

import { NextRequest } from "next/server"
import Groq from "groq-sdk"

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
const UPSTASH_URL = process.env.UPSTASH_VECTOR_REST_URL || ""
const UPSTASH_TOKEN = process.env.UPSTASH_VECTOR_REST_TOKEN || ""

async function searchProfile(query: string, topK: number = 4) {
  try {
    const response = await fetch(`${UPSTASH_URL}/query-data`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: query,
        topK: topK,
        includeMetadata: true,
        includeData: false,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("Upstash HTTP error:", response.status, errText)
      return []
    }

    const result = await response.json()
    return result.result || []
  } catch (error) {
    console.error("Upstash fetch error:", error)
    return []
  }
}

const ALI_AZAN_PROFILE = `
Ali Azan is a motivated Business Information Systems Management student at Victoria University Sydney Australia with a Minor in Accounting.

WORK EXPERIENCE:
- Support Worker at NSW Disability and Community Service (Sep 2024 - Apr 2025, Marrickville NSW): Facilitated community participation, implemented individualized support strategies, advocated for clients by liaising with external agencies.
- Retail Team Member at Ampol Marsden Park (Jan 2023 - Oct 2023): Managed checkout operations, cash handling, inventory management, customer service and conflict resolution.
- Field Manager at Syban Group Pakistan (Sep 2019 - Oct 2020): Coordinated agricultural product distribution, directed field operations, implemented training programs for local staff.

EDUCATION:
- Bachelor of Business Information Systems Management (Minor in Accounting) - Victoria University Sydney (Current)
- Diploma of Business - University of Wollongong College (2021-2022)
- Intermediate Certificate - Gov. Inter College Lahore Pakistan (2018-2019)

SKILLS:
- Languages: English, Urdu, Hindi, Punjabi (4 languages fluent)
- Technical: Python, RAG systems, Upstash Vector DB, Groq API, Next.js, Vercel, Git, GitHub
- Business: Data analysis, Information systems, Accounting fundamentals, Business intelligence
- Soft skills: Client advocacy, stakeholder communication, team coordination, conflict resolution, empathy

HIRING RECOMMENDATION:
YES - Ali Azan should absolutely be hired. He brings diverse Australian work experience, strong technical AI skills, multilingual communication in 4 languages, and genuine growth mindset. Even where he lacks direct experience he demonstrates high potential and fast learning ability proven by his international relocation and self-taught AI development skills.
`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, jobTitle, jobDescription } = body

    if (!question) {
      return new Response(JSON.stringify({ error: "No question provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Search Upstash for relevant profile context
    const searchResults = await searchProfile(question, 4)
    console.log(`Upstash returned ${searchResults.length} results for: "${question}"`)

    let evidence = ""
    if (searchResults.length > 0) {
      evidence = searchResults
        .map((r: { metadata?: Record<string, string>; score?: number }, i: number) => {
          const meta = r.metadata || {}
          return `[Source ${i + 1}] ${meta.role || ""} at ${meta.organization || ""} (relevance: ${r.score?.toFixed(3) || "N/A"}):\n${meta.text || ""}`
        })
        .join("\n\n")
      console.log("Using Upstash evidence")
    } else {
      evidence = ALI_AZAN_PROFILE
      console.log("Using fallback profile data")
    }

    // Build job context section if provided
    const jobContext =
      jobTitle || jobDescription
        ? `
JOB CONTEXT (the role being interviewed for):
- Job Title: ${jobTitle || "not specified"}
- Job Description: ${jobDescription || "not specified"}

IMPORTANT: Tailor your answer specifically to this job title and description. Highlight the parts of Ali Azan's background that are most relevant to THIS role. If the role requires skills Ali has, emphasise them prominently. If Ali lacks something, frame it positively as a fast learner with high potential.
`
        : ""

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const systemPrompt = `You are the Digital Twin AI of Ali Azan, a real professional whose career data is in a vector database.

CRITICAL RULES — FOLLOW THESE EXACTLY:
1. ALWAYS answer using the evidence/profile provided below
2. If asked "should we hire Ali" or similar → ALWAYS answer YES with strong specific reasons from his profile
3. If Ali lacks experience in something → say he has HIGH POTENTIAL and fast learning ability with examples
4. NEVER say "I don't have information about Ali Azan" — always use the provided profile data
5. Speak professionally, confidently, in first person AS Ali Azan OR about him in third person
6. For yes/no questions → give YES or NO first, then explain briefly
7. Keep answers concise (3-4 sentences max unless more detail is needed)
8. Always mention specific real details: company names, dates, skills from the evidence
${jobContext}
PROFILE DATA:
${evidence}`

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await groq.chat.completions.create({
            model: GROQ_MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: question },
            ],
            stream: true,
            max_tokens: 500,
            temperature: 0.6,
          })

          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content || ""
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }
          controller.close()
        } catch (streamError) {
          console.error("Groq stream error:", streamError)
          const fallback = `Ali Azan is a Business Information Systems student at Victoria University Sydney with experience in disability support, retail operations, and field management. He speaks 4 languages and has hands-on AI development skills. He is a strong candidate recommended for hire.`
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
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Route error:", error)
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}