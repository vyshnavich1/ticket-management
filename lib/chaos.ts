export type ChaosScenario = 'slow' | 'failure' | 'empty' | 'duplicate' | 'normal';

export function pickChaosScenario(): ChaosScenario {
  const r = Math.random();
  if (r < 0.10) return 'slow';
  if (r < 0.20) return 'failure';
  if (r < 0.30) return 'empty';
  if (r < 0.40) return 'duplicate';
  return 'normal';
}

export async function applyChaos(scenario: ChaosScenario): Promise<void> {
  if (scenario === 'slow') {
    await new Promise((res) => setTimeout(res, 4000));
  }
}
