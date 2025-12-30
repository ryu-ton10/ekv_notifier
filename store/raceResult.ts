export type ResultResponse = {
  rank: number;
  name: string;
}

export type Result = {
  name: string;
  score: number;
}

// Per-guild store to support multiple servers concurrently
const store = new Map<string, Result[]>();

const calcScore = (rank: number) => {
  switch (rank) {
    case 1: return 15;
    case 2: return 12;
    case 3: return 10;
    case 4: return 9;
    case 5: return 8;
    case 6: return 7;
    case 7: return 6;
    case 8: return 5;
    case 9: return 4;
    case 10: return 3;
    case 11: return 2;
    case 12: return 1;
    default: return 0;
  }
}

/**
 * Add parsed results (array of {rank,name}) into guild-specific store and return current results
 */
export const addResultsFromResponse = (guildId: string, response: ResultResponse[]): Result[] => {
  if (!guildId) throw new Error('guildId is required');
  const results = store.get(guildId) ?? [];

  for (const item of response) {
    let name = item.name.trim();
    name = name.replace(/ /g, "");
    name = name.replace(/　/g, "");
    const score = calcScore(item.rank);
    const exists = results.find(r => r.name === item.name);
    if (exists) {
      exists.score += score;
    } else {
      results.push({ name: item.name, score });
    }
  }

  store.set(guildId, results);
  return results.slice(); // return a shallow copy
}

export const getResults = (guildId: string): Result[] => {
  return (store.get(guildId) ?? []).slice();
}

export const clearResults = (guildId: string): void => {
  store.delete(guildId);
}