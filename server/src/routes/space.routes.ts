import { Router } from "express";

import {
  create,
  getById,
  join,
  leave,
  list,
  discover,
  remove,
} from "../controllers/space.controller.js";

const router = Router();

router.post("/", create);

router.get("/", list);

router.get("/discover", discover);

router.get("/:spaceId", getById);

router.post("/:spaceId/join", join);

router.post("/:spaceId/leave", leave);

router.delete("/:spaceId", remove);

export default router;