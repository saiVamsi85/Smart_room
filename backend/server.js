const express = require("express");
const cors = require("cors");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

const FILE = path.join(__dirname, "..", "data", "data.csv");

// Ensure file exists
if (!fs.existsSync(FILE)) {
  fs.writeFileSync(
    FILE,
    "datetime,temp,hum,light,motion,fanLevel,lightLevel\n",
  );
}

let latestData = {
  temp: 0,
  hum: 0,
  light: 0,
  motion: 0,
};

// Helper → formatted date-time
function getFormattedDateTime() {
  const now = new Date();
  return (
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0") +
    " " +
    String(now.getHours()).padStart(2, "0") +
    ":" +
    String(now.getMinutes()).padStart(2, "0") +
    ":" +
    String(now.getSeconds()).padStart(2, "0")
  );
}

//
// MAIN API (unchanged, but safer)
//
app.post("/data", (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "No data received" });
    }

    const { temp, hum, light, motion } = req.body;

    if (
      temp === undefined ||
      hum === undefined ||
      light === undefined ||
      motion === undefined
    ) {
      return res.status(400).json({ error: "Incomplete data" });
    }

    const parsedData = {
      temp: Number(temp),
      hum: Number(hum),
      light: Number(light),
      motion: Number(motion),
    };

    // LIGHT LOGIC
    let lightLevel = 0;
    if (parsedData.light < 600) lightLevel = 3;
    else if (parsedData.light < 1800) lightLevel = 2;
    else if (parsedData.light < 3000) lightLevel = 1;

    // FAN LOGIC
    let comfortIndex = parsedData.temp + parsedData.hum / 30;
    if (parsedData.hum > 65) comfortIndex += 1.5;

    let fanLevel = comfortIndex < 26 ? 1 : comfortIndex < 32 ? 2 : 3;

    latestData = {
      ...parsedData,
      fanLevel,
      lightLevel,
    };

    console.log("Received:", latestData);

    // Save only when motion = 1
    if (parsedData.motion === 1) {
      const datetime = getFormattedDateTime();
      const line = `${datetime},${parsedData.temp},${parsedData.hum},${parsedData.light},${parsedData.motion},${fanLevel},${lightLevel}\n`;

      fs.appendFileSync(FILE, line);
      console.log("Saved to CSV");
    }

    res.json({ status: "ok" });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

//
// SIMULATOR INSIDE BACKEND (IMPORTANT)
//
setInterval(() => {
  const data = {
    temp: Number((20 + Math.random() * 12).toFixed(2)),
    hum: Number((30 + Math.random() * 50).toFixed(2)),
    light: Math.floor(Math.random() * 4095),
    motion: Math.random() > 0.5 ? 1 : 0,
  };

  // SAME LOGIC as /data
  let lightLevel = 0;
  if (data.light < 600) lightLevel = 3;
  else if (data.light < 1800) lightLevel = 2;
  else if (data.light < 3000) lightLevel = 1;

  let comfortIndex = data.temp + data.hum / 30;
  if (data.hum > 65) comfortIndex += 1.5;

  let fanLevel = comfortIndex < 26 ? 1 : comfortIndex < 32 ? 2 : 3;

  latestData = {
    ...data,
    fanLevel,
    lightLevel,
  };

  console.log("Auto Simulated:", latestData);

  if (data.motion === 1) {
    const datetime = getFormattedDateTime();
    const line = `${datetime},${data.temp},${data.hum},${data.light},${data.motion},${fanLevel},${lightLevel}\n`;

    fs.appendFileSync(FILE, line);
  }
}, 5000);

//
// GET latest
//
app.get("/latest", (req, res) => {
  res.json(latestData);
});

//
// OPTIONAL health check
//
app.get("/", (req, res) => {
  res.send("Smart Room Backend Running 🚀");
});

//
// START SERVER
//
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
