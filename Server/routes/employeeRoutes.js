const express = require("express");
const router = express.Router();
const admin = require("../middleware/auth");
const {
  addEmployeeToSheet,
  getAllEmployees,
  updateEmployeeById,
  deleteEmployeeById,
} = require("../services/sheetService");
const { google } = require("googleapis");
const { v4: uuidv4 } = require("uuid");

const auth = new google.auth.GoogleAuth({
  keyFile: "./credentials.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

// POST: Add Employee (with auto-generated ID)
router.post("/add-employee", admin, async (req, res) => {
  try {
    const result = await addEmployeeToSheet(req.body);
    res.status(200).json({
      success: true,
      message: result.message,
      id: result.id,
    });
  } catch (err) {
    console.error("Error adding employee:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// GET: All Employees
router.get("/get-employees", admin, async (req, res) => {
  try {
    const data = await getAllEmployees();
    const employees = data.reverse();

    res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// PUT: Update Employee by ID
router.put("/update-employee/:id", admin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateEmployeeById(id, req.body);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    console.error("Error updating employee:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// DELETE: Delete Employee by ID
router.delete("/delete-employee/:id", admin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteEmployeeById(id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// GET: Employee Count
router.get("/employee-count", admin, async (req, res) => {
  try {
    const employees = await getAllEmployees();
    const count = employees.length;
    res.status(200).json({
      success: true,
      count: count,
    });
  } catch (err) {
    console.error("Error getting count:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
