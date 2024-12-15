const express = require("express");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
const nunjucks = require("nunjucks");
const path = require("path");
const db = require("./database");

const fs = require("fs");

// Source and destination paths
const sourcePath1 = "/flag.txt"; // Full path to the source file
const destinationPath1 = "/static/js/flag.txt"; // Full path to the destination file

// Function to copy the file
fs.copyFile(sourcePath1, destinationPath1, (err) => {
  if (err) {
    console.error("Error copying the file:", err);
    return;
  }
  console.log("File copied successfully!");
});

const app = express();
app.use(express.json());
app.use(cookieParser());

nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

app.use("/static", express.static(path.join(__dirname, "static")));
app.set("view engine", "html");

app.use(routes);

(async () => {
  await db.connect();
  await db.migrate();
})();

(async () => {
  app.listen(1338, "0.0.0.0", () => console.log("Listening on port 1337"));
})();
