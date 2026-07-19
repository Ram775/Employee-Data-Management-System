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

const app = express();
app.use(cors());
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



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
