export async function verifyTradingViewSignature(req) {
  const secret = process.env.TRADINGVIEW_SECRET;
  if (!secret) return false;

  // req.body is already parsed JSON
  if (!req.body) return false;

  return req.body.secret === secret;
}