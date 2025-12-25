import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(morgan("combined"));

// Routes
import webhookRoutes from "./src/routes/webhookRoutes.js";
app.use("/api/tradingview", webhookRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});