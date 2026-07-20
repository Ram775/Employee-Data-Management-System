const express = require("express");
const bcrypt = require("bcryptjs");
const connectDB = require("../db");
const sendOTP = require("../utils/sendOtp");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const db = await connectDB();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }

    // User Find
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const user = result.rows[0];

    console.log("DB Hash:", user.password);

    // Password Verify
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP Expiry (5 Minutes)
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP
    await db.query(
      `UPDATE users
       SET otp = $1,
           otp_expiry = $2
       WHERE email = $3`,
      [otp, otpExpiry, email],
    );

    // Send Email
    await sendOTP(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email.",
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
