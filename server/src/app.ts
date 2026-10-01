import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import spaceRoutes from "./routes/space.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import messageRoutes from "./routes/message.routes.js";
import guestRoutes from "./routes/guest.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import profileRoutes from "./routes/profile.routes.js";

const app = express();

const allowedOrigin = process.env.CLIENT_URL ?? "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "linkup-server",
  });
});

app.use("/api/spaces", spaceRoutes);
app.use("/api", conversationRoutes);
app.use("/api", messageRoutes);
app.use("/api/guests", guestRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);

export default app;
