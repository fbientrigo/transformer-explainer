import { SNAPSHOT_LIMITS, SNAPSHOT_SCHEMA, type ModelSnapshot } from './contract';

function record(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(name + ': objeto inválido');
  return value as Record<string, unknown>;
}
function integer(value: unknown, low: number, high: number, label: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < low || value > high) throw new Error(label + ': entero fuera de límites');
  return value as number;
}
function real(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(label + ': número inválido');
  return value;
}
function label(value: unknown, name: string, max: number): string {
  if (typeof value !== 'string' || value.length > max || !value.length) throw new Error(name + ': texto inválido');
  return value;
}
function array(value: unknown, name: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(name + ': se esperaba una lista');
  return value;
}
/** Validate explicitly. Imported data are never evaluated or inserted as HTML. */
export function parseSnapshot(source: string): ModelSnapshot {
  if (new TextEncoder().encode(source).byteLength > SNAPSHOT_LIMITS.maxFileBytes)
    throw new Error('Archivo demasiado grande: límite 4 MiB');
  let root: Record<string, unknown>;
  try { root = record(JSON.parse(source) as unknown, 'snapshot'); }
  catch { throw new Error('El archivo no es JSON válido'); }
  if (root.schema !== SNAPSHOT_SCHEMA) throw new Error('Formato desconocido: se requiere workshop.snapshot.v1');
  const model = record(root.model, 'model');
  label(model.id, 'model.id', 80);
  label(model.source, 'model.source', 80);
  label(model.tokenizer, 'model.tokenizer', 80);
  if (model.architecture !== 'decoder-transformer') throw new Error('Solo decoder-transformer está implementado');
  const layerCount = integer(model.layers, 1, SNAPSHOT_LIMITS.maxLayers, 'model.layers');
  const heads = integer(model.heads, 1, SNAPSHOT_LIMITS.maxHeads, 'model.heads');
  const dim = integer(model.embeddingDim, 4, 256, 'model.embeddingDim');
  if (dim % heads !== 0) throw new Error('embeddingDim debe ser múltiplo del número de cabezas');
  integer(model.parameterCount, 1, 20_000_000, 'model.parameterCount');
  const input = record(root.input, 'input');
  const tokens = array(input.tokens, 'tokens').map((v) => label(v, 'token', 12));
  const ids = array(input.tokenIds, 'tokenIds').map((v) => integer(v, 0, 1_000_000, 'tokenId'));
  const T = tokens.length;
  if (T < 1 || T > SNAPSHOT_LIMITS.maxTokens || ids.length !== T) throw new Error('Tokens no coinciden o exceden el límite de 64');
  const layers = array(root.layers, 'layers');
  if (layers.length !== layerCount) throw new Error('Número de capas inconsistente');
  for (let l = 0; l < layerCount; l++) {
    const entry = record(layers[l], 'layer');
    if (integer(entry.index, 0, layerCount - 1, 'layer.index') !== l) throw new Error('Índices de capas incorrectos');
    const headsList = array(entry.attention, 'attention');
    if (headsList.length !== heads) throw new Error('Número de cabezas inconsistente');
    for (let h = 0; h < heads; h++) {
      const rows = array(headsList[h], 'attention head');
      if (rows.length !== T) throw new Error('Matriz de atención incompatible con tokens');
      for (let q = 0; q < T; q++) {
        const cells = array(rows[q], 'attention row');
        if (cells.length !== T) throw new Error('La matriz de atención no es cuadrada');
        let sum = 0;
        for (let k = 0; k < T; k++) {
          const w = real(cells[k], 'attention weight');
          if (w < 0 || w > 1) throw new Error('Pesos fuera de [0,1]');
          if (k > q && w > 0.001) throw new Error('Máscara causal incompatible con decoder');
          sum += w;
        }
        if (Math.abs(sum - 1) > 0.02) throw new Error('Cada fila de atención debe sumar aproximadamente 1');
      }
    }
  }
  const output = record(root.output, 'output');
  const candidates = array(output.candidates, 'candidates');
  if (!candidates.length || candidates.length > SNAPSHOT_LIMITS.maxCandidates) throw new Error('Lista de candidatos fuera de límites');
  for (const item of candidates) {
    const candidate = record(item, 'candidate');
    label(candidate.token, 'candidate.token', 12);
    real(candidate.logit, 'candidate.logit');
  }
  label(output.selectedToken, 'selectedToken', 12);
  if (root.training !== undefined) {
    const training = record(root.training, 'training');
    integer(training.steps, 0, 5000, 'training.steps');
    label(training.device, 'training.device', 80);
    const points = array(training.losses, 'training.losses');
    if (points.length > SNAPSHOT_LIMITS.maxTrainingPoints) throw new Error('Historial demasiado grande');
    for (const point of points) {
      const p = record(point, 'loss point');
      integer(p.step, 0, 5000, 'loss step');
      real(p.loss, 'loss');
    }
  }
  return root as unknown as ModelSnapshot;
}
