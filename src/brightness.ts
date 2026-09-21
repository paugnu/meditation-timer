export type BrightnessSnapshot = { level: number; system: boolean };
export type BrightnessDriver = {
  capture: () => Promise<BrightnessSnapshot>;
  set: (level: number) => Promise<void>;
  restore: (snapshot: BrightnessSnapshot, dimLevel: number) => Promise<void>;
};

// A late native write must finish before restoration, never after it.
export function brightnessController(driver: BrightnessDriver, failed: () => void) {
  let queue = Promise.resolve(), revision = 0;
  let saved: BrightnessSnapshot | null = null;
  let dimLevel = 0;
  return (dim: boolean) => {
    const request = ++revision;
    queue = queue.then(async () => {
      if (request !== revision) return;
      if (dim) {
        if (saved) return;
        const snapshot = await driver.capture();
        if (request !== revision) return;
        if (!Number.isFinite(snapshot.level) || snapshot.level < 0 || snapshot.level > 1) throw new Error('Invalid brightness');
        saved = snapshot;
        dimLevel = Math.min(snapshot.level, .12);
        await driver.set(dimLevel);
      } else if (saved) {
        await driver.restore(saved, dimLevel);
        saved = null;
      }
    }).catch(failed);
    return queue;
  };
}
