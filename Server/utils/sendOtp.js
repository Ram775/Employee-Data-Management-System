const { google } = require("googleapis");
const nodemailer = require("nodemailer");

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

async function sendOTP(email, otp) {
  try {
    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    await transporter.sendMail({
      from: `"Employee Management System" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "🔐 Secure Login OTP - Employee Management System",
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#f4f7fc;font-family:'Segoe UI',Arial,sans-serif;">
        <table cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f7fc;padding:20px 0;">
          <tr>
            <td align="center">
              <!-- Main Container -->
              <table cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background-color:#ffffff;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);overflow:hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#1a237e,#0d47a1);padding:30px 40px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:600;letter-spacing:1px;">Employee Management</h1>
                    <p style="margin:8px 0 0;color:#90caf9;font-size:14px;">Secure Authentication System</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px 40px 30px;">
                    <p style="margin:0 0 8px;color:#333333;font-size:16px;line-height:1.6;">Hello,</p>
                    <p style="margin:0 0 24px;color:#555555;font-size:16px;line-height:1.6;">
                      You have requested to log in to the <strong>Employee Management System</strong>. 
                      Please use the One-Time Password (OTP) below to complete your authentication.
                    </p>

                    <!-- OTP Box -->
                    <table cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8faff;border:2px dashed #1a237e;border-radius:8px;padding:20px 0;margin:10px 0 24px;">
                      <tr>
                        <td align="center">
                          <p style="margin:0 0 6px;color:#666666;font-size:14px;letter-spacing:2px;">YOUR ONE-TIME PASSWORD</p>
                          <div style="font-size:40px;font-weight:700;color:#1a237e;letter-spacing:8px;padding:8px 0;font-family:'Courier New',monospace;">
                            ${otp}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Important Details -->
                    <table cellpadding="0" cellspacing="0" width="100%" style="margin:10px 0 20px;">
                      <tr>
                        <td style="padding:6px 0;">
                          <span style="color:#1a237e;font-weight:600;">⏱️ Expires in:</span>
                          <span style="color:#d32f2f;font-weight:600;">5 minutes</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;">
                          <span style="color:#1a237e;font-weight:600;">🔒 Security:</span>
                          <span style="color:#555555;">Do not share this OTP with anyone</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;">
                          <span style="color:#1a237e;font-weight:600;">📧 Requested for:</span>
                          <span style="color:#555555;">${email}</span>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:20px 0 0;color:#777777;font-size:14px;line-height:1.6;border-top:1px solid #e0e0e0;padding-top:20px;">
                      If you did not request this OTP, please ignore this email or contact our 
                      <a href="#" style="color:#1a237e;text-decoration:none;font-weight:600;">support team</a> immediately.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color:#f8faff;padding:20px 40px;text-align:center;border-top:1px solid #e8edf5;">
                    <p style="margin:0 0 6px;color:#888888;font-size:13px;">
                      &copy; 2026 Employee Management System. All rights reserved.
                    </p>
                    <p style="margin:0;color:#aaaaaa;font-size:12px;">
                      This is an automated message, please do not reply to this email.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    });

    console.log("OTP sent successfully");
    return true;
  } catch (err) {
    console.error("Email Error:", err);
    throw err;
  }
}

module.exports = sendOTP;
