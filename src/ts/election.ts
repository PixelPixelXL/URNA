export type ElectionType =
  | "general"
  | "municipal"
  | "presidencial"
  | "governador"
  | "deputado-federal";

export interface ElectionConfig {
  type?: ElectionType;
  place?: string;
  year?: number;
  electorate?: number;
  turnout?: number;
}

export interface Election {
  type: ElectionType;
  place: string;
  year: number;
  electorate: number;
  turnout: number;
  round: number;
  status: "setup";
  createdAt: string;
}

export function createElection(config: ElectionConfig = {}): Election {
  return {
    type: config.type || "general",
    place: config.place || "Brasil",
    year: Number(config.year) || 2026,
    electorate: Number(config.electorate) || 100000,
    turnout: Number(config.turnout) || 0.82,
    round: 1,
    status: "setup",
    createdAt: new Date().toISOString()
  };
}

export function allocateVotes(total: number, weights: number[]): number[] {
  const safeWeights = weights.map(value => Math.max(0, Number(value) || 0));
  const weightSum = safeWeights.reduce((sum, value) => sum + value, 0);

  if (total <= 0 || !safeWeights.length) {
    return safeWeights.map(() => 0);
  }

  const quotas = safeWeights.map(weight =>
    weightSum ? total * weight / weightSum : total / safeWeights.length
  );

  const allocated = quotas.map(Math.floor);
  const remaining = total - allocated.reduce((sum, value) => sum + value, 0);

  const order = quotas
    .map((quota, index) => ({
      index,
      fraction: quota - allocated[index]
    }))
    .sort((a, b) => b.fraction - a.fraction);

  for (let index = 0; index < remaining; index++) {
    allocated[order[index % order.length].index]++;
  }

  return allocated;
}

export function getSecondRoundEligibility(
  type: ElectionType | string,
  electorate: number
): boolean {
  if (type === "deputado-federal") return false;
  return type === "presidencial" || type === "governador" ||
    (type === "municipal" && electorate > 200000);
}
