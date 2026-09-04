import "dotenv/config";

import { createServer } from "node:http";

import app from "./app.js";
import { prisma } from "./config/database.js";
import { setupWebSocket } from "./websocket/server.js";

const PORT = Number(process.env.PORT ?? 5000);

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected");
    const server = createServer(app);
    setupWebSocket(server);
    server.listen(PORT, () => {
      console.log(`LinkUp server running on http://localhost:${PORT}`);
      console.log(`WebSocket server running on ws://localhost:${PORT}/ws`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
