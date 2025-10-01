import { Router } from "express";
import verifyJWT from "../middleware/verifyJWT.js";
import { createItem } from "../controllers/item.controller.js";
import { upload } from "../middleware/uploadMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = Router()

router.route("/create-item").post(verifyJWT,authorizeRoles("admin"),upload.single("image"),createItem)

export default router;