import Groq from "groq-sdk";

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set");
  }
  return new Groq({ apiKey });
}

const DEFAULT_GROQ_MODEL = process.env.GROQ_MODEL || "mistral-saba-24b";

export async function streamInterviewResponse(
  question: string,
  context: string,
  onChunk: (chunk: string) => void
): Promise<string> {
  let fullResponse = "";

  const groq = getGroqClient();
  const stream = await groq.chat.completions.create({
    model: DEFAULT_GROQ_MODEL,
    messages: [
      {
        role: "system",
        content: `You are a digital twin of Ali Azan, a seasoned technology executive and entrepreneur. 
        
Your knowledge base:
${context}

Answer interview questions as Ali Azan would, drawing from the provided context about his career, achievements, and insights. 
Be authentic, thoughtful, and provide substantive answers that reflect real experience and expertise.
Keep responses concise but insightful (2-4 paragraphs maximum).`,
      },
      {
        role: "user",
        content: question,
      },
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 1024,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) {
      fullResponse += content;
      onChunk(content);
    }
  }

  return fullResponse;
}
