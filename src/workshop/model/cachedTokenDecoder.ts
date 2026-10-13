// Cached examples already embed the labels for their fifty candidate tokens.
// This avoids requesting GPT-2 tokenizer assets until full inference is enabled.
export interface CachedCandidate { tokenId: number; token: string }
export interface CachedExample { probabilities: CachedCandidate[] }
export function cachedTokenDecoder(example: CachedExample): { decode(ids: number[]): string } {
  const candidates = new Map(example.probabilities.map((item) => [item.tokenId, item.token]));
  return { decode(ids: number[]): string {
    if (ids.length !== 1) throw new Error('Expected a single candidate token');
    const token = candidates.get(ids[0]);
    if (token === undefined) throw new Error('Cached candidate not found; refusing an invented token label');
    return token;
  }};
}
