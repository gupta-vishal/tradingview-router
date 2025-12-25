import CircuitBreaker from "opossum";
import { logger } from "./logger.js";

export const createBreaker = (fn) => {
  const breaker = new CircuitBreaker(fn, {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 5000
  });

  breaker.on("open", () => logger.warn("Circuit breaker OPEN"));
  breaker.on("halfOpen", () => logger.info("Circuit breaker HALF-OPEN"));
  breaker.on("close", () => logger.info("Circuit breaker CLOSED"));

  return breaker;
};