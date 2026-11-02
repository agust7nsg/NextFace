export interface PotentialImprovements {
  overall: number;
  jawline: number;
  cheekbones: number;
}

export type BracketTable = Record<string, [number, number, number]>;

export const MASSAGES_BRACKET_TABLE: BracketTable = {
  '0-49': [5, 4, 4],
  '50-59': [5, 4, 4],
  '60-64': [5, 4, 3],
  '65-69': [4, 3, 2],
  '70-79': [3, 3, 2],
  '80-89': [2, 1, 1],
  '90-100': [1, 1, 1],
};

export const ICING_BRACKET_TABLE: BracketTable = {
  '0-49': [4, 3, 3],
  '50-59': [4, 3, 3],
  '60-64': [4, 3, 2],
  '65-69': [3, 2, 1],
  '70-79': [2, 2, 1],
  '80-89': [1, 1, 1],
  '90-100': [1, 1, 1],
};

function getBracket(weakestScore: number, table: BracketTable): [number, number, number] {
  if (weakestScore < 50) return table['0-49'];
  if (weakestScore < 60) return table['50-59'];
  if (weakestScore < 65) return table['60-64'];
  if (weakestScore < 70) return table['65-69'];
  if (weakestScore < 80) return table['70-79'];
  if (weakestScore < 90) return table['80-89'];
  return table['90-100'];
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/**
 * Given three current scores and a bracket table, returns the potential
 * improvement (+N) for each metric.
 *
 * - Metrics are ranked weakest → strongest.
 * - Tie-break priority: jawline > cheekbones > overall.
 * - The increment triplet is selected from the WEAKEST metric's score bracket.
 * - Each improvement is clamped so it never pushes a score above 100.
 */
export function getPotentialImprovements(
  overall: number,
  jawline: number,
  cheekbones: number,
  bracketTable: BracketTable = MASSAGES_BRACKET_TABLE,
): PotentialImprovements {
  const o = clamp(overall);
  const j = clamp(jawline);
  const c = clamp(cheekbones);

  const metrics: { key: 'overall' | 'jawline' | 'cheekbones'; score: number; priority: number }[] = [
    { key: 'overall', score: o, priority: 2 },
    { key: 'jawline', score: j, priority: 0 },
    { key: 'cheekbones', score: c, priority: 1 },
  ];

  metrics.sort((a, b) => a.score - b.score || a.priority - b.priority);

  const weakestScore = metrics[0].score;
  const increments = getBracket(weakestScore, bracketTable);

  const result: PotentialImprovements = { overall: 0, jawline: 0, cheekbones: 0 };

  metrics.forEach((m, i) => {
    const inc = increments[i];
    result[m.key] = Math.max(0, Math.min(inc, 100 - m.score));
  });

  return result;
}
