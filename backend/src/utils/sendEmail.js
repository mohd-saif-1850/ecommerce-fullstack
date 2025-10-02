import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

// Send email function
export const sendEmail = async (to, name, otp, subject) => {
  const htmlContent = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; padding: 40px; display: flex; justify-content: center;">
    <div style="background: #ffffff; border-radius: 16px; width: 100%; max-width: 600px; padding: 40px; text-align: center; box-shadow: 0 8px 20px rgba(0,0,0,0.1);">
      <div style="margin-bottom: 30px;">
        <h1 style="color: #0b6efd; font-size: 28px; margin: 0;">MS ECOMMERCE</h1>
        <p style="color: #555; margin-top: 8px; font-size: 16px;">Verify your email to get started!</p>
      </div>
      <div style="margin: 30px 0;">
        <p style="font-size: 18px; color: #333; margin-bottom: 12px;">Hi ${name} !</p>
        <p style="font-size: 16px; color: #555; margin-bottom: 25px;">
          Use the verification code below to confirm your email address. It expires in <strong>10 minutes</strong>.
        </p>
        <div style="display: inline-block; background: #e6f0ff; padding: 18px 28px; border-radius: 12px; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0b6efd;">
          ${otp}
        </div>
      </div>
      <div style="margin-top: 35px; font-size: 14px; color: #888;">
        <p>If you didn’t request this code, you can safely ignore this email.</p>
        <p>Need help? <a href="mailto:${process.env.EMAIL_USER}" style="color:#0b6efd; text-decoration:none;">Contact Support</a></p>
      </div>
      <div style="margin-top: 40px; font-size: 12px; color: #aaa;">
        <p>© 2025 MS ECOMMERCE. All rights reserved.</p>
      </div>
    </div>
  </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"MS ECOMMERCE" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
