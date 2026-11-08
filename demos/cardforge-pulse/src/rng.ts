/** Mulberry32 — deterministic seeded PRNG for runs. */
export function mulberry32(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function seedFromString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export class Rng {
  private next: () => number

  constructor(seed: number) {
    this.next = mulberry32(seed)
  }

  float(): number {
    return this.next()
  }

  int(min: number, max: number): number {
    return Math.floor(this.float() * (max - min + 1)) + min
  }

  pick<T>(arr: readonly T[]): T {
    return arr[this.int(0, arr.length - 1)]
  }

  shuffle<T>(arr: T[]): T[] {
    const out = [...arr]
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.int(0, i)
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
  }
}
