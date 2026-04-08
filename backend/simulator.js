const axios = require("axios");

setInterval(async () => {
  const data = {
    temp: (20 + Math.random() * 12).toFixed(2),
    hum: (30 + Math.random() * 50).toFixed(2),
    light: Math.floor(Math.random() * 4095),
    motion: Math.random() > 0.5 ? 1 : 0,
    // motion: 1,
  };

  try {
    await axios.post("http://localhost:3000/data", data);
    console.log("Sent:", data);
  } catch (err) {
    console.log("Error sending data");
  }
}, 15000);
