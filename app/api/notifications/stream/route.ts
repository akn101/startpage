// SSE stream replaced with polling via /api/notifications/recent
// Kept as 410 Gone so old clients fail fast rather than reconnect-looping
export async function GET() {
  return new Response(null, { status: 410 });
}
