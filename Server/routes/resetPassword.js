const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const connectDB = require("../db");

const router = express.Router();

router.post("/reset-password", async (req, res) => {
  try {
    const db = await connectDB();

    // Authorization: Bearer <resetToken>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Reset token is required",
      });
    }

    const resetToken = authHeader.split(" ")[1];

    let decoded;

    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or Expired Reset Token",
      });
    }

    // Sirf Password Reset Token Allow Hoga
    if (decoded.purpose !== "password-reset") {
      return res.status(403).json({
        success: false,
        message: "Invalid Token",
      });
    }

    // Get Latest User
    const result = await db.query(
      `SELECT id, reset_token_version
       FROM users
       WHERE id = $1`,
      [decoded.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = result.rows[0];

    // One-Time Reset Token Check
    if (decoded.version !== user.reset_token_version) {
      return res.status(401).json({
        success: false,
        message: "Reset token has already been used.",
      });
    }

    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Optional: Prevent using the same password again
    const oldPassword = await db.query(
      `SELECT password FROM users WHERE id = $1`,
      [decoded.id],
    );

    const isSamePassword = await bcrypt.compare(
      newPassword,
      oldPassword.rows[0].password,
    );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as the old password.",
      });
    }

    // Hash New Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update Password
    await db.query(
      `UPDATE users
       SET
          password = $1,
          password_changed_at = NOW(),
          reset_token_version = reset_token_version + 1
       WHERE id = $2`,
      [hashedPassword, decoded.id],
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. Please login again.",
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
