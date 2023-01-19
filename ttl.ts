import type { Storage } from "./mod.ts";

export interface MapUnit<Value> {
  value: Value;
  expires: number;
}

export class TTLMap<Key, Value> implements Storage<Key, Value> {
  private readonly map: Map<Key, MapUnit<Value>>;
  private readonly ttl: number;

  constructor(ms: number) {
    this.map = new Map();
    this.ttl = ms;
  }

  get(key: Key): Value | undefined {
    const unit = this.map.get(key);
    if (unit) {
      if (unit.expires > Date.now()) {
        return unit.value;
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
