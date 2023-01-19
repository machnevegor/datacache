import type { Cache } from "./mod.ts";

export interface Cached<Value> {
  value: Value;
  expires: number;
}

export class TTLMap<Key, Value> implements Cache<Key, Value> {
  private readonly map: Map<Key, Cached<Value>>;
  private readonly ttl: number;

  constructor(ms: number) {
    this.map = new Map();
    this.ttl = ms;
  }

  get(key: Key): Value | undefined {
    const item = this.map.get(key);
    if (item) {
      if (item.expires > Date.now()) {
        return item.value;
      }
      this.map.delete(key);
    }
    return undefined;
  }

  set(key: Key, value: Value): void {
    const expires = Date.now() + this.ttl;
    this.map.set(key, { value, expires });
  }

  delete(key: Key): void {
    this.map.delete(key);
  }
}
