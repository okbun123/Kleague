export type RandomSeed = string | number;

function hashSeed(seed: RandomSeed): number {
  const seedText = String(seed);
  let hash = 2166136261;

  for (let index = 0; index < seedText.length; index += 1) {
    hash ^= seedText.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export class SeededRandom {
  private state: number;

  constructor(seed: RandomSeed) {
    this.state = hashSeed(seed);
  }

  next(): number {
    this.state += 0x6d2b79f5;
    let value = this.state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(minInclusive: number, maxInclusive: number): number {
    const span = maxInclusive - minInclusive + 1;
    return minInclusive + Math.floor(this.next() * span);
  }

  nextFloat(minInclusive: number, maxExclusive: number): number {
    return minInclusive + this.next() * (maxExclusive - minInclusive);
  }

  chance(probability: number): boolean {
    return this.next() < probability;
  }

  pick<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error("Cannot pick from an empty array.");
    }

    return items[this.nextInt(0, items.length - 1)] as T;
  }

  shuffle<T>(items: readonly T[]): T[] {
    const copy = [...items];

    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = this.nextInt(0, index);
      const current = copy[index] as T;
      copy[index] = copy[swapIndex] as T;
      copy[swapIndex] = current;
    }

    return copy;
  }
}

export function createSeededRandom(seed: RandomSeed): SeededRandom {
  return new SeededRandom(seed);
}
