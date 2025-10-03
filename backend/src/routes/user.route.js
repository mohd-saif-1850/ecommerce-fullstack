import { Router } from "express";
import { deleteUser, getAllUsers, logoutUser,getUser, loginUser, registerUser, updateUser, verifyUser } from "../controllers/user.controller.js";
import  verifyJWT  from "../middleware/verifyJWT.js";
const router = Router()

router.route("/register-user").post(registerUser)
router.route("/verify-user").patch(verifyUser)
router.route("/login-user").post(loginUser)
router.route("/update-user").patch(verifyJWT,updateUser)
router.route("/get-user").get(verifyJWT,getUser)
router.route("/get-all-users").get(getAllUsers)
router.route("/delete-user").delete(verifyJWT,deleteUser)
router.route("/logout-user").post(verifyJWT, logoutUser);

export default router;