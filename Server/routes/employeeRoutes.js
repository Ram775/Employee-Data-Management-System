const express = require("express");
const router = express.Router();
const { addEmployeeToSheet } = require("../services/sheetService");
const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
  keyFile: "./credentials.json", // Path sahi rakhein
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

router.post("/add-employee", async (req, res) => {
  try {
    await addEmployeeToSheet(req.body);
    res.status(200).json({ message: "Data added to Sheet successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Data Fetch
router.get("/get-employees", async (req, res) => {
  try {
    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });

    const getRows = await googleSheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:H",
    });

    const rows = getRows.data.values;

    // Agar data hai, toh sirf index 1 se aage ka data bhejein (header hata kar)
    if (rows && rows.length > 1) {
      const dataOnly = rows.slice(1);
      res.status(200).json(dataOnly);
    } else {
      res.status(200).json([]); // Agar sirf header hai ya sheet khali hai
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: Update Data
router.put("/update-employee/:row", async (req, res) => {
  try {
    const row = req.params.row; // Row number (e.g., 2 for first data row)
    const data = req.body;

    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });

    await googleSheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `Sheet1!A${row}:H${row}`, // Specific row ko target kar rahe hain
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            data.epfNo,
            data.uan,
            data.ppoNo,
            data.name,
            data.fatherName,
            data.designation,
            data.livingDate,
            data.exitDate,
          ],
        ],
      },
    });

    res.status(200).json({ message: `Row ${row} updated successfully!` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/delete-employee/:row", async (req, res) => {
  const row = req.params.row;
  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client });

  await googleSheets.spreadsheets.batchUpdate({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: 0,
              dimension: "ROWS",
              startIndex: row - 1,
              endIndex: row,
            },
          },
        },
      ],
    },
  });
  res.status(200).json({ message: "Row deleted successfully" });
});

// GET: Count of Employees
router.get("/employee-count", async (req, res) => {
  try {
    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });

    const getRows = await googleSheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:H",
    });

    const rows = getRows.data.values;

    // Agar data hai, toh header (Row 1) ko hata kar baki rows ka count dein
    // rows.length mein header bhi count hota hai, isliye -1 kiya
    const count = rows && rows.length > 0 ? rows.length - 1 : 0;

    res.status(200).json({ count: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}); 

module.exports = router;
