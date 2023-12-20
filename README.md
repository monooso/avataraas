# Avatars as a Service

A stupid-simple Deno application which generates avatars on demand.
[The avatar module](https://github.com/monooso/avatar) does all of the heavy
lifting.

## Usage

To start the server locally run:

```bash
deno run -A mod.ts
```

Make a request to `http://localhost:8000` to receive a random avatar. The
endpoint accepts the following querystring parameters:

- `key` (optional): The server will always generate the same avatar for a given
  key. Handy if you want to associate an avatar with a specific username or ID.
- `size` (optional): An integer representing the width and height (in pixels) of
  the generated avatar. Defaults to 128.

```bash
curl "http://localhost:8000?key=jimbob&size=512" -o jimbob.svg
```

## License

Avatars as a Service is open source software, released under
[the MIT license](./LICENSE.txt).
