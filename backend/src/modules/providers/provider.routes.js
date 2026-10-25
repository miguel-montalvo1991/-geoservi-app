import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";
import {


  createProfile,
  getMyProfile,
  updateMyProfile,
  getProviderById,
  updateProviderStatus,
  searchProviders, 
} from "./provider.controller.js";

const router = Router();

// Las tres rutas exigen estar logueado Y tener rol 'prestador'.
// Un cliente o un admin autenticados reciben 403, no 401.
router.post("/me", requireAuth, requireRole("prestador"), createProfile);
router.get("/me", requireAuth, requireRole("prestador"), getMyProfile);
router.patch("/me", requireAuth, requireRole("prestador"), updateMyProfile);

// Las rutas específicas deben ir antes de /:id para que "search" no se
// interprete como un UUID de prestador.
router.get("/search", requireAuth, searchProviders);
router.get("/:id", requireAuth, getProviderById);

// Solo administrador: activar/desactivar un prestador (Práctica 6)
router.patch("/:id/status", requireAuth, requireRole("administrador"), updateProviderStatus);

export default router;
