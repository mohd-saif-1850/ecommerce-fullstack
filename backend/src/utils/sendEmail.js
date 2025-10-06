import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// ✅ Transporter setup (Render-compatible)
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Send email function
export const sendEmail = async (to, name, otp, subject) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${subject}</title>
        <style>
          body {
            background-color: #f3f6fa;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 14px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #007bff, #6610f2);
            color: #fff;
            text-align: center;
            padding: 30px 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            letter-spacing: 1px;
          }
          .body {
            padding: 35px 30px;
            text-align: center;
          }
          .body p {
            font-size: 16px;
            color: #444;
            margin-bottom: 15px;
          }
          .otp-box {
            display: inline-block;
            background: #f0f4ff;
            border: 2px dashed #0b6efd;
            border-radius: 10px;
            padding: 14px 30px;
            font-size: 30px;
            font-weight: bold;
            color: #0b6efd;
            letter-spacing: 10px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 25px;
            font-size: 13px;
            color: #888;
            background: #f9fafc;
            border-top: 1px solid #eee;
          }
          .footer a {
            color: #0b6efd;
            text-decoration: none;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MS ECOMMERCE</h1>
          </div>
          <div class="body">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Use the One-Time Password (OTP) below to verify your email address.</p>
            <div class="otp-box">${otp}</div>
            <p>This OTP will expire in <strong>10 minutes</strong>.</p>
            <p>If you didn’t request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} <a href="#">MS ECOMMERCE</a>. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"MS ECOMMERCE" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};
