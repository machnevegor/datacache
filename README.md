## Problem

Imagine that you need to make an API, one of the purposes of which, for example,
is to give user data.

```ts
interface User {
  id: number;
  // ...
}
```

To do this, you would probably create a handler that fetches user data from the
database.

```ts
const fetchUser = async (id: number): Promise<User> => {
  // ...
};
```

The following becomes obvious:

- the number of queries for the same user can be high at some moment in time;
- updates are generally rare (but not ruled out), so you get the same data.

## Solution

Why not cache the data as soon as it is fetched? That's exactly what this module
does.

## Usage

Import the DataCache class and pass in a function that will fetch data using a
**unique key**, and a storage that will keep the results of fetching.

```ts
import { DataCache } from "https://deno.land/x/datacache@0.1.0/mod.ts";

const cache = new DataCache<number, User>(
    fetchUser,
    new Map();
);
```

Now let's get the data of one of the users.

```ts
await cache.load(user_id); // data
```

If you then try to get the same user's data again, you will get a cached result.

```ts
await cache.load(user_id); // cached data
```

But what does a cached result really mean? Let's try to fetch the data of a
non-existent user.

```ts
await cache.load(wrong_id); // error
await cache.load(wrong_id); // cached error
```

As you can see, not only the finite values are cached, but also the errors.

## Features

Suppose the result is already cached. What if the data in the database needs to
be updated? How to synchronize them with the cache? Use a special update method.

```ts
cache.update(unique_key, updated_data);
```

What if the record no longer exists in the database and is irrelevant? Use the
delete method.

```ts
cache.delete(unique_key);
```

You can also use your own storage with more functionality and efficiency than
Map.

```ts
import type { Cache, Result } from "https://deno.land/x/datacache@0.1.0/mod.ts";

interface Cached<Value> {
  value: Value;
  expires: number;
}

class TTLMap<Key, Value> implements Cache<Key, Value> {
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

const storage = new TTLMap<number, Result<User>>(60 * 60 * 1000);
```
