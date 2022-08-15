require("dotenv").config();
const express = require("express");
const ParseServer = require("parse-server").ParseServer;
const ParseDashboard = require("parse-dashboard");

const PORT = process.env.PORT || 1337;

const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;
const mountPath = process.env.PARSE_MOUNT || "/parse";

if (!databaseUri) {
  console.log("DATABASE_URI not specified, falling back to localhost.");
}

const config = {
  serverURL: process.env.SERVER_URL || `http://localhost:${PORT}${mountPath}`,
  appId: process.env.APP_ID || "myAppId",
  masterKey: process.env.MASTER_KEY || "myMasterKey",
  appName: process.env.APP_NAME || "MyApp",
  databaseURI: databaseUri || "mongodb://localhost:27017/dev",
};

const api = new ParseServer({
  ...config,
});

const options = { allowInsecureHTTP: false };

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

// make the Parse Server available at /parse
app.use(mountPath, api);

// make the Parse Dashboard available at /dashboard
app.use("/dashboard", dashboard);

app.listen(PORT, () => console.log(`App is running on port ${PORT}`));
