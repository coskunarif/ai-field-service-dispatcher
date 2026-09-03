import crypto from 'crypto';

// Maps for tracking fallback and pending notes
export const dispatchLogsStore = new Map();
export const pendingNotes = new Map();

function getStableJobCoords(uuidStr) {
  let hash = 0;
  for (let i = 0; i < uuidStr.length; i++) {
    hash = uuidStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const latOffset = ((hash & 0xff) / 255 - 0.5) * 0.015;
  const lngOffset = (((hash >> 8) & 0xff) / 255 - 0.5) * 0.015;
  return [41.8781 + latOffset, -87.6298 + lngOffset];
}

export async function getTrackingDetails(id, sql) {
  if (sql) {
    try {
      const results = await sql`
        SELECT * FROM gainhelm_dispatch_logs
        WHERE id = ${id}
      `;
      if (results.length > 0) {
        return results[0];
      }
    } catch (err) {
      console.error('Failed to fetch tracking details from DB:', err);
    }
  }
  return dispatchLogsStore.get(id);
}

export async function saveNote(id, note, sql) {
  // Update in-memory fallback
  const logDetails = dispatchLogsStore.get(id);
  let stepLogs = [];
  if (logDetails) {
    try {
      stepLogs =
        typeof logDetails.step_logs === 'string'
          ? JSON.parse(logDetails.step_logs)
          : logDetails.step_logs || [];
    } catch {
      stepLogs = [];
    }
    stepLogs.push(`📱 Customer sent entry note: ${note}`);
    logDetails.step_logs = JSON.stringify(stepLogs);
    dispatchLogsStore.set(id, logDetails);
  }

  // Update DB if sql is active
  if (sql) {
    try {
      const results = await sql`
        SELECT step_logs FROM gainhelm_dispatch_logs
        WHERE id = ${id}
      `;
      if (results.length > 0) {
        try {
          stepLogs =
            typeof results[0].step_logs === 'string'
              ? JSON.parse(results[0].step_logs)
              : results[0].step_logs || [];
        } catch {
          stepLogs = [];
        }
        stepLogs.push(`📱 Customer sent entry note: ${note}`);
        await sql`
          UPDATE gainhelm_dispatch_logs
          SET step_logs = ${JSON.stringify(stepLogs)}
          WHERE id = ${id}
        `;
      }
    } catch (err) {
      console.error('Failed to save note in database:', err);
    }
  }

  // Save to pending notes for the dashboard poller
  if (!pendingNotes.has(id)) {
    pendingNotes.set(id, []);
  }
  pendingNotes.get(id).push(note);
}

export function pollNotes(id) {
  const notes = pendingNotes.get(id) || [];
  pendingNotes.delete(id);
  return notes;
}

export function renderTrackingPage(dispatch, context) {
  if (!dispatch) {
    return `<!DOCTYPE html>
<html>
<head>
<title>Tracking Not Found - Gainhelm</title>
</head>
<body style="background: #030712; color: #f3f4f6; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
<div style="text-align: center;">
  <h1>Tracking Link Not Found or Expired</h1>
  <p>The tracking ID provided is invalid or has expired.</p>
</div>
</body>
</html>`;
  }

  const technicians =
    context && typeof context.technicians === 'string'
      ? JSON.parse(context.technicians)
      : context?.technicians || [];

  const techName = dispatch.dispatched_to_name || 'Sarah Connor';
  const tech = technicians.find(t => t.name === techName) || technicians[0];

  const techLat = tech ? parseFloat(tech.lat) : 41.8781;
  const techLng = tech ? parseFloat(tech.lng) : -87.6298;

  const [jobLat, jobLng] = getStableJobCoords(dispatch.id);

  let trafficLabel = 'Normal';
  const tm = parseFloat(dispatch.traffic_multiplier || '1.0');
  if (tm === 1.8) trafficLabel = 'Rush Hour';
  else if (tm === 3.0) trafficLabel = 'Accident';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Live Tech Tracking - ${techName}</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="/route-optimizer.js"></script>
<style>
  :root {
    --bg: #080d17;
    --bg-2: rgba(15, 23, 42, 0.75);
    --border: rgba(255, 255, 255, 0.08);
    --text: #f8fafc;
    --text-muted: #94a3b8;
    --brand: #10b981;
    --brand-dark: #059669;
  }
  body {
    background-color: var(--bg);
    color: var(--text);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    margin: 0;
    padding: 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    -webkit-font-smoothing: antialiased;
  }
  .container {
    max-width: 840px;
    margin: 0 auto;
    padding: 24px 20px 60px 20px;
    width: 100%;
    box-sizing: border-box;
  }
  header {
    border-bottom: 1px solid var(--border);
    padding-bottom: 16px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  h1 {
    font-size: 1.4rem;
    margin: 0;
    color: #fff;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  .card {
    background-color: var(--bg-2);
    backdrop-filter: blur(16px);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 20px;
    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }
  .flex-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }
  .eta-badge {
    font-size: 1.15rem;
    font-weight: 700;
    color: #34d399;
    background: rgba(16, 185, 129, 0.1);
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid rgba(16, 185, 129, 0.25);
    font-family: 'JetBrains Mono', monospace;
  }
  #map {
    height: 400px;
    border-radius: 12px;
    border: 1px solid var(--border);
    margin-bottom: 20px;
    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5);
  }
  .tech-info {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .tech-avatar {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 1.2rem;
    color: #fff;
    box-shadow: 0 0 16px rgba(16, 185, 129, 0.35);
  }
  .form-group {
    margin-top: 16px;
  }
  textarea {
    width: 100%;
    height: 84px;
    background: #030712;
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    padding: 12px 14px;
    font-size: 0.9rem;
    font-family: inherit;
    resize: none;
    box-sizing: border-box;
    margin-bottom: 12px;
    transition: all 0.2s ease;
  }
  textarea:focus {
    outline: none;
    border-color: var(--brand);
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  }
  button {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #020617;
    font-weight: 700;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.15s ease;
    box-shadow: 0 2px 10px rgba(16, 185, 129, 0.3);
  }
  button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
  }
  button:active {
    transform: translateY(0) scale(0.98);
  }
  .notes-section h3 {
    margin-top: 0;
    margin-bottom: 12px;
    font-size: 1.1rem;
    color: #fff;
  }
  #notes-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  #notes-list li {
    background: #030712;
    border: 1px solid var(--border);
    padding: 10px 14px;
    border-radius: 6px;
    margin-bottom: 8px;
    font-size: 0.85rem;
    color: #cbd5e1;
  }
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>Gainhelm Live Tracking</h1>
    <div class="logo" style="font-weight: 800; color: var(--brand);">GAINHELM</div>
  </header>

  <div class="card">
    <div class="flex-row">
      <div class="tech-info">
        <div class="tech-avatar">${techName.charAt(0)}</div>
        <div>
          <div style="font-weight: bold; font-size: 1.1rem; color: #fff;">${techName}</div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">Your Dispatch Technician</div>
        </div>
      </div>
      <div class="eta-badge">
        ETA: <span id="eta-val">${dispatch.duration_mins || 15}</span> mins (${dispatch.distance_miles || 5} miles)
      </div>
    </div>
    <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 8px;">
      Condition: <strong>${trafficLabel} Traffic</strong> | Status: <strong>Technician En Route</strong>
    </div>
  </div>

  <div id="map"></div>

  <div class="card">
    <div class="notes-section">
      <h3>Driver Notes & Instructions</h3>
      <form id="note-form" action="/app/track/${dispatch.id}/note" method="POST">
        <textarea name="note" id="note-input" maxlength="250" placeholder="Type entry instructions or gate code for your tech..." required></textarea>
        <div style="text-align: right;">
          <button type="submit">Send Note</button>
        </div>
      </form>
      <div style="margin-top: 20px;">
        <h4 style="margin-bottom: 8px; color: var(--text-muted);">Sent Notes:</h4>
        <ul id="notes-list">
          <!-- Dynamically populated or from existing logs -->
        </ul>
      </div>
    </div>
  </div>
</div>

<script>
  document.addEventListener('DOMContentLoaded', () => {
    const techLat = ${techLat};
    const techLng = ${techLng};
    const jobLat = ${jobLat};
    const jobLng = ${jobLng};
    const techName = "${techName}";

    let map;
    if (typeof L !== 'undefined') {
      map = L.map('map');
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
      }).addTo(map);

      const greenIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const orangeIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const techMarker = L.marker([techLat, techLng], { icon: greenIcon }).addTo(map);
      techMarker.bindPopup("<b>" + techName + "</b> (Your Technician)").openPopup();

      const jobMarker = L.marker([jobLat, jobLng], { icon: orangeIcon }).addTo(map);
      jobMarker.bindPopup("<b>Your Job Location</b>");

      map.fitBounds([[techLat, techLng], [jobLat, jobLng]], { padding: [50, 50] });

      const polyline = L.polyline([[techLat, techLng], [jobLat, jobLng]], {
        color: '#10b981',
        dashArray: '5, 10',
        weight: 3
      }).addTo(map);

      if (typeof RouteOptimizer !== 'undefined') {
        RouteOptimizer.animateMarker(techMarker, polyline, [techLat, techLng], [jobLat, jobLng], 4000);
      }
    }

    // Ajax Form Submit
    const form = document.getElementById('note-form');
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const noteInput = document.getElementById('note-input');
      const note = noteInput.value.trim();
      if (!note) return;

      fetch(this.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note })
      }).then(res => res.json())
        .then(data => {
          if (data.success) {
            noteInput.value = '';
            const li = document.createElement('li');
            li.textContent = note;
            document.getElementById('notes-list').appendChild(li);
          } else {
            alert('Failed to send note: ' + (data.error || 'unknown error'));
          }
        }).catch(err => {
          console.error('Error submitting note:', err);
          // Fallback to standard form submit if fetch fails
          form.submit();
        });
    });
  });
</script>
</body>
</html>`;
}
