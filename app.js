require("dotenv").config();
const express = require("express");
const ParseServer = require("parse-server").ParseServer;
const ParseDashboard = require("parse-dashboard");
// const CloudinaryAdapter = require("parse-server-cloudinary-adapter");
const CloudinaryAdapter = require("./utils/CloudinaryAdapter");

const PORT = process.env.PORT || 1337;

const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;
const mountPath = process.env.PARSE_MOUNT || "/parse";

const mailAdapterOptions = {
  //For Gmail
  service: process.env.MAIL_SERVICE,
  email: process.env.MAIL_USER,
  password: process.env.MAIL_PASS,
  // templates: {
  //   //This template is used only for reset password email
  //   resetPassword: {
  //     //Path to your template
  //     template: __dirname + "/views/email/reset-password",
  //     //Subject for this email
  //     subject: "Reset your password",
  //   },
  //   verifyEmail: {
  //     template: __dirname + "/views/email/verify-email",
  //     subject: "Verify Email",
  //   },
  // },
};

if (!databaseUri) {
  console.log("DATABASE_URI not specified, falling back to localhost.");
}

const config = {
  serverURL: process.env.SERVER_URL || `http://localhost:${PORT}${mountPath}`,
  publicServerURL:
    process.env.SERVER_URL || `http://localhost:${PORT}${mountPath}`,
  appId: process.env.APP_ID || "myAppId",
  masterKey: process.env.MASTER_KEY || "myMasterKey",
  appName: process.env.APP_NAME || "MyApp",
  databaseURI: databaseUri || "mongodb://localhost:27017/dev",
};

const api = new ParseServer({
  ...config,
  javascriptKey: process.env.JAVASCRIPT_KEY || "JavaScriptKey",
  liveQuery: {
    classNames: ["link", "_User", "Chats", "Messages", "Notifications"],
  },
  filesAdapter: new CloudinaryAdapter({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  }),
  fileUpload: {
    enableForPublic: true,
  },
  // Enable email verification
  verifyUserEmails: true,

  // Set email verification token validity to 2 hours
  emailVerifyTokenValidityDuration: 2 * 60 * 60,

  // Set email adapter
  emailAdapter: {
    // module: "simple-parse-smtp-adapter",
    module: "parse-server-generic-email-adapter",
    options: {
      // Additional adapter options
      ...mailAdapterOptions,
    },
  },
});

const options = { allowInsecureHTTP: true };

const dashboard = new ParseDashboard(
  {
    apps: [{ ...config }],
    users: [
      {
        user: process.env.USER || "test",
        pass: process.env.PASS || "test",
      },
    ],
  },
  options
);

const app = express();

app.get("/", function (req, res) {
  res
    .status(200)
    .send(
      "<html><body><h1 style='height:20vh;display:flex;justify-content:center;align-items:center;'>Go to <a href='/dashboard'>Dashboard</a></h1></body></html>"
    );
});

app.get("/test", (req, res) => {
  res.sendFile(__dirname + "/test.html");
});

// make the Parse Server available at /parse
app.use(mountPath, api);

// make the Parse Dashboard available at /dashboard
app.use("/dashboard", dashboard);

// app.listen(PORT, () => console.log(`App is running on port ${PORT}`));
const httpServer = require("http").createServer(app);
httpServer.listen(PORT, () => console.log(`App is running on port ${PORT}`));
const parseLiveQueryServer = ParseServer.createLiveQueryServer(httpServer);
