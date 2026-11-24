import { Router } from "express";
import {
  requireAuth,
  requireRole,
} from "../../middlewares/auth.middleware.js";
import { listOpenIssues } from "./github.controller.js";

const router = Router();

// Solo un administrador autenticado puede consultar las issues del proyecto.
router.get(
  "/issues",
  requireAuth,
  requireRole("administrador"),
  listOpenIssues
);

export default router;