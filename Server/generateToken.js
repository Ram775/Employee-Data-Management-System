const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

const credentials = require("./credentialsToken.json");

const { client_secret, client_id, redirect_uris } = credentials.installed;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0],
);

const SCOPES = [
  "https://mail.google.com/",
];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
  prompt: "consent",
});

console.log("Authorize this app by visiting this url:");
console.log(authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("\nPaste the code here: ", (code) => {
  rl.close();

  oAuth2Client.getToken(code, (err, token) => {
    if (err) return console.error(err);

    console.log("\nRefresh Token:");
    console.log(token.refresh_token);
  });
});
