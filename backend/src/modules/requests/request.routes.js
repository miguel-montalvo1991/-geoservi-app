import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";
import { createRequest, getMyRequests } from "./request.controller.js";

const router = Router();

router.post("/", requireAuth, requireRole("cliente"), createRequest);
router.get("/mine", requireAuth, requireRole("cliente"), getMyRequests);

export default router;
