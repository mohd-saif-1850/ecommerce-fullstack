import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});

export const sendEmail = async (to, name, otp, subject) => {
  try {
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; padding: 40px; display: flex; justify-content: center;">
        <div style="background: #ffffff; border-radius: 16px; width: 100%; max-width: 600px; padding: 40px; text-align: center; box-shadow: 0 8px 20px rgba(0,0,0,0.1);">
          <h1 style="color: #0b6efd; font-size: 28px;">MS ECOMMERCE</h1>
          <p style="font-size: 16px; color: #555;">Hi ${name}, use the OTP below to verify your email:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0b6efd; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #888;">This code expires in 10 minutes.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"MS ECOMMERCE" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
