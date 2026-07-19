const express = require("express");
const jwt = require("jsonwebtoken");
const connectDB = require("../db");

const router = express.Router();

router.post("/verify-forgot-otp", async (req, res) => {
  try {
    const db = await connectDB();

    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Find User
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = result.rows[0];

    // OTP Check
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Expiry Check
    if (!user.otp_expiry || new Date() > new Date(user.otp_expiry)) {
      return res.status(400).json({
        success: false,
        message: "OTP Expired",
      });
    }

    // Clear OTP
    await db.query(
      `UPDATE users
       SET otp = NULL,
           otp_expiry = NULL
       WHERE id = $1`,
      [user.id],
    );

    // Reset Token (10 min)
    // Reset Token (10 min)
    const resetToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        purpose: "password-reset",
        version: user.reset_token_version,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      },
    );

    return res.status(200).json({
      success: true,
      message: "OTP Verified",
      resetToken,
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
