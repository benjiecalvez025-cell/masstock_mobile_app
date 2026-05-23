const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const envPath = path.resolve(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const appJson = require("./app.json");

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo.extra || {}),
      ...process.env,
    },
  },
};
