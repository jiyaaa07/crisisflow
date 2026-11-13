
import { useState, useEffect} from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

// DELHI MAP CENTER
const DELHI_CENTER = [28.6139, 77.2090];

// Approximate neighborhood coordinates for demo incidents.
// These are not verified emergency addresses.
const locationCoordinates = [
  { name: "Lajpat Nagar", coords: [28.5677, 77.2433] },
  { name: "Connaught Place", coords: [28.6315, 77.2167] },
  { name: "Saket", coords: [28.5245, 77.2066] },
  { name: "Jangpura", coords: [28.5833, 77.2500] },
  { name: "Pitampura", coords: [28.6980, 77.1310] },
  { name: "Rohini", coords: [28.7495, 77.0565] },
  { name: "Dwarka", coords: [28.5921, 77.0460] },
  { name: "Karol Bagh", coords: [28.6514, 77.1907] },
  { name: "Chandni Chowk", coords: [28.6506, 77.2303] },
  { name: "South Delhi", coords: [28.5355, 77.2100] },
];


function getCoordinates(location) {
  if (!location || typeof location !== "string") {
    return null;
  }

  const normalizedLocation = location.toLowerCase();

  const match = locationCoordinates.find((place) =>
    normalizedLocation.includes(place.name.toLowerCase())
  );

  return match ? match.coords : null;
}


// CUSTOM MARKER ICON
function createIncidentIcon(priority) {
  const color =
    priority?.toLowerCase() === "critical"
      ? "#ff4d68"
      : priority?.toLowerCase() === "high"
      ? "#ff9f43"
      : "#f5ce4e";

  return L.divIcon({
    className: "custom-map-icon",
    html: `
      <div class="incident-marker" style="--marker-color:${color}">
        <span></span>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

// INITIAL INCIDENT DATA
const initialIncidents = [
  {
    id: "CF-001",
    type: "Flood",
    location: "Lajpat Nagar, Delhi",
    description:
      "Three people trapped on a rooftop. Water level rising.",
    priority: "Critical",
    score: 94,
    reports: 4,
    people: 3,
    status: "Active",
    action: "Request immediate water rescue",
    confidence: 94,
  },
  {
    id: "CF-002",
    type: "Fire",
    location: "Connaught Place, Delhi",
    description:
      "Fire reported in a commercial building.",
    priority: "High",
    score: 76,
    reports: 3,
    people: 8,
    status: "Active",
    action: "Request fire response team",
    confidence: 88,
  },
  {
    id: "CF-003",
    type: "Medical",
    location: "Saket, Delhi",
    description:
      "An injured person requires medical assistance.",
    priority: "Medium",
    score: 52,
    reports: 2,
    people: 1,
    status: "Active",
    action: "Request ambulance assessment",
    confidence: 91,
  },
  {
    id: "CF-004",
    type: "Infrastructure",
    location: "Jangpura, Delhi",
    description:
      "Electricity poles reported fallen near main road.",
    priority: "High",
    score: 71,
    reports: 2,
    people: 0,
    status: "Active",
    action: "Request electrical safety inspection",
    confidence: 82,
  },
];

// MAP COMPONENT

function MapController({ selected }) {
  const map = useMap();

  useEffect(() => {
    if (!selected) return;

    const coords =
      selected.coordinates || getCoordinates(selected.location);

    // Do not move the map if the location is unknown
    if (!coords) return;

    map.flyTo(coords, 14, {
      duration: 1.2,
    });
  }, [selected, map]);

  return null;
}

function IncidentMap({ incidents, onSelect, selected }) {
  return (
    <MapContainer
      center={DELHI_CENTER}
      zoom={11}
      scrollWheelZoom={true}
      className="crisis-map"
    >
      <MapController selected={selected} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      
      

    {incidents
  .filter((incident) => incident.status !== "Resolved")
  .map((incident) => {
    const coordinates =
      incident.coordinates || getCoordinates(incident.location);

    if (!coordinates) return null;

    return (
      <Marker
        key={incident.id}
        position={coordinates}
        icon={createIncidentIcon(incident.priority)}
        eventHandlers={{
          click: () => onSelect(incident),
        }}
      >
        <Popup>
          <div className="map-popup">
            <strong>{incident.type} Emergency</strong>
            <p>{incident.location}</p>
            <p>Priority: {incident.priority}</p>
            <p>Score: {incident.score}/100</p>
            <p>Status: {incident.status}</p>
          </div>
        </Popup>
      </Marker>
    );
  })}
    </MapContainer>
  );
}

function getResourceRecommendations(incident) {
  if (!incident) return [];

  const type = incident.type.toLowerCase();
  const priority = incident.priority.toLowerCase();

  let resources = [];

  if (type.includes("fire")) {
    resources = [
      { name: "Fire Engine", reason: "Fire suppression and containment", icon: "🚒" },
      { name: "Rescue Team", reason: "Evacuation and trapped-person rescue", icon: "🧑‍🚒" },
      { name: "Protective Equipment", reason: "Safety gear for responders", icon: "🛡️" },
    ];
  } else if (type.includes("medical")) {
    resources = [
      { name: "Ambulance", reason: "Medical transport and emergency care", icon: "🚑" },
      { name: "Medical Team", reason: "First aid and patient assessment", icon: "🩺" },
      { name: "First Aid Kit", reason: "Immediate medical assistance", icon: "🧰" },
    ];
  } else if (type.includes("flood")) {
    resources = [
      { name: "Rescue Boat", reason: "Water rescue and evacuation", icon: "🚤" },
      { name: "Disaster Response Team", reason: "Rescue and evacuation support", icon: "🦺" },
      { name: "Life Jackets", reason: "Water safety for affected people", icon: "🛟" },
    ];
  } else if (type.includes("infrastructure")) {
    resources = [
      { name: "Electrical Safety Team", reason: "Inspect dangerous electrical hazards", icon: "⚡" },
      { name: "Utility Crew", reason: "Repair damaged infrastructure", icon: "🔧" },
      { name: "Safety Barricades", reason: "Secure the affected area", icon: "🚧" },
    ];
  } else {
    resources = [
      { name: "Emergency Assessment Team", reason: "Assess the reported situation", icon: "🦺" },
      { name: "Local Response Unit", reason: "Provide initial response support", icon: "🚨" },
    ];
  }

  if (priority === "critical") {
    resources.unshift({
      name: "Immediate Response Unit",
      reason: "Critical incident requiring urgent human assessment",
      icon: "🚨",
    });
  }

  return resources;
}

function App() {
 const [incidents, setIncidents] = useState(() => {
  try {
    const savedIncidents = localStorage.getItem("crisisflow_incidents");
    return savedIncidents ? JSON.parse(savedIncidents) : initialIncidents;
  } catch {
    return initialIncidents;
  }
});
  const [selected, setSelected] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("crisisflow_incidents") || "null");
      const savedId = localStorage.getItem("crisisflow_selected_id");
      return (Array.isArray(saved) && saved.find((item) => item.id === savedId))
        || (Array.isArray(saved) && saved[0])
        || initialIncidents[0];
    } catch {
      return initialIncidents[0];
    }
  });
  const [report, setReport] = useState("");
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Persist both the incident list and the currently selected incident.
  useEffect(() => {
    try {
      localStorage.setItem("crisisflow_incidents", JSON.stringify(incidents));
      if (selected?.id) {
        localStorage.setItem("crisisflow_selected_id", selected.id);
      }
    } catch (storageError) {
      console.error("Could not save CrisisFlow data:", storageError);
      setMessage("Browser storage is unavailable. Changes may not survive refresh.");
    }
  }, [incidents, selected]);

  // Keep the selected panel synchronized with the latest saved incident object.
  useEffect(() => {
    if (!selected) return;
    const latest = incidents.find((item) => item.id === selected.id);
    if (latest && latest !== selected) setSelected(latest);
    if (!latest && incidents.length) setSelected(incidents[0]);
  }, [incidents]);
  const activeIncidents = incidents.filter(
    (i) => i.status !== "Resolved"
  );

  const critical = activeIncidents.filter(
    (i) => i.priority === "Critical"
  ).length;

  const high = activeIncidents.filter(
    (i) => i.priority === "High"
  ).length;

  const resolved = incidents.filter(
    (i) => i.status === "Resolved"
  ).length;

  // GEMINI AI REPORT ANALYSIS
  async function processReport() {
    if (!report.trim()) {
      setMessage("Please enter an emergency report first.");
      return;
    }

    setIsProcessing(true);
    setMessage("Gemini AI is analysing the emergency report...");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: report,
          }),
          signal: AbortSignal.timeout(45000),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "AI analysis failed."
        );
      }

      const ai = data.incident || data;

      const type =
        ai.incident_type || ai.type || "General Emergency";

      const location =
        ai.location || "Location requires verification";

      const priority =
        data.priority || ai.priority || ai.urgency || "High";

      const score = Math.min(
        100,
        Math.max(
          0,
          Number(data.priority_score ?? ai.priority_score ?? ai.score ?? 68)
        )
      );

      const people = Number(
        ai.people_affected ?? ai.people_trapped ?? 0
      );

      const action =
        data.recommended_action ||
        ai.recommended_action ||
        ai.resource_required ||
        ai.action ||
        "Human verification required";

      const confidence = Number(
        ai.confidence_score ??
        ai.ai_confidence ??
        ai.confidence ??
        75
      );

      const description = ai.summary || report;

      // CHECK FOR POTENTIAL DUPLICATES
      const existing = incidents.find(
        (i) =>
          i.type.toLowerCase() === type.toLowerCase() &&
          i.location.toLowerCase() === location.toLowerCase() &&
          i.status !== "Resolved"
      );

      if (existing) {
        const updated = incidents.map((i) =>
          i.id === existing.id
            ? {
                ...i,
                reports: Number(i.reports || 1) + 1,
                score: Math.max(i.score, score),
                people: Math.max(i.people, people),
              }
            : i
        );

        setIncidents(updated);

        setSelected(
          updated.find((i) => i.id === existing.id)
        );

        setMessage(
          "Potential duplicate detected and linked to existing incident."
        );
      } else {
        const newIncident = {
          id: `CF-${String(Date.now()).slice(-6)}`,
          type,
          location,
          description,
          priority,
          score,
          reports: 1,
          people,
          status: "Active",
          action,
          confidence,
        };

        setIncidents((prev) => [
          newIncident,
          ...prev,
        ]);

        setSelected(newIncident);

        setMessage(
          "Gemini AI successfully analysed the report. New incident created."
        );
      }

      setReport("");

    } catch (error) {
      console.error("AI Analysis Error:", error);
      const friendlyError = error.name === "TimeoutError" || error.name === "AbortError"
        ? "The AI request took too long. Please try again."
        : error.message;
      setMessage(`Error: ${friendlyError}`);
    } finally {
      setIsProcessing(false);
    }
  }

  // RESOLVE INCIDENT
  function resolveIncident(id) {
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: "Resolved" }
          : i
      )
    );

    setSelected((prev) =>
      prev?.id === id
        ? { ...prev, status: "Resolved" }
        : prev
    );
  }

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">✦</div>
          <div>
            <h2>CrisisFlow</h2>
            <span>EMERGENCY INTELLIGENCE</span>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <div className="nav-item active">
          ◫ &nbsp; Command Center
        </div>

        <div className="nav-item">
          ◎ &nbsp; Live Incidents
        </div>

        <div className="nav-item">
          ⌖ &nbsp; Situation Map
        </div>

        <div className="nav-item">
          ◷ &nbsp; Activity Timeline
        </div>

        <div className="nav-label">SYSTEM</div>

        <div className="nav-item">
          ⚙ &nbsp; Settings
        </div>

        <div className="sidebar-bottom">
          <div className="online-dot"></div>
          <div>
            <strong>System Online</strong>
            <span>Prototype environment</span>
          </div>
        </div>

      </aside>

      {/* MAIN DASHBOARD */}
      <main className="main">

        {/* HEADER */}
        <header className="topbar">
          <div>
            <div className="breadcrumb">
              Workspace / Command Center
            </div>

            <h1>Emergency Command Center</h1>

            <p>
              Real-time intelligence for coordinated emergency response.
            </p>
          </div>

          <div className="top-status">
            <span className="online-dot"></span>
            LIVE SYSTEM
          </div>
        </header>

        {/* STATISTICS */}
        <section className="stats">

          <div className="stat-card">
            <span>Total Incidents</span>
            <strong>{incidents.length}</strong>
            <small>All recorded incidents</small>
          </div>

          <div className="stat-card red">
            <span>Critical Priority</span>
            <strong>{critical}</strong>
            <small>Immediate attention</small>
          </div>

          <div className="stat-card orange">
            <span>High Priority</span>
            <strong>{high}</strong>
            <small>Urgent assessment</small>
          </div>

          <div className="stat-card green">
            <span>Resolved</span>
            <strong>{resolved}</strong>
            <small>Closed incidents</small>
          </div>

        </section>

        {/* MAP AND INCIDENT INTELLIGENCE */}
        <section className="content-grid">

          <div className="panel map-panel">

            <div className="panel-heading">
              <div>
                <h3>Live Situation Map</h3>
                <p>Delhi emergency incident locations</p>
              </div>

              <span className="map-tag">
                DELHI, IN
              </span>
            </div>

            <div className="map-container">
              <IncidentMap
              incidents={incidents}
              onSelect={setSelected}
              selected={selected}
            />
            </div>

            <div className="legend">
              <span>
                <i className="red-dot"></i> Critical
              </span>
              <span>
                <i className="orange-dot"></i> High
              </span>
              <span>
                <i className="yellow-dot"></i> Medium
              </span>
            </div>

            <p className="map-disclaimer">
              Approximate demo locations. Not for real-world emergency dispatch.
            </p>

          </div>

          {/* INCIDENT INTELLIGENCE */}
          <div className="panel details-panel">

            <div className="panel-heading">
              <div>
                <h3>Incident Intelligence</h3>
                <p>Selected incident analysis</p>
              </div>

              <span className="ai-badge">
                ✦ AI INSIGHTS
              </span>
            </div>

            {selected && (
              <>
                <div className="incident-id">
                  {selected.id}
                </div>

                <h2>{selected.type} Emergency</h2>

                <p className="location">
                  ⌖ {selected.location}
                </p>

                <div className="priority-row">
                  <span className={`priority ${selected.priority.toLowerCase()}`}>
                    {selected.priority}
                  </span>

                  <strong>{selected.score}/100</strong>
                </div>

                <div className="score-track">
                  <div
                    style={{
                      width: `${selected.score}%`,
                    }}
                  ></div>
                </div>

                <div className="detail-stats">
                  <div>
                    <strong>{selected.reports}</strong>
                    <span>Reports</span>
                  </div>

                  <div>
                    <strong>{selected.people}</strong>
                    <span>People affected*</span>
                  </div>

                  <div>
                    <strong>{selected.confidence}%</strong>
                    <span>AI confidence*</span>
                  </div>
                </div>

                <div className="analysis-box">
                  <h4>REPORT SUMMARY</h4>
                  <p>{selected.description}</p>
                </div>

                <div className="recommendation">
                  <span>✦ RECOMMENDED ACTION</span>
                  <p>{selected.action}</p>
                </div>

            <div className="resource-recommendations">
              <h4>✦ SUGGESTED EMERGENCY RESOURCES</h4>

              {getResourceRecommendations(selected).map((resource, index) => (
                <div className="resource-card" key={index}>
                  <span className="resource-icon">{resource.icon}</span>

                  <div className="resource-info">
                    <strong>{resource.name}</strong>
                    <p>{resource.reason}</p>
                  </div>

                  <span className="resource-status">Suggested</span>
                </div>
              ))}
            </div>


                <div className="verification-note">
                  *Demo/model estimates. Human verification is required.
                </div>

                <button
                  className="resolve-button"
                  disabled={selected.status === "Resolved"}
                  onClick={() => resolveIncident(selected.id)}
                >
                  {selected.status === "Resolved"
                    ? "Incident Resolved"
                    : "Mark as Resolved"}
                </button>
              </>
            )}

          </div>

        </section>

        {/* EMERGENCY REPORT INTAKE */}
        <section className="panel report-panel">

          <div className="panel-heading">
            <div>
              <h3>Emergency Report Intake</h3>
              <p>
                Submit an incoming emergency message for AI processing.
              </p>
            </div>

            <span className="ai-badge">
              ✦ INTELLIGENCE ENGINE
            </span>
          </div>

          <textarea
            placeholder="Example: URGENT! Three people trapped in a flooded building near Lajpat Nagar..."
            value={report}
            onChange={(e) => setReport(e.target.value)}
            disabled={isProcessing}
          />

          <div className="submit-row">
            <span>
              Gemini AI processing · Prototype only
            </span>

            <button
              onClick={processReport}
              disabled={isProcessing}
            >
              {isProcessing
                ? "Analysing..."
                : "Process Report →"}
            </button>
          </div>

          {message && (
            <p className="feedback">{message}</p>
          )}

        </section>

        {/* PRIORITY QUEUE */}
        <section className="panel incidents-panel">

          <div className="panel-heading">
            <div>
              <h3>Priority Queue</h3>
              <p>
                {activeIncidents.length} active incidents requiring attention
              </p>
            </div>
          </div>

          {incidents.map((item) => (
            <button
              className={`incident-row ${
                selected?.id === item.id ? "selected-row" : ""
              }`}
              key={item.id}
              onClick={() => setSelected(item)}
            >
              <span
                className={`severity-dot ${item.priority.toLowerCase()}`}
              ></span>

              <span className="incident-name">
                <strong>
                  {item.type} — {item.location}
                </strong>

                <small>
                  {item.id} · {item.reports} supporting reports
                </small>
              </span>

              <span className={`priority ${item.priority.toLowerCase()}`}>
                {item.priority}
              </span>

              <strong className="row-score">
                {item.score}
              </strong>

              <span className="row-status">
                {item.status}
              </span>
            </button>
          ))}

        </section>

        <footer>
          CRISISFLOW · AI-POWERED EMERGENCY COORDINATION · PROTOTYPE
        </footer>

      </main>
    </div>
  );
}

export default App;
