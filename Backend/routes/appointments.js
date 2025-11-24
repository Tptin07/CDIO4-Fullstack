import express from "express";
import {
  createAppointment,
  getUserAppointments,
  getAppointmentDetail,
  cancelAppointment,
} from "../controllers/appointmentController.js";
import {
  authenticateToken,
  optionalAuthenticate,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", optionalAuthenticate, createAppointment);

router.use(authenticateToken);
router.get("/", getUserAppointments);
router.get("/:id", getAppointmentDetail);
router.patch("/:id/cancel", cancelAppointment);

export default router;

