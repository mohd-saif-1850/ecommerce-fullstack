import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization") || req.header("authorization") || "";
    const tokenFromHeader = authHeader.replace(/^\s*Bearer\s+/i, "").trim();
    const tokenFromCookie = req.cookies?.accessToken;
    const tokenFromBody = req.body?.accessToken;

    const token = tokenFromHeader || tokenFromCookie || tokenFromBody;

    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized request! Access token missing." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ error: err.message || "Invalid or expired access token!" });
    }

    const userId = decoded?._id || decoded?.id;
    if (!userId) {
      return res.status(401).json({ error: "Invalid access token payload!" });
    }

    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
      return res.status(401).json({ error: "Invalid Access Token ! User Not Found -- Try to Login First !" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: error.message || "Unauthorized request!" });
  }
};

export default verifyJWT;
