type IdPrefix = "obj" | "anim" | "track";

const counters: Record<IdPrefix, number> = {
  obj: 0,
  anim: 0,
  track: 0
};

export function nextId(prefix: IdPrefix): string {
  counters[prefix] += 1;
  return `${prefix}_${counters[prefix]}`;
}

