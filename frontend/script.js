document.addEventListener("DOMContentLoaded", () => {
  const l1 = document.getElementById("light1");
  const l2 = document.getElementById("light2");
  const l3 = document.getElementById("light3");

  const fan1 = document.getElementById("fan1");
  const fan2 = document.getElementById("fan2");
  const fan3 = document.getElementById("fan3");

  // Manual states
  let manualFan = 0; // 0 = auto
  let manualLight = 0;

  // Buttons
  const fanPlus = document.getElementById("fanPlus");
  const fanMinus = document.getElementById("fanMinus");
  const lightPlus = document.getElementById("lightPlus");
  const lightMinus = document.getElementById("lightMinus");

  const occLight = document.getElementById("occupancyLight");
  const peopleText = document.getElementById("peopleCount");

  let lastData = null; // store latest sensor data

  // ---------------- UTIL ----------------
  function updateBar(id, value, max) {
    const percent = Math.min((value / max) * 100, 100);
    document.getElementById(id).style.width = percent + "%";
  }

  function updateTime() {
    document.getElementById("time").innerText = new Date().toLocaleString();
  }

  // ---------------- BUTTON STATE ----------------
  function updateButtonStates() {
    fanMinus.disabled = manualFan <= 1;
    fanPlus.disabled = manualFan >= 3;

    lightMinus.disabled = manualLight <= 1;
    lightPlus.disabled = manualLight >= 3;
  }

  // ---------------- APPLY UI ----------------
  function applyFanUI(data) {
    fan1.classList.remove("fan-active");
    fan2.classList.remove("fan-active");
    fan3.classList.remove("fan-active");

    if (manualFan > 0) {
      if (manualFan >= 1) fan1.classList.add("fan-active");
      if (manualFan >= 2) fan2.classList.add("fan-active");
      if (manualFan >= 3) fan3.classList.add("fan-active");
    } else if (data && data.motion) {
      const temp = Number(data.temp) || 0;
      const hum = Number(data.hum) || 0;

      let comfortIndex = temp + hum / 30;
      if (hum > 65) comfortIndex += 1.5;

      if (comfortIndex < 26) {
        fan1.classList.add("fan-active");
      } else if (comfortIndex < 32) {
        fan1.classList.add("fan-active");
        fan2.classList.add("fan-active");
      } else {
        fan1.classList.add("fan-active");
        fan2.classList.add("fan-active");
        fan3.classList.add("fan-active");
      }
    }
  }

  function applyLightUI(data) {
    l1.classList.remove("light-active");
    l2.classList.remove("light-active");
    l3.classList.remove("light-active");

    if (manualLight > 0) {
      if (manualLight >= 1) l1.classList.add("light-active");
      if (manualLight >= 2) l2.classList.add("light-active");
      if (manualLight >= 3) l3.classList.add("light-active");
    } else if (data && data.motion) {
      if (data.light < 600) {
        l1.classList.add("light-active");
        l2.classList.add("light-active");
        l3.classList.add("light-active");
      } else if (data.light < 1800) {
        l1.classList.add("light-active");
        l2.classList.add("light-active");
      } else if (data.light < 3000) {
        l1.classList.add("light-active");
      }
    }
  }

  // ---------------- CONTROL ----------------
  window.changeFan = function (delta) {
    if (manualFan === 0) manualFan = 1;
    else manualFan = Math.max(1, Math.min(3, manualFan + delta));

    updateButtonStates();
    applyFanUI(lastData);
  };

  window.setFanAuto = function () {
    manualFan = 0;
    updateButtonStates();
    applyFanUI(lastData);
  };

  window.changeLight = function (delta) {
    if (manualLight === 0) manualLight = 1;
    else manualLight = Math.max(1, Math.min(3, manualLight + delta));

    updateButtonStates();
    applyLightUI(lastData);
  };

  window.setLightAuto = function () {
    manualLight = 0;
    updateButtonStates();
    applyLightUI(lastData);
  };

  // ---------------- FETCH ----------------
  async function fetchData() {
    try {
      const res = await fetch("http://localhost:3000/latest");
      const data = await res.json();

      if (!data || data.temp === undefined) return;

      lastData = data;

      // TEXT
      document.getElementById("temp").innerText = data.temp + " °C";
      document.getElementById("hum").innerText = data.hum + " %";
      document.getElementById("light").innerText = data.light;

      // BARS
      updateBar("tempBar", data.temp, 45);
      updateBar("humBar", data.hum, 100);
      updateBar("lightBar", data.light, 4095);

      // OCCUPANCY
      const peopleCount = data.motion ? Math.floor(Math.random() * 3) + 1 : 0;

      peopleText.innerText = peopleCount;

      if (peopleCount > 0) {
        occLight.style.background = "#a0a6ec";
        occLight.style.boxShadow = "0 0 8px #a0a6ec";
      } else {
        occLight.style.background = "#d1d5db";
        occLight.style.boxShadow = "0 0 6px #d1d5db";
      }

      // APPLY UI
      applyFanUI(data);
      applyLightUI(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }

  // ---------------- INIT ----------------
  setInterval(fetchData, 15000);
  setInterval(updateTime, 1000);

  fetchData();
  updateTime();
  updateButtonStates();
});
