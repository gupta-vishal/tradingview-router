import express from "express";
import { receiveAlert } from "../controllers/webhookController.js";
import { verifySignatureMiddleware } from "../middleware/verifySignatureMiddleware.js";

const router = express.Router();

router.post("/webhook", verifySignatureMiddleware, receiveAlert);

export default router;