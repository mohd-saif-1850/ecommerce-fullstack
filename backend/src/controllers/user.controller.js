import {User} from "../models/user.model.js"
import bcrypt from "bcrypt"
import crypto from "crypto"
import { sendEmail } from "../utils/sendEmail.js"
import generateAccessAndRefreshToken from "../utils/tokens.js";
import jwt from "jsonwebtoken"


const registerUser = async (req, res) => {
  try {
    const { name, username, email, mobile, password } = req.body;

    if (!name || !username || !email || !mobile || !password) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ error: "Email already exists!" });
    }
    if (await User.findOne({ username })) {
      return res.status(400).json({ error: "Username already exists!" });
    }
    if (await User.findOne({ mobile })) {
      return res.status(400).json({ error: "Mobile number already exists!" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      username,
      email,
      mobile,
      otp,
      password: hashedPassword,
      isVerified: false,
    });

    // Fire-and-forget email sending
    sendEmail(email, name, otp, "Verify your MS ECOMMERCE Account")
      .then(() => console.log(`OTP sent to ${email}`))
      .catch(err => console.error("Email failed to send:", err));

    res.status(200).json({
      success: true,
      message: "User registered successfully. Check your email for OTP.",
      data: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        isVerified: user.isVerified,
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message || "Server error" });
  }
};



const verifyUser = async (req,res) => {
    const { email, otp } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required!" });
    if (!otp) return res.status(400).json({ error: "OTP is required!" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found!" });

    if (user.otp !== Number(otp)) {
        return res.status(400).json({ error: "Invalid OTP!" });
    }

    user.isVerified = true;
    user.otp = null;
    await user.save();

    return res.status(200).json({ success: true, message: "Email verified successfully!" });
}

const loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!(username || email)) {
      return res.status(400).json({ error: "Please provide username or email" });
    }
    if (!password) {
      return res.status(400).json({ error: "Please provide password" });
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ FIX: Use bcrypt.compare instead of user.isPasswordCorrect
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Password is incorrect" });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({
        message: "Logged in successfully",
        user: loggedInUser,
        accessToken,
        refreshToken,
      });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
};

const logoutUser = async (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    // Optional: clear refreshToken in DB too
    if (req.user?._id) {
      await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: "" } });
    }

    return res
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .status(200)
      .json({ success: true, message: "Logged out successfully!" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error!" });
  }
};


const updateUser = async (req, res) => {
  try {
    const { username, email, name, mobile } = req.body;

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (mobile) updateData.mobile = mobile;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No valid fields provided to update!" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
      return res.status(404).json({ error: "User Not Found Try to Login First !" });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully!",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ error: "Server error!" });
  }
};

const newAccessToken = async (req, res) => {
  try {
    const userRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!userRefreshToken) {
      return res.status(401).json({ error: "Unauthorized request! Refresh token missing." });
    }

    const decodedToken = jwt.verify(
      userRefreshToken,
      process.env.JWT_REFRESH_SECRET || "refreshsupersecret"
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    if (userRefreshToken !== user.refreshToken) {
      return res.status(401).json({ error: "Refresh token expired or already used" });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    return res
      .status(200)
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({
        message: "New access token created successfully",
        accessToken,
        refreshToken,
      });
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};

const getUser = async (req, res) => {
  try {
    // If verifyJWT ran, req.user will already contain the authenticated user
    if (req.user) {
      return res.status(200).json({
        success: true,
        message: "Authenticated user fetched successfully",
        data: req.user,
      });
    }

    // Fallback: accept username/email in body (keeps old behavior)
    const { username, email } = req.body;
    if (!(username || email)) {
      return res.status(400).json({ error: "Please provide username or email" });
    }

    const user = await User.findOne({ $or: [{ username }, { email }] }).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (err) {
    console.error("Get user error:", err);
    return res.status(500).json({ error: "Server error!" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -refreshToken");

    return res.status(200).json({
      success: true,
      message: "All users fetched successfully",
      data: users
    });
  } catch (err) {
    console.error("Get all users error:", err);
    return res.status(500).json({ error: "Server error!" });
  }
};

const deleteUser = async (req,res) => {
  const {_id} = req.user

  if (!_id) {
    return res.status(404).json({error : "You must have to Provide UserID !"})
  }

  const del = await User.findByIdAndDelete(_id)

  if (!del) {
    return res.status(500).json({error : "Server Error while Deleting the User !"})
  }

  return res.status(200).json({
    success : true,
    message : "User Deleted Successfully !"
  })
}

export {registerUser, verifyUser, loginUser, logoutUser,updateUser,
  newAccessToken, getUser, getAllUsers, deleteUser};