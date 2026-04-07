const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(cors());

const path = require("path");

const FILE = path.join(__dirname, "..", "data", "data.csv");

// Initialize CSV file with headers if not exists
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

// Helper → formatted date-time (CSV safe)
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

// receive ESP32 data
app.post("/data", (req, res) => {
  try {
    const { temp, hum, light, motion } = req.body;

    // Validate all fields
    if (
      temp === undefined ||
      hum === undefined ||
      light === undefined ||
      motion === undefined
    ) {
      console.warn("Incomplete data:", req.body);
      return res.status(400).json({ error: "Incomplete data" });
    }

    // Convert to numbers (safe)
    const parsedData = {
      temp: Number(temp),
      hum: Number(hum),
      light: Number(light),
      motion: Number(motion),
    };

    // LIGHT LEVEL LOGIC
    let lightLevel = 0;
    if (parsedData.light < 600) {
      lightLevel = 3;
    } else if (parsedData.light < 1800) {
      lightLevel = 2;
    } else if (parsedData.light < 3000) {
      lightLevel = 1;
    } else {
      lightLevel = 0;
    }

    // FAN LEVEL LOGIC
    let comfortIndex = parsedData.temp + parsedData.hum / 30;
    if (parsedData.hum > 65) comfortIndex += 1.5;

    let fanLevel = 1;
    if (comfortIndex < 26) {
      fanLevel = 1;
    } else if (comfortIndex < 32) {
      fanLevel = 2;
    } else {
      fanLevel = 3;
    }

    latestData = {
      ...parsedData,
      fanLevel,
      lightLevel,
    };
    console.log("Received:", latestData);

    if (parsedData.motion === 1) {
      const datetime = getFormattedDateTime();
      const line = `${datetime},${parsedData.temp},${parsedData.hum},${parsedData.light},${parsedData.motion},${fanLevel},${lightLevel}\n`;

      fs.appendFileSync(FILE, line);

      console.log("Saved to CSV (motion detected)");
    }

    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// send latest data to dashboard
app.get("/latest", (req, res) => {
  res.json(latestData);
});

// start server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
