const express = require("express");
const bcrypt = require("bcryptjs");
const connectDB = require("../db");
const superAdmin = require("../middleware/superAdmin");
const upload = require("../middleware/upload");

const router = express.Router();

router.post(
  "/register-user",
  superAdmin,
  upload.single("profile_image"),
  async (req, res) => {
    try {
      const db = await connectDB();

      const { fullname, email, password, mobile, address } = req.body;

      const profile_image = req.file
        ? `/uploads/profiles/${req.file.filename}`
        : null;

      // Always Create Admin
      const role = "admin";

      // Validation
      if (!fullname || !email || !password || !mobile || !address) {
        return res.status(400).json({
          success: false,
          message:
            "Full Name, Email, Password, Mobile and Address are required.",
        });
      }

      // Password Validation
      const passwordRegex = /^[a-zA-Z0-9@#$&]*$/;

      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          success: false,
          message: "Only letters, numbers and @ # $ & are allowed.",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters.",
        });
      }

      // Mobile Validation
      if (!/^[6-9]\d{9}$/.test(mobile)) {
        return res.status(400).json({
          success: false,
          message: "Invalid mobile number.",
        });
      }

      // Email Exists
      const emailExists = await db.query(
        "SELECT id FROM users WHERE email = $1",
        [email],
      );

      if (emailExists.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Email already exists.",
        });
      }

      // Mobile Exists
      const mobileExists = await db.query(
        "SELECT id FROM users WHERE mobile = $1",
        [mobile],
      );

      if (mobileExists.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Mobile number already exists.",
        });
      }

      // Password Hash
      const hashedPassword = await bcrypt.hash(password, 12);

      // Insert Admin
      const result = await db.query(
        `INSERT INTO users
      (
        fullname,
        email,
        password,
        mobile,
        address,
        profile_image,
        role
      )
      VALUES($1,$2,$3,$4,$5,$6,$7)
      RETURNING
        id,
        fullname,
        email,
        mobile,
        address,
        profile_image,
        role,
        created_at`,
        [
          fullname,
          email,
          hashedPassword,
          mobile,
          address,
          profile_image || null,
          role,
        ],
      );

      return res.status(201).json({
        success: true,
        message: "Admin created successfully.",
        data: result.rows[0],
      });
    } catch (err) {
      console.error("Register User Error:", err);

      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  },
);

module.exports = router;
