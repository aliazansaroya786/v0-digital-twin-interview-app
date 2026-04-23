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
    // Query the vector database for relevant context
    const response = await fetch(`${url}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vector: await generateEmbedding(query),
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
    if (results.matches && Array.isArray(results.matches)) {
      return results.matches
        .map((match: any) => match.metadata?.text || "")
        .filter((text: string) => text)
        .join("\n\n");
    }

    return "";
  } catch (error) {
    console.error("Error querying Upstash:", error);
    return "";
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  // Using a simple hash-based embedding for demo
  // In production, you'd use a proper embedding model
  const hash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  };

  // Generate a 384-dimensional embedding (to match Upstash default)
  const embedding: number[] = [];
  const baseHash = hash(text);
  for (let i = 0; i < 384; i++) {
    embedding.push(
      Math.sin((baseHash + i) * 0.001) *
        Math.cos((baseHash + i) * 0.002)
    );
  }
  return embedding;
}
