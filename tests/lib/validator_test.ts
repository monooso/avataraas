// @ts-nocheck Disable type checking; we're testing the runtime behavior.

import {
  assertAlmostEquals,
  assertEquals,
  assertFalse,
  assertInstanceOf,
  assertObjectMatch,
  assertThrows,
} from "std/assert/mod.ts";
import { buildRequest } from "../helpers.ts";
import {
  normalizeParams,
  validateEndpoint,
  validateMethod,
  validateParams,
} from "../../lib/validator.ts";

Deno.test("normalizeParams/1", async (t) => {
  await t.step("it returns the parsed parameters", () => {
    const input = { format: "png", key: "jimbob", radius: 48, size: 256 };
    const result = normalizeParams(input);
    assertEquals(result, input);
  });

  await t.step("it removes unknown parameters", () => {
    const result = normalizeParams({ name: "jimbob" });
    assertFalse(Object.hasOwn(result, "name"));
  });

  await t.step("it raises if the parameters are invalid", () => {
    assertThrows(() => normalizeParams({ format: "gif" }));
  });

  await t.step("it converts the format parameter to lowercase", () => {
    const result = normalizeParams({ format: "PNG" });
    assertObjectMatch(result, { format: "png" });
  });

  await t.step("it uses a default format of 'svg'", () => {
    const result = normalizeParams({});
    assertObjectMatch(result, { format: "svg" });
  });

  await t.step("it uses a default key of the current timestamp", () => {
    const result = normalizeParams({});
    assertAlmostEquals(Number.parseInt(result.key), Date.now(), 100);
  });

  await t.step("it coerces the radius parameter to the correct type", () => {
    const result = normalizeParams({ radius: "48" });
    assertObjectMatch(result, { radius: 48 });
  });

  await t.step("it uses a default radius of 0", () => {
    const result = normalizeParams({});
    assertObjectMatch(result, { radius: 0 });
  });

  await t.step("it coerces the size parameter to the correct type", () => {
    const result = normalizeParams({ size: "48" });
    assertObjectMatch(result, { size: 48 });
  });

  await t.step("it uses a default size of 64", () => {
    const result = normalizeParams({});
    assertObjectMatch(result, { size: 64 });
  });
});

Deno.test("validateEndpoint/2", async (t) => {
  await t.step(
    "it returns an ['ok', request] tuple if validation passes",
    () => {
      const request = buildRequest({ path: "/" });
      const result = validateEndpoint(request, "/");
      assertEquals(["ok", request], result);
    },
  );

  await t.step("it passes if the endpoints match exactly", () => {
    const request = buildRequest({ path: "/" });
    const result = validateEndpoint(request, "/");
    assertEquals(["ok", request], result);
  });

  await t.step("it passes if the request path has a trailing slash", () => {
    const request = buildRequest({ path: "/" });
    const result = validateEndpoint(request, "");
    assertEquals(["ok", request], result);
  });

  await t.step("it passes if the given path has a trailing slash", () => {
    const request = buildRequest({ path: "" });
    const result = validateEndpoint(request, "/");
    assertEquals(["ok", request], result);
  });

  await t.step(
    "it returns an ['error', response] tuple if validation fails",
    async () => {
      const request = buildRequest({ path: "/invalid" });
      const [type, result] = validateEndpoint(request, "/");

      assertEquals(type, "error");
      assertInstanceOf(result, Response);
      assertEquals(await result.text(), "Not Found");
      assertEquals(result.status, 404);
      assertEquals(result.statusText, "Not Found");
    },
  );
});

Deno.test("validateMethod/2", async (t) => {
  await t.step(
    "it returns an ['ok', request] tuple if validation passes",
    () => {
      const request = buildRequest({ method: "GET" });
      const result = validateMethod(request, "GET");
      assertEquals(["ok", request], result);
    },
  );

  await t.step("it accepts a single valid method", () => {
    const request = buildRequest({ method: "GET" });
    const result = validateMethod(request, "GET");
    assertEquals(["ok", request], result);
  });

  await t.step("it accepts an array of valid methods", () => {
    let request: Request;
    let result: ["ok", Request];
    const methods = ["GET", "HEAD"];

    request = buildRequest({ method: "GET" });
    result = validateMethod(request, methods);
    assertEquals(["ok", request], result);

    request = buildRequest({ method: "HEAD" });
    result = validateMethod(request, methods);
    assertEquals(["ok", request], result);
  });

  await t.step("the validation is case-insensitive", () => {
    const request = buildRequest({ method: "GET" });
    const result = validateMethod(request, "get");
    assertEquals(["ok", request], result);
  });

  await t.step(
    "it returns an ['error', response] tuple if validation fails",
    async () => {
      const request = buildRequest({ method: "POST" });
      const [type, result] = validateMethod(request, ["GET", "HEAD"]);

      assertEquals(type, "error");
      assertInstanceOf(result, Response);
      assertEquals(await result.text(), "Method Not Allowed");
      assertEquals(result.status, 405);
      assertEquals(result.statusText, "Method Not Allowed");
      assertEquals(result.headers.get("Allow"), "GET, HEAD");
    },
  );
});

Deno.test("validateParams/2", async (t) => {
  await t.step(
    "it returns an ['ok', request] tuple if validation passes",
    () => {
      const requestParams = {
        format: "png",
        key: "jimbob",
        radius: 48,
        size: 256,
      };
      const request = buildRequest({ params: requestParams });
      const result = validateParams(request);
      assertEquals(result[0], "ok");
      assertEquals(result[1], request);
    },
  );

  await t.step(
    "it returns an ['error', response] tuple if validation fails",
    async () => {
      const request = buildRequest({ params: { format: "gif" } });
      const [type, result] = validateParams(request);

      assertEquals(type, "error");
      assertInstanceOf(result, Response);
      assertEquals(await result.text(), "Invalid parameters");
      assertEquals(result.status, 400);
      assertEquals(result.statusText, "Bad Request");
    },
  );

  await t.step("it passes if there are no search parameters", () => {
    const request = buildRequest();
    const result = validateParams(request);
    assertEquals(result[0], "ok");
  });

  await t.step("the format parameter is case-insensitive", () => {
    let request, result;

    // PNG.
    request = buildRequest({ params: { format: "png" } });
    result = validateParams(request);
    assertEquals(result[0], "ok");

    request = buildRequest({ params: { format: "PNG" } });
    result = validateParams(request);
    assertEquals(result[0], "ok");

    // SVG.
    request = buildRequest({ params: { format: "svg" } });
    result = validateParams(request);
    assertEquals(result[0], "ok");

    request = buildRequest({ params: { format: "SVG" } });
    result = validateParams(request);
    assertEquals(result[0], "ok");
  });

  await t.step("it fails if the format parameter is invalid", () => {
    const request = buildRequest({ params: { format: "gif" } });
    const [type, result] = validateParams(request);
    assertEquals(type, "error");
    assertInstanceOf(result, Response);
  });

  await t.step("it fails if the radius parameter is not a number", () => {
    const request = buildRequest({ params: { radius: "large" } });
    const [type, result] = validateParams(request);
    assertEquals(type, "error");
    assertInstanceOf(result, Response);
  });

  await t.step("it fails if the radius parameter is not an integer", () => {
    const request = buildRequest({ params: { radius: 10.2 } });
    const [type, result] = validateParams(request);
    assertEquals(type, "error");
    assertInstanceOf(result, Response);
  });

  await t.step("it fails if the radius parameter is less than 0", () => {
    const request = buildRequest({ params: { radius: -1 } });
    const [type, result] = validateParams(request);
    assertEquals(type, "error");
    assertInstanceOf(result, Response);
  });

  await t.step("it fails if the radius parameter is greater than 1024", () => {
    const request = buildRequest({ params: { radius: 1025 } });
    const [type, result] = validateParams(request);
    assertEquals(type, "error");
    assertInstanceOf(result, Response);
  });

  await t.step("it passes if the radius parameter is a numeric string", () => {
    const request = buildRequest({ params: { radius: "40" } });
    const result = validateParams(request);
    assertEquals(result[0], "ok");
  });

  await t.step("it fails if the size parameter is not a number", () => {
    const request = buildRequest({ params: { size: "large" } });
    const [type, result] = validateParams(request);
    assertEquals(type, "error");
    assertInstanceOf(result, Response);
  });

  await t.step("it fails if the size parameter is not an integer", () => {
    const request = buildRequest({ params: { size: 10.2 } });
    const [type, result] = validateParams(request);
    assertEquals(type, "error");
    assertInstanceOf(result, Response);
  });

  await t.step("it fails if the size parameter is less than 8", () => {
    const request = buildRequest({ params: { size: 7 } });
    const [type, result] = validateParams(request);
    assertEquals(type, "error");
    assertInstanceOf(result, Response);
  });

  await t.step("it fails if the size parameter is greater than 2048", () => {
    const request = buildRequest({ params: { size: 2049 } });
    const [type, result] = validateParams(request);
    assertEquals(type, "error");
    assertInstanceOf(result, Response);
  });

  await t.step("it passes if the size parameter is a numeric string", () => {
    const request = buildRequest({ params: { size: "16" } });
    const result = validateParams(request);
    assertEquals(result[0], "ok");
  });
});
