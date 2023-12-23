/**
 * Builds a Request object using the given attributes.
 */
function buildRequest(
  attrs: {
    method?: string;
    params?: Record<string, string>;
    path?: string;
  } = {},
): Request {
  const method = attrs.method ?? "GET";
  const params = attrs.params ?? {};
  const path = attrs.path ?? "";

  const url = new URL(path, "http://localhost/");
  url.search = new URLSearchParams(params).toString();
  return new Request(url.toString(), { method });
}

export { buildRequest };
