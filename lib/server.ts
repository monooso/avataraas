import { generatePng, generateSvg } from "avatar/mod.ts";
import {
  normalizeParams,
  validateEndpoint,
  validateMethod,
  validateParams,
} from "./validator.ts";

function validateRequest(request: Request): Request | Response {
  try {
    // My kingdom for Elixir's with statement.
    const validators = [
      (request: Request) => validateEndpoint(request, "/"),
      (request: Request) => validateMethod(request, "GET"),
      (request: Request) => validateParams(request),
    ];

    return validators.reduce((request, validator) => {
      const [type, result] = validator(request);
      if (type === "ok") {
        return result as Request;
      }
      throw result;
    }, request);
  } catch (response) {
    return response;
  }
}

async function server(request: Request) {
  const validationResult = validateRequest(request);

  if (validationResult instanceof Response) {
    return validationResult;
  }

  const url = new URL(request.url);
  const { format, key, ...params } = normalizeParams(
    Object.fromEntries(url.searchParams),
  );

  if (format === "svg") {
    const svg = await generateSvg(key, params);
    return new Response(svg, { headers: { "Content-Type": "image/svg+xml" } });
  } else {
    const png = await generatePng(key, params);
    return new Response(png, { headers: { "Content-Type": "image/png" } });
  }
}

export { server };
