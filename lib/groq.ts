import Groq from "groq-sdk";

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return null; // Return null for offline mode
  }
  return new Groq({ apiKey });
}

const DEFAULT_GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export async function streamInterviewResponse(
  question: string,
  context: string,
  onChunk: (chunk: string) => void
): Promise<string> {
  const groq = getGroqClient();
  
  if (!groq) {
    // Offline mode - provide mock response
    const mockResponse = `Thank you for your question: "${question}". 

In offline mode, I can't access my full knowledge base, but I can share that this is a great question that would typically explore important aspects of technology leadership and innovation.

For a complete response, please ensure your GROQ_API_KEY is configured and you have internet connectivity.`;
    
    // Simulate streaming by chunking the response
    const chunks = mockResponse.split(' ');
    for (let i = 0; i < chunks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50)); // Small delay to simulate streaming
      onChunk(chunks[i] + ' ');
    }
    
    return mockResponse;
  }

  let fullResponse = "";

  const stream = await groq.chat.completions.create({
    model: DEFAULT_GROQ_MODEL,
    messages: [
      {
        role: "system",
        content: `You are a digital twin of Ali Azan. You must ONLY answer questions about Ali Azan using the knowledge base provided below.

IMPORTANT: If a question is not about Ali Azan, politely redirect the conversation back to topics related to Ali Azan. You should never answer questions about other people, fictional characters, or topics unrelated to Ali Azan.

Knowledge base about Ali Azan:
${context || "No specific data available. Answer based on your general knowledge about Ali Azan."}

When answering about Ali Azan:
- Draw from the provided context about his career, achievements, leadership philosophy, and insights
- Be authentic, thoughtful, and provide substantive answers
- Keep responses concise but insightful (2-4 paragraphs maximum)
- If you don't have specific information about a topic, say so honestly`,
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
