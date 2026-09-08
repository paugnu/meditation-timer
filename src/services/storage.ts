import AsyncStorage from '@react-native-async-storage/async-storage';
export const STORAGE_KEY = 'meditation-timer:v1';
let writes: Promise<unknown> = Promise.resolve();
export async function readStored(): Promise<{ settings?: unknown; timer?: unknown; history?: unknown; activeSession?: unknown }> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try { const data = JSON.parse(raw); return data && typeof data === 'object' ? data : {}; }
  catch { return {}; }
}
export function writeStored(value: unknown): Promise<void> {
  const serialized = JSON.stringify(value);
  const operation = writes.catch(() => {}).then(() => AsyncStorage.setItem(STORAGE_KEY, serialized));
  writes = operation;
  return operation;
}
