import { verifyTradingViewSignature } from "../utils/verifySignature.js";

export const verifySignatureMiddleware = (req, res, next) => {
  if (!verifyTradingViewSignature(req)) {
    return res.status(401).json({ error: "invalid_signature" });
  }
  next();
};