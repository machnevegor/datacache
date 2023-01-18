## Problem

```ts
interface User {
  id: number;
  // ...
}
```

```ts
import type { Fetch } from "https://deno.land/x/datacache@0.1.0/mod.ts";

const fetchUser: Fetch<number, User> = (id) => {
  // fetch a user from the database
};
```

## Solution

## Usage

```ts
import { DataCache } from "https://deno.land/x/datacache@0.1.0/mod.ts";

const cache = new DataCache<number, User>(
    fetchUser,
    new Map();
);
```

```ts
await cache.load(/* id */); // data
```

```ts
await cache.load(/* id */); // cached data
```

```ts
await cache.load(/* wrong_id */); // error
await cache.load(/* wrong_id */); // cached error
```

## Features

```ts
cache.update(/* id */, /* data */);
```

```ts
cache.delete(/* id */);
```
