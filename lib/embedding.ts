export async function generateEmbedding(text: string): Promise<number[]> {
  const embeddingServiceUrl = process.env.EMBEDDING_HOST;

  const response = await fetch(`${embeddingServiceUrl}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model: "microsoft/codebert-base",
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate embedding: ${response.statusText}`);
  }

  const data = (await response.json()) as { embedding: number[] };
  return data.embedding;
}
