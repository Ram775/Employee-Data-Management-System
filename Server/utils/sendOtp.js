const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  "http://localhost",
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

async function sendOTP(email, otp) {
  try {
    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client,
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OTP Verification</title>
</head>
<body style="margin:0;padding:0;background-color:#eef1f8;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table cellpadding="0" cellspacing="0" width="100%" style="background-color:#eef1f8;padding:40px 0;">
    <tr>
      <td align="center">

        <!-- Main Container -->
        <table cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background-color:#ffffff;border-radius:20px;box-shadow:0 10px 40px rgba(26,35,126,0.12);overflow:hidden;">

          <!-- Header with mesh gradient -->
          <tr>
            <td style="background:linear-gradient(135deg,#3949ab 0%,#1a237e 45%,#0d1b5e 100%);padding:44px 40px 40px;text-align:center;position:relative;">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <!-- Logo badge -->
                    <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
                      <tr>
                        <td style="width:56px;height:56px;background:rgba(255,255,255,0.15);border-radius:16px;text-align:center;vertical-align:middle;border:1px solid rgba(255,255,255,0.25);">
                          <span style="font-size:26px;line-height:56px;">🔐</span>
                        </td>
                      </tr>
                    </table>
                    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:0.3px;">Employee Management System</h1>
                    <p style="margin:10px 0 0;color:#b3c1f7;font-size:14px;letter-spacing:0.5px;">Secure Authentication System</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:44px 40px 32px;">
              

              <!-- OTP Box -->
              <table cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,#f4f7ff,#eef1ff);border-radius:16px;padding:2px;margin:0 0 28px;">
                <tr>
                  <td style="border:1.5px dashed #3949ab;border-radius:16px;padding:26px 0;text-align:center;">
                    <p style="margin:0 0 10px;color:#5c6270;font-size:12px;letter-spacing:3px;font-weight:700;text-transform:uppercase;">Your One-Time Password</p>
                    <div style="font-size:42px;font-weight:800;color:#1a237e;letter-spacing:10px;font-family:'SF Mono','Consolas','Roboto Mono',monospace;padding:4px 0 8px;">
                      ${otp}
                    </div>
                    <p style="margin:6px 0 0;color:#d32f2f;font-size:12.5px;font-weight:600;">⏱ Expires in 5 minutes</p>
                  </td>
                </tr>
              </table>

              <!-- Info cards -->
              <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 8px;">
                <tr>
                  <td style="background-color:#f8faff;border-radius:12px;padding:16px 18px;border-left:3px solid #3949ab;">
                    <p style="margin:0;color:#1a237e;font-size:13.5px;font-weight:700;">🔒 Security Notice</p>
                    <p style="margin:4px 0 0;color:#6b7280;font-size:13.5px;line-height:1.5;">Never share this OTP with anyone, including our support staff.</p>
                  </td>
                </tr>
              </table>
              <table cellpadding="0" cellspacing="0" width="100%" style="margin:12px 0 0;">
                <tr>
                  <td style="background-color:#f8faff;border-radius:12px;padding:16px 18px;border-left:3px solid #7986cb;">
                    <p style="margin:0;color:#1a237e;font-size:13.5px;font-weight:700;">📧 Requested for</p>
                    <p style="margin:4px 0 0;color:#6b7280;font-size:13.5px;line-height:1.5;">${email}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;color:#9aa0ac;font-size:13px;line-height:1.6;border-top:1px solid #eef0f4;padding-top:20px;">
                If you did not request this OTP, please ignore this email or contact our
                <a href="#" style="color:#1a237e;text-decoration:none;font-weight:600;">support team</a> immediately.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8faff;padding:24px 40px;text-align:center;border-top:1px solid #eef0f4;">
              <p style="margin:0 0 6px;color:#8a8f9a;font-size:12.5px;">&copy; 2026 Employee Management System. All rights reserved.</p>
              <p style="margin:0;color:#aeb4bf;font-size:11.5px;">This is an automated message, please do not reply to this email.</p>
            </td>
          </tr>

        </table>

        <p style="margin:20px 0 0;color:#9aa0ac;font-size:12px;">Sent with 💙 by Employee Management System</p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    const messageParts = [
      `From: Employee Management System <${process.env.GMAIL_USER}>`,
      `To: ${email}`,
      "Content-Type: text/html; charset=UTF-8",
      "MIME-Version: 1.0",
      "Subject: =?UTF-8?B?" +
        Buffer.from(
          "🔐 Secure Login OTP - Employee Management System",
        ).toString("base64") +
        "?=",
      "",
      html,
    ];
    const rawMessage = Buffer.from(messageParts.join("\n"))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: rawMessage,
      },
    });

    console.log("✅ OTP Sent Successfully");
    console.log("Message ID:", response.data.id);

    return true;
  } catch (err) {
    console.error("Email Error:", err.response?.data || err);
    throw err;
  }
}

module.exports = sendOTP;
