require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const PORT = process.env.PORT || 5000;
const authRoutes = require("./routes/authRoutes");
const verifyOtpRoute = require("./routes/verifyOtp");
const employeeRoutes = require("./routes/employeeRoutes");
const forgotPasswordRoute = require("./routes/forgotPassword");
const forgotPasswordOtpRoute = require("./routes/verifyForgotOtp");
const resetPasswordRoute = require("./routes/resetPassword");
const profileRoute = require("./routes/profile");
const adminRegister = require("./routes/adminRegister");
const healthRoutes = require("./routes/healthRoutes")


const app = express();
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Allow requests with no origin (Postman, mobile apps)
//       if (!origin) return callback(null, true);

//       // Allow localhost (development)
//       if (origin.includes("localhost")) {
//         return callback(null, true);
//       }

//       // Allow Vercel deployments (production + preview)
//       if (origin.includes("vercel.app")) {
//         return callback(null, true);
//       }

//       // Allow Netlify deployments
//       if (origin.includes("netlify.app")) {
//         return callback(null, true);
//       }

//       return callback(new Error("Not allowed by CORS"));
//     },
//     credentials: true,
//   }),
// );

app.use(cors());
app.use
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", verifyOtpRoute);
app.use("/api", profileRoute);
app.use("/api/admin", adminRegister);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/employees", employeeRoutes);
app.use("/api/auth", forgotPasswordRoute);
app.use("/api/auth", forgotPasswordOtpRoute);
app.use("/api/auth", resetPasswordRoute);
app.use("/api/health", healthRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
