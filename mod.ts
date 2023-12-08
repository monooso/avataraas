import { generateSvg } from "https://deno.land/x/avatar@v1.0.0/mod.ts";

Deno.serve(async (request) => {
  const url = new URL(request.url);
  const key = url.searchParams.get("key") || Date.now().toString();
  const svg = await generateSvg(key);

  return new Response(svg, { headers: { "Content-Type": "image/svg+xml" } });
});
