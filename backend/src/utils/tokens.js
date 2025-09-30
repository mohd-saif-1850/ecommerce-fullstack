import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "supersecretkey";
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsupersecret";

export default async function generateAccessAndRefreshToken(userId) {
  const payload = { _id: userId };

  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

  await User.findByIdAndUpdate(
    userId,
    { $set: { refreshToken } },
    { new: true, runValidators: false }
  );

  return { accessToken, refreshToken };
}
