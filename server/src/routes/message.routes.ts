import { Router } from "express";

import {
  create,
  list,
  edit,
  remove,
  react,
} from "../controllers/message.controller.js";

const router = Router();

router.post("/conversations/:conversationId/messages", create);
router.get("/conversations/:conversationId/messages", list);
router.patch("/messages/:messageId", edit);
router.delete("/messages/:messageId", remove);
router.post("/messages/:messageId/reactions", react);

export default router;