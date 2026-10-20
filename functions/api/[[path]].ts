// Proxies /api/* to the backend so the browser only ever talks to this
// origin. That keeps the httpOnly session cookie first-party (Safari and
// others block third-party cookies) and needs no CORS.
interface Env {
  BACKEND_URL?: string;
}

const DEFAULT_BACKEND_URL = "https://ppl-testing.up.railway.app";

export const onRequest = async ({
  request,
  env,
}: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const incoming = new URL(request.url);
  const target = new URL(
    incoming.pathname + incoming.search,
    env.BACKEND_URL || DEFAULT_BACKEND_URL
  );

  const headers = new Headers(request.headers);
  headers.delete("host");

  const response = await fetch(target.toString(), {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    redirect: "manual",
  });

  return new Response(response.body, response);
};
