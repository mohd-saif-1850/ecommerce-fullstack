import { Router } from "express";
import verifyJWT from "../middleware/verifyJWT.js";
import { createItem, getAllItems } from "../controllers/item.controller.js";
import { upload } from "../middleware/uploadMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = Router()

router.route("/create-item").post(verifyJWT,authorizeRoles("admin"),upload.single("image"),createItem)
router.route("/get-all-items").get(getAllItems)

export default router;