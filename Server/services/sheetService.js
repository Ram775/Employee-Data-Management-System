const { google } = require('googleapis');

// Apni credentials.json yahan configure karni hogi
const auth = new google.auth.GoogleAuth({
    keyFile: './credentials.json', 
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
});

async function addEmployeeToSheet(data) {
    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: 'v4', auth: client });
    
    await googleSheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'Sheet1!A:H',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[data.epfNo, data.uan, data.ppoNo, data.name, data.fatherName, data.designation, data.livingDate, data.exitDate]] }
    });
}

module.exports = { addEmployeeToSheet };