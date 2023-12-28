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

- `format` (optional): An string representing image format of the generated
  avatar. Supports "png" and "svg". Defaults to "svg".
- `key` (optional): The server will always generate the same avatar for a given
  key. Handy if you want to associate an avatar with a specific username or ID.
- `radius` (optional): An integer representing the corner (in pixels) of the
  generated avatar. Defaults to 0.
- `size` (optional): An integer representing the width and height (in pixels) of
  the generated avatar. Defaults to 64.

See [the OpenAPI definition document](./docs/openapi.yml) for details.

```bash
curl "http://localhost:8000" -o random.svg
curl "http://localhost:8000?key=jimbob&format=png&size=512&radius=10" -o jimbob.png
```

## License

Avatars as a Service is open source software, released under
[the MIT license](./LICENSE.txt).
