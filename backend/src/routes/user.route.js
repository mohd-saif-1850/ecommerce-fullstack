import { Router } from "express";
import { loginUser, registerUser, updateUser, verifyUser } from "../controllers/user.controller.js";
import  verifyJWT  from "../middleware/verifyJWT.js";
const router = Router()

router.route("/register-user").post(registerUser)
router.route("/verify-user").patch(verifyUser)
router.route("/login-user").post(loginUser)
router.route("/update-user").patch(verifyJWT,updateUser)

export default router;