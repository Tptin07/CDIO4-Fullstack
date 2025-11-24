import express from "express";
import {
  getPublicServices,
  getServiceDetail,
} from "../controllers/serviceController.js";

const router = express.Router();

router.get("/", getPublicServices);
router.get("/:id", getServiceDetail);

export default router;

