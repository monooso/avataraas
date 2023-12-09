import { generateSvg } from "avatar/mod.ts";

Deno.serve(async (request) => {
  const url = new URL(request.url);
  const key = url.searchParams.get("key") || Date.now().toString();

  const size = url.searchParams.has("size")
    ? Number(url.searchParams.get("size"))
    : 128;

  const svg = await generateSvg(key, { size });

  return new Response(svg, { headers: { "Content-Type": "image/svg+xml" } });
});
