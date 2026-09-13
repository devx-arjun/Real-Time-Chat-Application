import { Router } from "express";

import {
  create,
  createPrivate,
  list,
  getById,
  join,
  joinPrivate,
  leave,
  remove,
  listMyPrivateConversations,
} from "../controllers/conversation.controller.js";

const router = Router();

router.post("/spaces/:spaceId/conversations", create);

router.get("/spaces/:spaceId/conversations", list);

router.post("/conversations/private", createPrivate);

router.post("/conversations/join", joinPrivate);

router.get("/conversations/private", listMyPrivateConversations);

router.get("/conversations/:conversationId", getById);

router.post("/conversations/:conversationId/join", join);

router.post("/conversations/:conversationId/leave", leave);

router.delete("/conversations/:conversationId", remove);

export default router;