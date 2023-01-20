import { ResultType, suppress } from "./deps.ts";

import type { Result } from "./deps.ts";

export type { Result };

export type Fetcher<Key, Model> = (key: Key) => Model | Promise<Model>;

export interface Storage<Key, Value> {
  get(key: Key): Value | undefined;
  set(key: Key, value: Value): void;
  delete(key: Key): void;
}

export class DataCache<Key, Model> {
  private readonly fetcher: Fetcher<Key, Model>;
  private readonly storage: Storage<Key, Result<Model>>;

  constructor(
    fetcher: Fetcher<Key, Model>,
    storage: Storage<Key, Result<Model>>,
  ) {
    this.fetcher = fetcher;
    this.storage = storage;
  }

  async load(key: Key): Promise<Model> {
    const cached = this.storage.get(key);
    if (cached) {
      return this.resolve(cached);
    }

    const result = await suppress(() => this.fetcher(key), Error);

    this.storage.set(key, result);
    return this.resolve(result);
  }

  update(key: Key, value: Model): void {
    this.storage.set(
      key,
      { type: ResultType.SUCCESS, data: value },
    );
  }

  delete(key: Key): void {
    this.storage.delete(key);
  }

  private resolve(result: Result<Model>): Model {
    switch (result.type) {
      case ResultType.SUCCESS:
        return result.data;
      case ResultType.FAILURE:
        throw result.exception;
    }
  }
}
