import { ResultType, suppress } from "./deps.ts";

import type { Result } from "./deps.ts";

export type Fetch<Key, Model> = (key: Key) => Model | Promise<Model>;

export interface CacheMap<Key, Model> {
  get(key: Key): Result<Model> | undefined;
  set(key: Key, value: Result<Model>): void;
  delete(key: Key): void;
}

export class DataCache<Key, Model> {
  private readonly fetch: Fetch<Key, Model>;
  private readonly cache: CacheMap<Key, Model>;

  constructor(fetch: Fetch<Key, Model>, cache: CacheMap<Key, Model>) {
    this.fetch = fetch;
    this.cache = cache;
  }

  async load(key: Key): Promise<Model> {
    const cached = this.cache.get(key);
    if (cached) {
      return this.resolve(cached);
    }

    const result = await suppress(() => this.fetch(key));

    this.cache.set(key, result);
    return this.resolve(result);
  }

  update(key: Key, value: Model): void {
    this.cache.set(
      key,
      { type: ResultType.SUCCESS, data: value },
    );
  }

  delete(key: Key): void {
    this.cache.delete(key);
  }

  private resolve(result: Result<Model>): Model {
    switch (result.type) {
      case ResultType.SUCCESS:
        return result.data;
      case ResultType.FAILURE:
        throw new Error(result.message);
    }
  }
}
