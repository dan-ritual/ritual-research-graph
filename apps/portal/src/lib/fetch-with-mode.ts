/**
 * Wrapper around fetch that automatically includes the current mode header.
 * Reads mode from the ritual-mode cookie on the client side.
 */
export async function fetchWithMode(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get mode from cookie on client side
  const mode = typeof document !== "undefined" 
    ? document.cookie
        .split("; ")
        .find((row) => row.startsWith("ritual-mode="))
        ?.split("=")[1] || "growth"
    : "growth";

  const headers = new Headers(options.headers);
  headers.set("X-Ritual-Mode", mode);

  return fetch(url, {
    ...options,
    headers,
  });
}
