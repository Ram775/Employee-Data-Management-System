const { google } = require("googleapis");
const { v4: uuidv4 } = require("uuid"); // UUID import karo

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

// Apni credentials.json yahan configure karni hogi
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// Function to generate unique ID
const generateEmployeeId = () => {
  // Option 1: Simple UUID
  return uuidv4();
};

async function addEmployeeToSheet(data) {
  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client });

  // Generate unique ID
  const uniqueId = generateEmployeeId();

  // Get current data to find next row
  const getRows = await googleSheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Sheet1!A:A", // Sirf column A check karo
  });

  const rows = getRows.data.values || [];
  const nextRow = rows.length + 1; // Next available row

  // Data with ID as first column (Column A)
  const rowData = [
    uniqueId, // Column A: ID (generated)
    data.formNo || "", // Column B: EPF NO
    data.name || "", // Column E: Employee Name
    data.fatherName || "", // Column F: Father's Name
    data.designation || "", // Column G: Designation
    data.depotName || "", // Column G: Depot Name
    data.exitDate || "", // Column I: Exit Date
    data.lastBasicPay || "", // Column I: Exit Date
    data.exgratiaAmount || "", // Column I: Exit Date
    data.gratuityAmount || "", // Column I: Exit Date
    data.leaveEncashmentAmount || "", // Column I: Exit Date
    data.nominee || "", // Column G: Depot Name
    data.relation || "", // Column G: Depot Name
    data.bankAccountNumber || "", // Column G: Depot Name
    data.ifscCode || "", // Column G: Depot Name
    data.vrs || "", // Column G: Depot Name
  ];

  await googleSheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `Sheet1!A${nextRow}:P${nextRow}`, // A to M columns
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [rowData],
    },
  });

  return {
    success: true,
    id: uniqueId,
    message: "Employee created successfully.",
  };
}

// Get all employees with ID
async function getAllEmployees() {
  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client });

  const getRows = await googleSheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Sheet1!A:P", // A to P columns (ID + 11 fields)
  });

  const rows = getRows.data.values || [];

  // Agar data hai, toh sirf index 1 se aage ka data bhejein (header hata kar)
  if (rows.length > 1) {
    return rows.slice(1);
  }
  return [];
}

// Update employee by ID (not row number)
async function updateEmployeeById(id, data) {
  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client });

  // Get all employees to find the row with matching ID
  const allEmployees = await getAllEmployees();

  // Find row index by ID (first column)
  const rowIndex = allEmployees.findIndex((row) => row[0] === id);

  if (rowIndex === -1) {
    throw new Error("Employee not found with ID: " + id);
  }

  const rowNumber = rowIndex + 2; // +2 because: 0-index + header row

  // Update the row (keep ID same)
  const rowData = [
    id, // Column A: ID (keep same)
    data.formNo || "", // Column B: EPF NO
    data.name || "", // Column E: Employee Name
    data.fatherName || "", // Column F: Father's Name
    data.designation || "", // Column G: Designation
    data.depotName || "", // Column G: Depot Name
    data.exitDate || "", // Column I: Exit Date
    data.lastBasicPay || "", // Column I: Exit Date
    data.exgratiaAmount || "", // Column I: Exit Date
    data.gratuityAmount || "", // Column I: Exit Date
    data.leaveEncashmentAmount || "", // Column I: Exit Date
    data.nominee || "", // Column G: Depot Name
    data.relation || "", // Column G: Depot Name
    data.bankAccountNumber || "", // Column G: Depot Name
    data.ifscCode || "", // Column G: Depot Name
    data.vrs || "", // Column G: Depot Name
  ];

  await googleSheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `Sheet1!A${rowNumber}:M${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [rowData] },
  });

  return {
    success: true,
    message: `Employee updated successfully!`,
  };
}

// Delete employee by ID
async function deleteEmployeeById(id) {
  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client });

  // Get all employees to find the row with matching ID
  const allEmployees = await getAllEmployees();

  // Find row index by ID (first column)
  const rowIndex = allEmployees.findIndex((row) => row[0] === id);

  if (rowIndex === -1) {
    throw new Error("Employee not found with ID: " + id);
  }

  const rowNumber = rowIndex + 2; // +2 because: 0-index + header row

  // Delete the row
  await googleSheets.spreadsheets.batchUpdate({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: 0,
              dimension: "ROWS",
              startIndex: rowNumber - 1,
              endIndex: rowNumber,
            },
          },
        },
      ],
    },
  });

  return {
    success: true,
    message: "Employee deleted successfully!",
  };
}

module.exports = {
  addEmployeeToSheet,
  getAllEmployees,
  updateEmployeeById,
  deleteEmployeeById,
};
