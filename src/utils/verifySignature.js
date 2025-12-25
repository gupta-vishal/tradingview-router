import crypto from "crypto";

export const verifyTradingViewSignature = (req) => {
  const secret = process.env.TRADINGVIEW_SECRET;
  if (!secret) return false;

  const signature = req.headers["x-tradingview-signature"];
  if (!signature) return false;

  const body = JSON.stringify(req.body);

  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return signature === expected;
};