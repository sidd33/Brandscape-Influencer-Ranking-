'use server';

import { embed } from '@/lib/embeddings';

export async function generateEmbedding(text: string) {
  try {
    return await embed(text);
  } catch (error) {
    console.error('Failed to generate embedding', error);
    return null;
  }
}
