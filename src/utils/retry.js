import pRetry from "p-retry";
import { logger } from "./logger.js";

export const withRetry = async (fn) => {
  return pRetry(fn, {
    retries: 3,
    factor: 2,
    minTimeout: 200,
    maxTimeout: 2000,
    onFailedAttempt: (error) => {
      logger.warn({
        attempt: error.attemptNumber,
        retriesLeft: error.retriesLeft,
        message: error.message
      }, "Retrying Ironbeam request");
    }
  });
};