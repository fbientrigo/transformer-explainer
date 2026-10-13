/** Toy logits for teaching; do not misrepresent these as model activations. */
export function temperatureSoftmax(logits: number[], temperature: number): number[] {
  if (!(Number.isFinite(temperature) && temperature > 0)) throw new RangeError('temperature must be positive');
  if (!logits.length || logits.some((x) => !Number.isFinite(x))) throw new RangeError('logits must be finite');
  const scaled = logits.map((x) => x / temperature);
  const max = Math.max(...scaled);
  const values = scaled.map((x) => Math.exp(x - max));
  const sum = values.reduce((a, b) => a + b, 0);
  return values.map((x) => x / sum);
}
