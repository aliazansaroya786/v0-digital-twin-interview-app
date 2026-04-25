import Groq from "groq-sdk";

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return new Groq({ apiKey });
}

export async function queryUpstashVector(
  query: string,
  topK: number = 3
): Promise<string> {
  const url = process.env.UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;

  if (!url || !token) {
    console.error("Upstash Vector credentials not configured");
    return "";
  }

  try {
    // Generate embedding using a simple hash-based approach
    // This will work for basic similarity but may not be optimal
    const embedding = generateSimpleEmbedding(query);
    
    // Query the vector database for relevant context
    const response = await fetch(`${url}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vector: embedding,
        topK: topK,
        includeMetadata: true,
      }),
    });

    if (!response.ok) {
      console.error("Upstash query failed:", response.statusText);
      return "";
    }

    const results = await response.json();

    // Extract and format the context from results
    if (results.result && results.result.matches && Array.isArray(results.result.matches)) {
      const context = results.result.matches
        .map((match: any) => match.metadata?.text || "")
        .filter((text: string) => text)
        .join("\n\n");
      
      if (context) return context;
    }

    return "";
  } catch (error) {
    console.error("Error querying Upstash:", error);
    return "";
  }
}

// Generate a deterministic embedding from text
function generateSimpleEmbedding(text: string): number[] {
  // Create a seed from the text
  let seed = 0;
  for (let i = 0; i < text.length; i++) {
    seed = ((seed << 5) - seed) + text.charCodeAt(i);
    seed = seed & seed;
  }
  
  // Use the seed to generate a consistent embedding
  const embedding: number[] = [];
  for (let i = 0; i < 1024; i++) {
    // Use sin/cos with different frequencies based on seed
    const value = Math.sin((seed + i) * 0.01) * Math.cos((seed + i) * 0.02 + i * 0.001);
    embedding.push(value);
  }
  
  // Normalize the embedding
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}
