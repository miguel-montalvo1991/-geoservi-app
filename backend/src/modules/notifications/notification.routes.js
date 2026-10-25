import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";
import { getMyNotifications, markNotificationRead } from "./notification.controller.js";

const router = Router();

router.get("/mine", requireAuth, requireRole("prestador"), getMyNotifications);
router.patch("/:id/read", requireAuth, requireRole("prestador"), markNotificationRead);

export default router;
