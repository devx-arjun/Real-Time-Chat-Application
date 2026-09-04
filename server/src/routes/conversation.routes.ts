import { Router } from "express";

import {
  create,
  list,
  getById,
  join,
  leave,
} from "../controllers/conversation.controller.js";

const router = Router();

router.post("/spaces/:spaceId/conversations", create);
router.get("/spaces/:spaceId/conversations", list);
router.get("/conversations/:conversationId", getById);
router.post("/conversations/:conversationId/join", join);
router.post("/conversations/:conversationId/leave", leave);

export default router;