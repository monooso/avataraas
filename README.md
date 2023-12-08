# Avatars as a Service
A stupid-simple Deno application which generates avatars on demand. [The avatar module](https://github.com/monooso/avatar) does all of the heavy lifting.

## Usage
To start the server locally run:

```bash
deno run -A mod.ts
```

Make a request to `http://localhost:8000` to receive a random avatar. You can also provide an optional `key` querystring parameter. The server will always generate the same avatar for a given key, so you can use it with user IDs, usernames, and so forth.

```bash
curl "http://localhost:8000?key=jimbob" -o jimbob.svg
```
