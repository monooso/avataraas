// @ts-nocheck Disable type checking; we're testing the runtime behavior.

import { assertEquals } from "std/assert/mod.ts";
import { buildRequest } from "../helpers.ts";
import { server } from "../../lib/server.ts";

Deno.test("GET /", async (t) => {
  await t.step("it returns a png", async () => {
    const request = buildRequest({ params: { format: "png" } });
    const response = await server(request);
    assertEquals(response.status, 200);
    assertEquals(response.headers.get("Content-Type"), "image/png");
  });

  await t.step("it returns an svg", async () => {
    const request = buildRequest({ params: { format: "svg" } });
    const response = await server(request);
    assertEquals(response.status, 200);
    assertEquals(response.headers.get("Content-Type"), "image/svg+xml");
  });

  await t.step(
    "it returns a 400 response if the parameters are invalid",
    async () => {
      const request = buildRequest({ params: { format: "gif" } });
      const response = await server(request);
      assertEquals(response.status, 400);
    },
  );

  await t.step(
    "it returns a 405 response if the method is invalid",
    async () => {
      const request = buildRequest({ method: "POST" });
      const response = await server(request);
      assertEquals(response.status, 405);
    },
  );
});

Deno.test("invalid endpoint", async (t) => {
  await t.step(
    "it returns a 404 response if the endpoint is invalid",
    async () => {
      const request = buildRequest({ path: "/invalid" });
      const response = await server(request);
      assertEquals(response.status, 404);
    },
  );
});
