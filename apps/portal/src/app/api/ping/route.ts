export async function GET() {
  return new Response(JSON.stringify({ pong: true, time: Date.now() }), {
    headers: { "Content-Type": "application/json" },
  });
}
