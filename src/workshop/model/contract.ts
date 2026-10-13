/**
 * Stable boundary between a locally trained model and a browser-only presentation.
 * The UI never imports PyTorch, ONNX, or any model framework through this contract.
 */
export const SNAPSHOT_SCHEMA = 'workshop.snapshot.v1' as const;
export interface ModelDescriptor {
  id: string;
  architecture: 'decoder-transformer';
  source: string;
  tokenizer: string;
  layers: number;
  heads: number;
  embeddingDim: number;
  parameterCount: number;
}
export interface Candidate { token: string; logit: number; }
export interface TrainingPoint { step: number; loss: number; }
export interface ModelSnapshot {
  schema: typeof SNAPSHOT_SCHEMA;
  model: ModelDescriptor;
  input: { tokens: string[]; tokenIds: number[] };
  layers: Array<{ index: number; attention: number[][][] }>;
  output: { candidates: Candidate[]; selectedToken: string };
  training?: { steps: number; losses: TrainingPoint[]; device: string };
}
export interface SnapshotAdapter {
  id: string;
  label: string;
  parse(source: string): ModelSnapshot;
}
/**
 * Conservative display limits: full attention is O(layers * heads * tokens²).
 * These are file/interface caps, NOT a guarantee about GPU VRAM.
 */
export const SNAPSHOT_LIMITS = {
  maxFileBytes: 4 * 1024 * 1024,
  maxLayers: 6,
  maxHeads: 12,
  maxTokens: 64,
  maxCandidates: 32,
  maxTrainingPoints: 200
} as const;
