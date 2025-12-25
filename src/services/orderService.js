import { logger } from "../utils/logger.js";
import { withRetry } from "../utils/retry.js";
import { createBreaker } from "../utils/circuitBreaker.js";

const sendToIronbeam = async (order) => {
  // TODO: actual HTTP call
  logger.info({ order }, "Sending order to Ironbeam");
  return true;
};

const breaker = createBreaker(sendToIronbeam);

export const processOrder = async (payload) => {
  logger.info({ payload }, "Processing order");

  await withRetry(() => breaker.fire(payload));
};
