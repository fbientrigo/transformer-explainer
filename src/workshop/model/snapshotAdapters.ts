import { parseSnapshot } from './parseSnapshot';
import { SNAPSHOT_LIMITS, type ModelSnapshot, type SnapshotAdapter } from './contract';

/** Register additional snapshot formats here. No runtime coupling to a specific model. */
export const snapshotAdapters: readonly SnapshotAdapter[] = [
  { id: 'portable-json-v1', label: 'JSON portable (v1)', parse: parseSnapshot }
];
export async function openLocalSnapshot(file: File, adapter: SnapshotAdapter = snapshotAdapters[0]): Promise<ModelSnapshot> {
  if (file.size > SNAPSHOT_LIMITS.maxFileBytes) throw new Error('Archivo superior a 4 MiB');
  if (!file.name.toLowerCase().endsWith('.json')) throw new Error('Selecciona un archivo JSON');
  const content = await file.text();
  return adapter.parse(content);
}
