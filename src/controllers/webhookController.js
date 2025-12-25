import { processOrder } from "../services/orderService.js";
import { tradingViewSchema } from "../utils/validation.js";
import { logger } from "../utils/logger.js";


export const receiveAlert = async (req, res) => {
  try {
    const parsed = tradingViewSchema.parse(req.body);
    logger.info({ parsed }, "Validated TradingView payload");

    await processOrder(parsed);

    res.status(200).json({ status: "received" });
  } catch (err) {
    logger.error({ err }, "Webhook error");

    if (err.name === "ZodError") {
      return res.status(400).json({
        error: "invalid_payload",
        details: err.errors
      });
    }

    res.status(500).json({ error: "internal_error" });
  }
};