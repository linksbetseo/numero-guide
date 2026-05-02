export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    keyLength: process.env.ANTHROPIC_API_KEY?.length ?? 0,
    nodeEnv: process.env.NODE_ENV,
  });
}
