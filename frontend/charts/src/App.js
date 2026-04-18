import React, { useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import bg from "./assets/background.jpg";

function App() {
  const [date, setDate] = useState("");
  const [data, setData] = useState([]);
  const [searched, setSearched] = useState(false);

  const fetchData = async () => {
    if (!date) return alert("Select date");

    setSearched(true);

    try {
      const res = await axios.get(
        `https://smart-room-2.onrender.com/analytics?date=${date}`,
      );
      setData(res.data);
    } catch (err) {
      setData([]);
    }
  };

  // THEME COLORS
  const themeColor = "#a0a6ec";

  // Glass Card (MATCHED)
  const glassCard = {
    background: "rgba(96, 91, 91, 0.12)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderRadius: "14px",
    padding: "8px 10px",
    flex: 1,
    color: "white",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        margin: 0,
        fontFamily: "Inter, sans-serif",
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* MAIN GLASS CONTAINER */}
      <div
        style={{
          width: "60%",
          maxHeight: "80vh",
          borderRadius: "18px",
          padding: "16px",
          background: "rgba(71, 69, 69, 0.35)",
          backdropFilter: "blur(10px)",
          display: "flex",
          flexDirection: "column",
          color: "white",
        }}
      >
        {/* TOPBAR */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <h3 style={{ margin: 0 }}>Smart Living Dashboard</h3>

          <button
            onClick={() =>
              (window.location.href =
                "https://dulcet-tiramisu-040773.netlify.app/")
            }
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              border: "none",
              background: "rgba(255,255,255,0.2)",
              color: "white",
              cursor: "pointer",
            }}
          >
            ⬅ Dashboard
          </button>
        </div>

        {/* CONTROLS */}
        <div style={{ marginBottom: "10px" }}>
          <input
            type="date"
            onChange={(e) => setDate(e.target.value)}
            style={{
              padding: "6px 8px",
              borderRadius: "6px",
              border: "none",
              marginRight: "8px",
              background: "rgba(255,255,255,0.2)",
              color: "white",
            }}
          />
          <button
            onClick={fetchData}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border: "none",
              background: themeColor,
              color: "white",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </div>

        {/* GRAPHS */}
        {data.length > 0 && (
          <>
            {/* ROW 1 */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "10px" }}>
              <div style={glassCard}>
                <h4 style={{ fontSize: "13px", marginBottom: "4px" }}>
                  🌡 Temp & Humidity
                </h4>
                <ResponsiveContainer width="100%" height={110}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#9993" />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 10, fill: "#ccc" }}
                    />
                    <YAxis hide />
                    <Tooltip
                      formatter={(value) =>
                        typeof value === "number" ? value.toFixed(2) : value
                      }
                    />
                    <Line dataKey="temp" stroke="#ff5e5e" dot={false} />
                    <Line dataKey="hum" stroke={themeColor} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={glassCard}>
                <h4 style={{ fontSize: "13px", marginBottom: "4px" }}>
                  🌀 Fan Usage
                </h4>
                <ResponsiveContainer width="100%" height={110}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#9993" />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 10, fill: "#ccc" }}
                    />
                    <YAxis hide />
                    <Tooltip
                      formatter={(value) =>
                        typeof value === "number" ? value.toFixed(2) : value
                      }
                    />
                    <Line dataKey="fanLevel" stroke="#33d46e" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ROW 2 */}
            <div style={{ display: "flex", gap: "12px" }}>
              <div style={glassCard}>
                <h4 style={{ fontSize: "13px", marginBottom: "4px" }}>
                  🔆 Light Available
                </h4>
                <ResponsiveContainer width="100%" height={110}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#9993" />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 10, fill: "#ccc" }}
                    />
                    <YAxis hide />
                    <Tooltip
                      formatter={(value) =>
                        typeof value === "number" ? value.toFixed(2) : value
                      }
                    />
                    <Line dataKey="light" stroke="#ffac1e" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={glassCard}>
                <h4 style={{ fontSize: "13px", marginBottom: "4px" }}>
                  💡 Light Usage
                </h4>
                <ResponsiveContainer width="100%" height={110}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#9993" />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 10, fill: "#ccc" }}
                    />
                    <YAxis hide />
                    <Tooltip
                      formatter={(value) =>
                        typeof value === "number" ? value.toFixed(2) : value
                      }
                    />
                    <Line dataKey="lightLevel" stroke="#33d46e" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {searched && data.length === 0 && (
          <p style={{ textAlign: "center", marginTop: "20px", color: "#ccc" }}>
            No data found for selected date
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
