import { OAuth2Client } from "google-auth-library";
import { User } from "../models/user.model.js";
import crypto from "crypto";
import generateAccessAndRefreshToken from "../utils/tokens.js";
import dotenv from "dotenv";
dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res) => {
  const { tokenId } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID, // only client ID needed
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        username: email.split("@")[0],
        mobile: "0000000000",
        password: crypto.randomBytes(20).toString("hex"),
        isVerified: true,
      });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    res
      .cookie("accessToken", accessToken, { httpOnly: true, sameSite: "lax" })
      .cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "lax" })
      .status(200)
      .json({
        message: "Logged in with Google successfully",
        user: { name: user.name, email: user.email, username: user.username },
        accessToken,
        refreshToken,
      });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).json({ error: "Google login failed" });
  }
};
