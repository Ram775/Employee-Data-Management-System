const express = require("express");
const connectDB = require("../db");
const sendOTP = require("../utils/sendOTP");

const router = express.Router();

router.post("/forgot-password", async (req, res) => {
  try {
    const db = await connectDB();

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check User
    const result = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    // Security: Email exist karta hai ya nahi, ye reveal mat karo
    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "If an account exists, an OTP has been sent to your email.",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP valid for 5 minutes
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP
    await db.query(
      `UPDATE users
       SET otp = $1,
           otp_expiry = $2
       WHERE email = $3`,
      [otp, otpExpiry, email]
    );

    // Send OTP
    await sendOTP(email, otp);

    return res.status(200).json({
      success: true,
      message: "If an account exists, an OTP has been sent to your email.",
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

module.exports = router;