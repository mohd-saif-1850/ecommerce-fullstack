import { OAuth2Client } from "google-auth-library";
import { User } from "../models/user.model.js";
import generateAccessAndRefreshToken from "../utils/tokens.js";

const client = new OAuth2Client(
  "4245639749-c2bofuk00u99kpv7iiid1ndurkc85u1f.apps.googleusercontent.com"
);

// Google Login/Signup
export const googleAuth = async (req, res) => {
  const { tokenId } = req.body; // token from frontend Google login
  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: "4245639749-c2bofuk00u99kpv7iiid1ndurkc85u1f.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // First-time login → create user
      user = await User.create({
        name,
        email,
        username: email.split("@")[0],
        mobile: "0000000000", // default placeholder
        password: crypto.randomBytes(20).toString("hex"),
        isVerified: true, // Google verified
      });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    res
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
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
