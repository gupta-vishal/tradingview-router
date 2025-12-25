import { z } from "zod";

export const tradingViewSchema = z.object({
  symbol: z.string().min(1),
  side: z.enum(["buy", "sell", "long", "short"]).transform((v) =>
    v === "long" ? "buy" : v === "short" ? "sell" : v
  ),
  qty: z.number().positive(),
  price: z.number().optional(),
  order_id: z.string().optional(),
  timestamp: z.string().optional()
});