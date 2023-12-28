import { z } from "zod/mod.ts";

const defaultParams = {
  format: "svg",
  key: Date.now().toString(),
  radius: 0,
  size: 64,
};

const paramsSchema = z.object({
  format: z.string().toLowerCase().pipe(z.enum(["svg", "png"])).optional()
    .default(defaultParams.format),
  key: z.string().optional().default(defaultParams.key),
  radius: z.coerce.number().int().min(0).max(1024).optional().default(
    defaultParams.radius,
  ),
  size: z.coerce.number().int().min(8).max(2048).optional().default(
    defaultParams.size,
  ),
});

type ErrorResult = ["error", Response];
type OkResult = ["ok", Request];
type Params = z.infer<typeof paramsSchema>;

const normalizeMethod = (method: string) => method.toUpperCase();
const normalizePath = (path: string) => path.endsWith("/") ? path : `${path}/`;

/**
 * Normalizes the validated avatar parameters. Raises if the parameters are invalid.
 */
function normalizeParams(params: Record<string, string>): Params {
  return paramsSchema.parse(params);
}

/**
 * Validates the request endpoint matches the given endpoint. Ignores trailing slashes.
 */
function validateEndpoint(
  request: Request,
  endpoint: string,
): OkResult | ErrorResult {
  const path = normalizePath(new URL(request.url).pathname);
  endpoint = normalizePath(endpoint);

  if (path === endpoint) {
    return ["ok", request];
  }

  return [
    "error",
    new Response("Not Found", { status: 404, statusText: "Not Found" }),
  ];
}

/**
 * Validates the request method against a list of allowed method(s).
 */
function validateMethod(
  request: Request,
  methods: string | string[],
): OkResult | ErrorResult {
  const requestMethod = normalizeMethod(request.method);
  methods = (Array.isArray(methods) ? methods : [methods]).map(normalizeMethod);

  if (methods.includes(requestMethod)) {
    return ["ok", request];
  }

  return [
    "error",
    new Response("Method Not Allowed", {
      headers: { "Allow": methods.join(", ") },
      status: 405,
      statusText: "Method Not Allowed",
    }),
  ];
}

/**
 * Validates the request search params against the supported avatar parameters.
 */
function validateParams(request: Request): OkResult | ErrorResult {
  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());
  const result = paramsSchema.safeParse(searchParams);

  if (result.success) {
    return ["ok", request];
  }

  return [
    "error",
    new Response("Invalid parameters", {
      status: 400,
      statusText: "Bad Request",
    }),
  ];
}

export {
  normalizeParams,
  type Params,
  validateEndpoint,
  validateMethod,
  validateParams,
};
