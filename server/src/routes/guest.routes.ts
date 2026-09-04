import { Router } from "express";
import {
  createGuestController,
  getCurrentGuestController,
  getGuestController,
} from "../controllers/guest.controller.js";

const router = Router();

router.post("/", createGuestController);
router.get("/me", getCurrentGuestController);
router.get("/:guestId", getGuestController);

export default router;
