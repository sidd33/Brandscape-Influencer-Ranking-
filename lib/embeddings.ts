export async function embed(text: string): Promise<number[]> {
  const provider = process.env.EMBEDDINGS_PROVIDER || 'openai';
  const apiKey = process.env.EMBEDDINGS_API_KEY;
  
  if (!apiKey) {
    throw new Error('EMBEDDINGS_API_KEY is not set in environment variables');
  }

  if (provider === 'gemini') {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text }] }
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    const embedding = data.embedding.values;
    // Pad to 1536 dimensions to match Supabase pgvector column
    if (embedding.length < 1536) {
      const padded = new Array(1536).fill(0);
      for (let i = 0; i < embedding.length; i++) padded[i] = embedding[i];
      return padded;
    }
    return embedding;
  } else {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.data[0].embedding;
  }
}
