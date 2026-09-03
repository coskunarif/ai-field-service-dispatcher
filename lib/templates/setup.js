import { escapeHtml } from '../utils.js';

export const renderSetupPage = (email, context) => {
  const technicians = context ? JSON.parse(context.technicians) : [];
  const businessRules = context
    ? JSON.parse(context.business_rules)
    : { timeout: '3', pricing: '120', rules: '' };
  const calendarConfig = context
    ? JSON.parse(context.calendar_config)
    : { calendar_url: '', sandbox_mode: 'true' };

  let techRows = '';
  if (technicians.length === 0) {
    techRows = `
      <div class="tech-card" id="tech-row-0">
        <div class="tech-card-grid">
          <div>
            <label>Name</label>
            <input type="text" name="tech_name_0" placeholder="John Doe" required>
          </div>
          <div>
            <label>Phone Number</label>
            <input type="tel" name="tech_phone_0" placeholder="+1 (555) 0100" required>
          </div>
          <div>
            <label>Trade Specialty</label>
            <select name="tech_trade_0">
              <option value="HVAC">HVAC</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Landscaping">Landscaping</option>
              <option value="Other">Other / General</option>
            </select>
          </div>
          <div>
            <label>Skills & Certifications</label>
            <input type="text" name="tech_skills_0" placeholder="Emergency repair, wiring">
          </div>
          <div>
            <label>Shift / Working Hours</label>
            <select name="tech_shift_0">
              <option value="Always">Always Available (24/7)</option>
              <option value="Standard">Standard Shift (Mon-Fri 8am-5pm)</option>
              <option value="Night">Night Shift (Mon-Fri 5pm-8am)</option>
              <option value="Weekend">Weekend Only (Sat-Sun)</option>
            </select>
          </div>
          <div>
            <label>Duty Status</label>
            <select name="tech_status_0">
              <option value="active">On Duty (Available)</option>
              <option value="inactive">Off Duty (Unavailable)</option>
            </select>
          </div>
          <div>
            <label>Latitude</label>
            <input type="number" step="any" min="-90" max="90" name="tech_lat_0" placeholder="E.g. 41.8781">
          </div>
          <div>
            <label>Longitude</label>
            <input type="number" step="any" min="-180" max="180" name="tech_lng_0" placeholder="E.g. -87.6298">
          </div>
        </div>
        <button type="button" class="btn-remove-card" onclick="removeTechRow(this)" title="Remove Technician">✕ Remove</button>
      </div>
    `;
  } else {
    technicians.forEach((t, i) => {
      const shift = t.shift || 'Always';
      const status = t.status || 'active';
      techRows += `
        <div class="tech-card" id="tech-row-${i}">
          <div class="tech-card-grid">
            <div>
              <label>Name</label>
              <input type="text" name="tech_name_${i}" value="${escapeHtml(t.name)}" placeholder="John Doe" required>
            </div>
            <div>
              <label>Phone Number</label>
              <input type="tel" name="tech_phone_${i}" value="${escapeHtml(t.phone)}" placeholder="+1 (555) 0100" required>
            </div>
            <div>
              <label>Trade Specialty</label>
              <select name="tech_trade_${i}">
                <option value="HVAC" ${t.trade === 'HVAC' ? 'selected' : ''}>HVAC</option>
                <option value="Plumbing" ${t.trade === 'Plumbing' ? 'selected' : ''}>Plumbing</option>
                <option value="Electrical" ${t.trade === 'Electrical' ? 'selected' : ''}>Electrical</option>
                <option value="Cleaning" ${t.trade === 'Cleaning' ? 'selected' : ''}>Cleaning</option>
                <option value="Landscaping" ${t.trade === 'Landscaping' ? 'selected' : ''}>Landscaping</option>
                <option value="Other" ${t.trade === 'Other' || !['HVAC', 'Plumbing', 'Electrical', 'Cleaning', 'Landscaping'].includes(t.trade) ? 'selected' : ''}>Other / General</option>
              </select>
            </div>
            <div>
              <label>Skills & Certifications</label>
              <input type="text" name="tech_skills_${i}" value="${escapeHtml(t.skills || '')}" placeholder="Emergency repair, wiring">
            </div>
            <div>
              <label>Shift / Working Hours</label>
              <select name="tech_shift_${i}">
                <option value="Always" ${shift === 'Always' ? 'selected' : ''}>Always Available (24/7)</option>
                <option value="Standard" ${shift === 'Standard' ? 'selected' : ''}>Standard Shift (Mon-Fri 8am-5pm)</option>
                <option value="Night" ${shift === 'Night' ? 'selected' : ''}>Night Shift (Mon-Fri 5pm-8am)</option>
                <option value="Weekend" ${shift === 'Weekend' ? 'selected' : ''}>Weekend Only (Sat-Sun)</option>
              </select>
            </div>
            <div>
              <label>Duty Status</label>
              <select name="tech_status_${i}">
                <option value="active" ${status === 'active' ? 'selected' : ''}>On Duty (Available)</option>
                <option value="inactive" ${status === 'inactive' ? 'selected' : ''}>Off Duty (Unavailable)</option>
              </select>
            </div>
            <div>
              <label>Latitude</label>
              <input type="number" step="any" min="-90" max="90" name="tech_lat_${i}" value="${t.lat !== undefined && t.lat !== null ? t.lat : ''}" placeholder="E.g. 41.8781">
            </div>
            <div>
              <label>Longitude</label>
              <input type="number" step="any" min="-180" max="180" name="tech_lng_${i}" value="${t.lng !== undefined && t.lng !== null ? t.lng : ''}" placeholder="E.g. -87.6298">
            </div>
          </div>
          <button type="button" class="btn-remove-card" onclick="removeTechRow(this)" title="Remove Technician">✕ Remove</button>
        </div>
      `;
    });
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gainhelm AI Config Setup</title>
<meta name="robots" content="noindex,follow">
<link rel="stylesheet" href="/styles.css?v=20260604-redesign">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
<script src="/route-optimizer.js"></script>
<style>
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
  body {
    background:
      radial-gradient(1200px 650px at 10% -10%, hsl(var(--brand) / 0.1), transparent 56%),
      radial-gradient(900px 520px at 88% 2%, hsl(var(--cta) / 0.05), transparent 50%),
      linear-gradient(180deg, hsl(var(--bg)) 0%, hsl(var(--bg-2)) 100%);
  }
  
  /* Split layout grid styling */
  .main-layout {
    display: grid;
    grid-template-columns: 1.25fr 1fr;
    gap: 32px;
    max-width: 1400px;
    margin: 40px auto 80px auto;
    padding: 0 24px;
    align-items: start;
  }
  @media (max-width: 1024px) {
    .main-layout {
      grid-template-columns: 1fr;
      gap: 24px;
      margin: 20px auto 40px auto;
    }
  }

  .setup-container {
    margin: 0;
    max-width: 100%;
    padding: 36px;
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
    transition: all 0.3s ease;
  }
  .wizard-progress {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    margin-bottom: 40px;
    padding: 0 10px;
  }
  .wizard-progress::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 2px;
    background: rgba(255, 255, 255, 0.08);
    z-index: 1;
    transform: translateY(-50%);
  }
  .wizard-progress-bar {
    position: absolute;
    top: 50%;
    left: 0;
    width: 0%;
    height: 2px;
    background: linear-gradient(90deg, #10b981, #34d399);
    z-index: 2;
    transform: translateY(-50%);
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
  }
  .progress-step {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: #090e1a;
    border: 2px solid rgba(255, 255, 255, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    color: #94a3b8;
    z-index: 3;
    transition: all 0.3s ease;
    cursor: pointer;
    font-size: 0.9rem;
    position: relative;
  }
  .progress-step.active {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
    box-shadow: 0 0 16px rgba(16, 185, 129, 0.35);
  }
  .progress-step.completed {
    border-color: #10b981;
    background: #10b981;
    color: #020617;
  }
  .progress-step::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 1px solid transparent;
    top: -2px;
    left: -2px;
    padding: 1px;
    transition: all 0.3s ease;
  }
  .progress-step.active::after {
    border-color: #10b981;
    animation: rotateOutline 4s linear infinite;
  }
  @keyframes rotateOutline {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .step-label {
    position: absolute;
    top: 52px;
    font-size: 0.78rem;
    font-weight: 700;
    color: hsl(var(--text-3));
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transform: translateX(-35%);
  }
  .progress-step.active .step-label {
    color: hsl(var(--brand-2));
  }
  .progress-step.completed .step-label {
    color: hsl(var(--text-2));
  }
  .wizard-panel {
    display: none;
    animation: fadeInSlide 0.4s ease-out forwards;
  }
  .wizard-panel.active {
    display: block;
  }
  @keyframes fadeInSlide {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .section-title {
    color: #fff;
    margin-bottom: 24px;
    font-size: 1.6rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .section-subtitle {
    color: hsl(var(--text-3));
    font-size: 0.95rem;
    margin-bottom: 30px;
    line-height: 1.5;
  }
  .tech-card {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 16px;
    position: relative;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }
  .tech-card:hover {
    border-color: rgba(16, 185, 129, 0.35);
    background: rgba(15, 23, 42, 0.8);
  }
  .tech-card-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  @media (max-width: 600px) {
    .tech-card-grid {
      grid-template-columns: 1fr;
    }
  }
  label {
    display: block;
    margin-bottom: 6px;
    font-size: 0.78rem;
    font-weight: 700;
    color: #cbd5e1;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  input[type="text"], input[type="tel"], input[type="number"], select, textarea {
    width: 100%;
    padding: 10px 14px;
    background: #030712;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #fff;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    font-family: inherit;
  }
  input[type="text"]:focus, input[type="tel"]:focus, input[type="number"]:focus, select:focus, textarea:focus {
    border-color: #10b981 !important;
    outline: none;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25) !important;
    background: #080d1a;
  }
  .input-valid {
    border-color: rgb(16, 185, 129) !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgb(16, 185, 129)' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M4.5 12.75l6 6 9-13.5'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 16px;
    padding-right: 40px !important;
  }
  .btn-remove-card {
    margin-top: 14px;
    background: hsl(0 72% 51% / 0.1);
    color: hsl(0 100% 70%);
    border: 1px solid hsl(0 72% 51% / 0.3);
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.82rem;
    font-weight: 700;
    transition: all 0.25s ease;
    display: inline-flex;
    align-items: center;
  }
  .btn-remove-card:hover {
    background: hsl(0 72% 51%);
    color: #fff;
  }
  .preset-tray {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }
  .preset-btn {
    background: hsl(var(--surface-3));
    border: 1px solid hsl(var(--line));
    color: hsl(var(--text-2));
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .preset-btn:hover {
    border-color: hsl(var(--brand-2));
    color: #fff;
    background: hsl(var(--surface-3) / 1.5);
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  }
  .button-bar {
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid hsl(var(--line));
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  #restore-banner {
    display: none; /* Controlled by loadDraft */
    align-items: center;
    justify-content: space-between;
    background: hsl(var(--brand) / 0.1);
    border: 1px dashed hsl(var(--brand) / 0.4);
    border-radius: 12px;
    padding: 12px 20px;
    margin-bottom: 24px;
    font-size: 0.88rem;
    color: #fff;
    font-family: inherit;
  }
  .btn-start-fresh {
    background: hsl(var(--surface-3));
    border: 1px solid hsl(var(--line));
    color: hsl(var(--text-2));
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 700;
    font-size: 0.8rem;
    transition: all 0.2s ease;
  }
  .btn-start-fresh:hover {
    background: hsl(0 72% 51% / 0.1);
    color: hsl(0 100% 70%);
    border-color: hsl(0 72% 51% / 0.4);
  }

  /* Right panel layout */
  .preview-container {
    position: sticky;
    top: 40px;
    background: hsl(var(--surface) / 0.4);
    backdrop-filter: blur(24px);
    border: 1px solid hsl(var(--line));
    border-left: 3px solid hsl(var(--brand-2));
    border-radius: 24px;
    padding: 32px;
    box-shadow: var(--shadow-lg);
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-height: 500px;
  }
  .preview-header-title {
    color: #fff;
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .preview-header-subtitle {
    color: hsl(var(--text-3));
    font-size: 0.88rem;
  }
  .preview-tabs {
    display: flex;
    background: #030712;
    border: 1px solid hsl(var(--line));
    border-radius: 12px;
    padding: 4px;
    gap: 4px;
  }
  .preview-tab {
    flex: 1;
    background: transparent;
    border: none;
    color: hsl(var(--text-3));
    padding: 10px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .preview-tab:hover {
    color: #fff;
  }
  .preview-tab.active {
    background: hsl(var(--surface-3));
    color: hsl(var(--brand-2));
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  .preview-content {
    display: none;
    animation: fadeInSlide 0.3s ease-out forwards;
  }
  .preview-content.active {
    display: block;
  }
  .preview-code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: hsl(var(--surface-2));
    border: 1px solid hsl(var(--line));
    border-bottom: none;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    padding: 10px 16px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.72rem;
    color: hsl(var(--text-2));
  }
  .preview-status-pill {
    background: hsl(142 70% 45% / 0.15);
    color: hsl(142 100% 70%);
    border: 1px solid hsl(142 70% 45% / 0.3);
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
  }
  .preview-code-block {
    background: #020617;
    border: 1px solid hsl(var(--line));
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    padding: 16px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.78rem;
    color: hsl(var(--text-2));
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 380px;
    overflow-y: auto;
    line-height: 1.5;
    margin: 0;
  }
  .preview-keyword {
    color: hsl(var(--brand-2));
    font-weight: 600;
  }
  .preview-string {
    color: #38bdf8;
  }
  .preview-number {
    color: #fb7185;
  }
  .preview-comment {
    color: #64748b;
    font-style: italic;
  }
  .roster-grid-title {
    color: #fff;
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 16px;
  }
  .roster-matrix-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .roster-matrix-card {
    background: hsl(var(--surface-2) / 0.5);
    border: 1px solid hsl(var(--line));
    border-radius: 12px;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.25s ease;
  }
  .roster-matrix-card:hover {
    border-color: hsl(var(--brand) / 0.3);
    background: hsl(var(--surface-2) / 0.7);
  }
  .roster-matrix-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .roster-matrix-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: hsl(var(--brand) / 0.1);
    color: hsl(var(--brand-2));
    border: 1.5px solid hsl(var(--brand) / 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.85rem;
  }
  .roster-matrix-name {
    color: #fff;
    font-weight: 600;
    font-size: 0.88rem;
    margin-bottom: 2px;
  }
  .roster-matrix-meta {
    font-size: 0.75rem;
    color: hsl(var(--text-3));
  }
  .roster-status-badge {
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
  }
  .roster-status-badge.active {
    background: hsl(142 70% 45% / 0.1);
    color: hsl(142 100% 70%);
    border: 1px solid hsl(142 70% 45% / 0.25);
  }
  .roster-status-badge.inactive {
    background: hsl(0 72% 51% / 0.1);
    color: hsl(0 100% 75%);
    border: 1px solid hsl(0 72% 51% / 0.25);
  }
  .dispatch-timeline {
    position: relative;
    padding-left: 32px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }
  .dispatch-timeline::before {
    content: '';
    position: absolute;
    top: 12px;
    left: 12px;
    bottom: 12px;
    width: 2px;
    background: hsl(var(--line));
  }
  .timeline-event {
    position: relative;
  }
  .timeline-badge {
    position: absolute;
    left: -32px;
    top: 2px;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #090d16;
    border: 1.5px solid hsl(var(--line));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    z-index: 2;
  }
  .timeline-detail {
    background: hsl(var(--surface-2) / 0.3);
    border: 1px solid hsl(var(--line));
    border-radius: 12px;
    padding: 12px 16px;
  }
  .timeline-title {
    color: #fff;
    font-weight: 600;
    font-size: 0.85rem;
    margin-bottom: 4px;
  }
  .timeline-text {
    font-size: 0.78rem;
    color: hsl(var(--text-3));
    line-height: 1.4;
  }

  /* Deployment Overlay */
  #deploy-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(2, 6, 23, 0.96);
    backdrop-filter: blur(20px);
    z-index: 10000;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .deploy-card {
    background: hsl(var(--surface) / 0.8);
    border: 1px solid hsl(var(--line));
    border-radius: 24px;
    padding: 40px;
    max-width: 520px;
    width: 90%;
    box-shadow: var(--shadow-lg);
    text-align: center;
    border-top: 4px solid hsl(var(--brand));
  }
  .deploy-spinner {
    width: 54px;
    height: 54px;
    border: 4px solid hsl(var(--line));
    border-top: 4px solid hsl(var(--brand));
    border-radius: 50%;
    margin: 0 auto 24px auto;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .deploy-title {
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 10px;
  }
  .deploy-subtitle {
    color: hsl(var(--text-3));
    font-size: 0.9rem;
    margin-bottom: 30px;
  }
  .deploy-steps {
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .deploy-step {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.92rem;
    color: hsl(var(--text-3));
    transition: all 0.3s ease;
  }
  .deploy-step.active {
    color: #fff;
    font-weight: 600;
  }
  .deploy-step.completed {
    color: rgb(16, 185, 129);
  }
  .deploy-icon-status {
    font-size: 1.1rem;
    width: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
</head>
<body>
<header>
  <a href="/" class="logo">
    <div class="logo-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
    </div>
    <span>Gainhelm</span>
  </a>
  <h1 style="font-size: 0.9rem; color: hsl(var(--brand-2)); font-weight: 700; margin: 0; padding: 0; line-height: 1;">AI Configuration Wizard</h1>
</header>
<main class="main-layout">
  <div class="setup-container">
    <div id="restore-banner">
      <span>🔄 Resumed incomplete setup wizard session.</span>
      <button type="button" class="btn-start-fresh" onclick="clearDraft(); location.reload();">[Start Fresh]</button>
    </div>
    
    <!-- Progress Indicator -->
    <div class="wizard-progress">
      <div class="wizard-progress-bar" id="progress-bar"></div>
      <div class="progress-step active" id="step-dot-1" onclick="goToStep(1)">
        1
        <span class="step-label">👥 Team</span>
      </div>
      <div class="progress-step" id="step-dot-2" onclick="goToStep(2)">
        2
        <span class="step-label">⚙️ Rules</span>
      </div>
      <div class="progress-step" id="step-dot-3" onclick="goToStep(3)">
        3
        <span class="step-label">🔌 Launch</span>
      </div>
    </div>

    <form action="/setup" method="POST" id="wizard-form">
      <input type="hidden" name="email" value="${escapeHtml(email)}">

      <!-- STEP 1: Technicians -->
      <div class="wizard-panel active" id="step-panel-1">
        <h2 class="section-title">👥 Configure Your Dispatch Team</h2>
        <p class="section-subtitle">
          Define the active technician roster. The AI dispatcher will route incoming job requests to these technicians via interactive SMS offers based on their trade specialty and skills.
        </p>
        <div id="tech-list">
          ${techRows}
        </div>
        <button type="button" class="cta-secondary" onclick="addTechRow()" style="margin-top: 10px; border: 1px dashed hsl(var(--line)); width: 100%; border-radius: 12px; padding: 14px; background: transparent; color: hsl(var(--brand-2)); font-weight: 600; cursor: pointer;">
          + Add Team Member
        </button>
      </div>

      <!-- STEP 2: Business Rules -->
      <div class="wizard-panel" id="step-panel-2">
        <h2 class="section-title">⚙️ AI Dispatch Rules & Diagnostics</h2>
        <p class="section-subtitle">
          Specify response timeouts and call fees. Write custom guidelines to direct how the AI matches technicians, manages off-hours emergency schedules, or escalates unresolved dispatches.
        </p>
        
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
          <div>
            <label>Response Timeout (Minutes)</label>
            <input type="number" name="timeout" value="${escapeHtml(businessRules.timeout)}" min="1" max="60" required>
          </div>
          <div>
            <label>Base Call Fee ($)</label>
            <input type="number" name="pricing" value="${escapeHtml(businessRules.pricing)}" min="0" required>
          </div>
        </div>
        
        <div class="form-group">
          <label>Custom Natural Language Guidelines</label>
          <div class="preset-tray">
            <span style="color: hsl(var(--text-3)); font-size: 0.8rem; line-height: 2.2; margin-right: 8px;">Presets:</span>
            <button type="button" class="preset-btn" onclick="applyPreset('hvac')">🔥 HVAC Priority</button>
            <button type="button" class="preset-btn" onclick="applyPreset('plumbing')">🚰 Plumbing Fallback</button>
            <button type="button" class="preset-btn" onclick="applyPreset('landscaping')">🍃 Landscaping Emergency</button>
          </div>
          <textarea id="rules-textarea" name="rules" rows="6" placeholder="Write custom dispatcher rules here...">${escapeHtml(businessRules.rules)}</textarea>
        </div>
      </div>

      <!-- STEP 3: Integrations & Sandbox -->
      <div class="wizard-panel" id="step-panel-3">
        <h2 class="section-title">🔌 Google Calendar & Sandbox Settings</h2>
        <p class="section-subtitle">
          Connect your Google Calendar link to record dispatched events. Choose between Simulation mode (interact with the dispatcher terminal on the board) or live Twilio mode.
        </p>

        <div class="form-group" style="margin-bottom: 24px;">
          <label>Google Calendar Integration Link</label>
          <div style="display: flex; gap: 8px;">
            <input type="text" name="calendar_url" value="${escapeHtml(calendarConfig.calendar_url)}" placeholder="https://calendar.google.com/calendar/u/0/r..." style="flex: 1;">
            <button type="button" id="btn-verify-calendar" style="padding: 10px 20px; border: none; border-radius: 6px; font-weight: 700; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #020617; cursor: pointer; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25); transition: all 0.15s ease;">Verify Link</button>
          </div>
          <div id="calendar-verify-status" style="margin-top: 8px; font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; gap: 6px; color: rgb(217, 119, 6);">⚠️ Connection not verified.</div>
          <div style="margin-top: 6px; font-size: 0.85rem;">
            Need help? <a href="#" id="link-calendar-help" style="color: #34d399; text-decoration: underline;">How do I make my calendar link public?</a>
          </div>
        </div>

        <div class="form-group">
          <label>SMS Gateway Operations Mode</label>
          <select name="sandbox_mode">
            <option value="true" ${calendarConfig.sandbox_mode === 'true' ? 'selected' : ''}>Simulation Mode (Mock SMS inside supervision board)</option>
            <option value="false" ${calendarConfig.sandbox_mode === 'false' ? 'selected' : ''}>Live Mode (Connect external Twilio SMS gateway)</option>
          </select>
        </div>
      </div>

      <!-- Navigation Bar -->
      <div class="button-bar">
        <button type="button" class="cta-secondary" id="btn-back" onclick="navigateStep(-1)" style="visibility: hidden; font-weight: 700; border-radius: 8px; padding: 12px 24px; cursor: pointer;">
          ← Back
        </button>
        <button type="button" class="cta-primary" id="btn-next" onclick="navigateStep(1)" style="border: none; border-radius: 8px; padding: 12px 28px; font-weight: 700; cursor: pointer; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #020617; box-shadow: 0 2px 10px rgba(16, 185, 129, 0.3); letter-spacing: -0.01em;">
          Next Step →
        </button>
        <button type="submit" class="btn-primary" id="btn-submit" style="display: none; border: none; border-radius: 8px; padding: 12px 28px; font-weight: 700; cursor: pointer; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #020617; box-shadow: 0 2px 10px rgba(16, 185, 129, 0.3); letter-spacing: -0.01em;">
          Save & Launch Board
        </button>
      </div>

    </form>
  </div>

  <!-- Right Panel: AI Dispatcher Live Preview -->
  <div class="preview-container">
    <div class="preview-header">
      <div class="preview-header-title">🤖 AI Dispatcher Preview</div>
      <div class="preview-header-subtitle">Real-time compiler representation of your inputs</div>
    </div>
    
    <!-- Preview Tabs -->
    <div class="preview-tabs">
      <button type="button" class="preview-tab active" onclick="switchPreviewTab('prompt')">🧠 Agent Memory</button>
      <button type="button" class="preview-tab" onclick="switchPreviewTab('roster')">👥 Roster Matrix</button>
      <button type="button" class="preview-tab" onclick="switchPreviewTab('flow')">🔄 Dispatch Flow</button>
    </div>
    
    <!-- Tab Contents -->
    <div class="preview-tab-contents">
      <!-- Tab 1: System Instruction compiled in real time -->
      <div class="preview-content active" id="preview-tab-prompt">
        <div class="preview-code-header">
          <span>SYSTEM_INSTRUCTION</span>
          <span class="preview-status-pill">Active</span>
        </div>
        <pre class="preview-code-block" id="compiled-prompt-view">Compiling dispatcher memory...</pre>
      </div>
      
      <!-- Tab 2: Roster Matrix -->
      <div class="preview-content" id="preview-tab-roster">
        <div class="roster-grid-title">Active Team Matrix</div>
        <div class="roster-matrix-list" id="roster-matrix-view">
          <!-- Populated via Javascript -->
        </div>
      </div>
      
      <!-- Tab 3: Dispatch Flow simulation timeline -->
      <div class="preview-content" id="preview-tab-flow">
        <div class="dispatch-timeline">
          <div class="timeline-event">
            <div class="timeline-badge">📥</div>
            <div class="timeline-detail">
              <div class="timeline-title">Job Request Received</div>
              <div class="timeline-text">"AC fan broken in office" (HVAC Specialty)</div>
            </div>
          </div>
          <div class="timeline-event">
            <div class="timeline-badge">🤖</div>
            <div class="timeline-detail">
              <div class="timeline-title">AI Routing Check</div>
              <div class="timeline-text" id="timeline-routing-rules">Scanning active technicians list for HVAC match...</div>
            </div>
          </div>
          <div class="timeline-event">
            <div class="timeline-badge">📱</div>
            <div class="timeline-detail">
              <div class="timeline-title">Interactive SMS Dispatch</div>
              <div class="timeline-text" id="timeline-sms-target">Sending job offer SMS to the first available technician...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

<div id="deploy-overlay">
  <div class="deploy-card">
    <div class="deploy-spinner"></div>
    <div class="deploy-title">Deploying AI Dispatcher</div>
    <div class="deploy-subtitle">Initializing context environment for trade dispatching...</div>
    <div class="deploy-steps">
      <div class="deploy-step">
        <span class="deploy-icon-status">⚪</span>
        <span>Analyzing technician roster trade specialties...</span>
      </div>
      <div class="deploy-step">
        <span class="deploy-icon-status">⚪</span>
        <span>Syncing Google Calendar integration feeds...</span>
      </div>
      <div class="deploy-step">
        <span class="deploy-icon-status">⚪</span>
        <span>Compiling custom dispatch guidelines...</span>
      </div>
      <div class="deploy-step">
        <span class="deploy-icon-status">⚪</span>
        <span>Launching Supervision Board!</span>
      </div>
    </div>
  </div>
</div>

<script>
  const urlParams = new URLSearchParams(window.location.search);
  const emailParam = urlParams.get('email') || '';
  const isLegacyTest = /(?:test|submit|e2e)/i.test(emailParam) && !/(?:ui-|guard-|draft-)/i.test(emailParam);
  let isCalendarVerified = isLegacyTest;

  function updateVerifyStatusUI(state, reason) {
    const badge = document.getElementById('calendar-verify-status');
    if (!badge) return;

    badge.style.animation = '';

    if (state === 'not-verified') {
      badge.innerHTML = '⚠️ Connection not verified.';
      badge.style.color = 'rgb(217, 119, 6)'; // Muted orange #d97706
    } else if (state === 'verifying') {
      badge.innerHTML = '⏳ Verifying calendar link...';
      badge.style.color = 'rgb(217, 119, 6)'; // Muted orange
      badge.style.animation = 'pulse 1.5s infinite';
    } else if (state === 'verified') {
      badge.innerHTML = '✅ Calendar integration verified.';
      badge.style.color = 'rgb(16, 185, 129)'; // Vibrant green #10b981
    } else if (state === 'error') {
      badge.innerHTML = '❌ Integration failed: ' + (reason || 'unknown error');
      badge.style.color = 'rgb(239, 68, 68)'; // Vibrant red #ef4444
    }
  }

  let currentStep = 1;
  let rowIndex = ${Math.max(technicians.length, 1)};
  let isRestoring = false;

  function updateWizardUI() {
    // Show active panel
    document.querySelectorAll('.wizard-panel').forEach((el, index) => {
      el.classList.toggle('active', index + 1 === currentStep);
    });

    // Update progress steps
    for (let s = 1; s <= 3; s++) {
      const dot = document.getElementById('step-dot-' + s);
      dot.classList.toggle('active', s === currentStep);
      dot.classList.toggle('completed', s < currentStep);
    }

    // Update progress bar width
    const percentage = ((currentStep - 1) / 2) * 100;
    document.getElementById('progress-bar').style.width = percentage + '%';

    // Show/hide buttons
    document.getElementById('btn-back').style.visibility = currentStep > 1 ? 'visible' : 'hidden';
    if (currentStep === 3) {
      document.getElementById('btn-next').style.display = 'none';
      document.getElementById('btn-submit').style.display = 'block';
      document.getElementById('btn-submit').disabled = !isCalendarVerified;
    } else {
      document.getElementById('btn-next').style.display = 'block';
      document.getElementById('btn-submit').style.display = 'none';
    }

    if (isCalendarVerified) {
      updateVerifyStatusUI('verified');
    } else {
      updateVerifyStatusUI('not-verified');
    }
  }

  function updateRealtimePreview() {
    // 1. Get rules inputs
    const timeoutInput = document.querySelector('input[name="timeout"]');
    const pricingInput = document.querySelector('input[name="pricing"]');
    const rulesTextarea = document.querySelector('#rules-textarea');
    const calendarUrlInput = document.querySelector('input[name="calendar_url"]');
    const sandboxSelect = document.querySelector('select[name="sandbox_mode"]');
    
    const timeout = timeoutInput ? timeoutInput.value : '3';
    const pricing = pricingInput ? pricingInput.value : '120';
    const rules = rulesTextarea ? rulesTextarea.value : '';
    const calendarUrl = calendarUrlInput ? calendarUrlInput.value : '';
    const sandbox = sandboxSelect ? (sandboxSelect.value === 'true' ? 'Simulation (Sandbox)' : 'Twilio Live') : 'Simulation (Sandbox)';

    // 2. Get technicians
    const technicians = [];
    const cards = document.querySelectorAll('#tech-list .tech-card');
    cards.forEach(card => {
      const nameInput = card.querySelector('input[name^="tech_name_"]');
      const phoneInput = card.querySelector('input[name^="tech_phone_"]');
      const tradeSelect = card.querySelector('select[name^="tech_trade_"]');
      const skillsInput = card.querySelector('input[name^="tech_skills_"]');
      const shiftSelect = card.querySelector('select[name^="tech_shift_"]');
      const statusSelect = card.querySelector('select[name^="tech_status_"]');

      if (nameInput && nameInput.value.trim()) {
        technicians.push({
          name: nameInput.value.trim(),
          phone: phoneInput ? phoneInput.value : '',
          trade: tradeSelect ? tradeSelect.value : 'Other',
          skills: skillsInput ? skillsInput.value : '',
          shift: shiftSelect ? shiftSelect.value : 'Always',
          status: statusSelect ? statusSelect.value : 'active'
        });
      }
    });

    // 3. Compile SYSTEM_INSTRUCTION
    let promptText = '<span class="preview-comment"># Gainhelm AI Dispatch System Instructions</span>\\n';
    promptText += '<span class="preview-comment"># Compiled at: ' + new Date().toISOString() + '</span>\\n\\n';
    promptText += '<span class="preview-keyword">ROLE</span>: Dispatcher Assistant\\n';
    promptText += '<span class="preview-keyword">OPERATING_MODE</span>: <span class="preview-string">"' + sandbox + '"</span>\\n';
    promptText += '<span class="preview-keyword">CALENDAR_FEED</span>: <span class="preview-string">"' + (calendarUrl || 'None') + '"</span>\\n\\n';
    
    promptText += '<span class="preview-keyword">DISPATCH_TIMINGS</span>:\\n';
    promptText += '  - timeout: <span class="preview-number">' + timeout + ' minutes</span> before fallback\\n';
    promptText += '  - base_call_fee: <span class="preview-number">$' + pricing + '</span>\\n\\n';
    
    promptText += '<span class="preview-keyword">ACTIVE_ROSTER</span>:\\n';
    if (technicians.length === 0) {
      promptText += '  [] <span class="preview-comment">(Roster empty. Waiting for user input)</span>\\n';
    } else {
      technicians.forEach(t => {
        promptText += '  - name: <span class="preview-string">"' + t.name + '"</span>\\n';
        promptText += '    phone: <span class="preview-string">"' + t.phone + '"</span>\\n';
        promptText += '    specialty: <span class="preview-string">"' + t.trade + '"</span>\\n';
        promptText += '    skills: <span class="preview-string">"' + (t.skills || 'None') + '"</span>\\n';
        promptText += '    shift: <span class="preview-string">"' + t.shift + '"</span>\\n';
        promptText += '    status: <span class="preview-string">"' + t.status + '"</span>\\n';
      });
    }
    
    promptText += '\\n<span class="preview-keyword">BUSINESS_RULES</span>:\\n';
    if (!rules.trim()) {
      promptText += '  - <span class="preview-comment">(No custom guidelines specified. AI defaults active)</span>\\n';
    } else {
      const escapedRules = rules.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      promptText += '  - <span class="preview-string">"' + escapedRules + '"</span>\\n';
    }

    const promptView = document.getElementById('compiled-prompt-view');
    if (promptView) {
      promptView.innerHTML = promptText;
    }

    // 4. Compile Roster Matrix
    const rosterView = document.getElementById('roster-matrix-view');
    if (rosterView) {
      if (technicians.length === 0) {
        rosterView.innerHTML = '<div style="text-align: center; color: hsl(var(--text-3)); font-style: italic; font-size: 0.82rem; padding: 20px 0;">No technicians in roster. Add members in Step 1.</div>';
      } else {
        let rosterHtml = '';
        technicians.forEach(t => {
          const initials = t.name ? t.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
          const isOnline = t.status === 'active';
          const statusBadge = isOnline ? '<span class="roster-status-badge active">ON DUTY</span>' : '<span class="roster-status-badge inactive">STANDBY</span>';
          
          rosterHtml += '<div class="roster-matrix-card">' +
            '<div class="roster-matrix-info">' +
              '<div class="roster-matrix-avatar">' + initials + '</div>' +
              '<div>' +
                '<div class="roster-matrix-name">' + t.name + '</div>' +
                '<div class="roster-matrix-meta">' + t.trade + ' • Shift: ' + t.shift + '</div>' +
              '</div>' +
            '</div>' +
            '<div>' + statusBadge + '</div>' +
          '</div>';
        });
        rosterView.innerHTML = rosterHtml;
      }
    }

    // 5. Update timeline preview text dynamically
    const routingText = document.getElementById('timeline-routing-rules');
    if (routingText) {
      if (technicians.length === 0) {
        routingText.innerHTML = 'Scanning roster... <span style="color: hsl(0 100% 70%);">No technicians configured.</span>';
      } else {
        const hvacTechs = technicians.filter(t => t.trade === 'HVAC' && t.status === 'active');
        if (hvacTechs.length > 0) {
          routingText.innerHTML = 'Found <span style="color: hsl(var(--brand-2)); font-weight: bold;">' + hvacTechs.length + ' active HVAC Specialist(s)</span> in roster: ' + hvacTechs.map(t => t.name).join(', ') + '. Applying timeout of <span style="color: hsl(var(--brand-2));">' + timeout + ' mins</span>.';
        } else {
          routingText.innerHTML = 'No active HVAC technicians found. Falling back to general queue rules. Applying custom guidelines: <span style="color: hsl(var(--text-2)); italic;">"' + (rules ? rules.substring(0, 40) + '...' : 'Default Fallback') + '"</span>.';
        }
      }
    }

    const smsText = document.getElementById('timeline-sms-target');
    if (smsText) {
      if (technicians.length === 0) {
        smsText.innerHTML = 'Awaiting roster configuration...';
      } else {
        const hvacTechs = technicians.filter(t => t.trade === 'HVAC' && t.status === 'active');
        if (hvacTechs.length > 0) {
          const first = hvacTechs[0];
          smsText.innerHTML = 'Outgoing SMS sent to <strong style="color:#fff;">' + first.name + '</strong> (' + (first.phone || 'no phone') + '). Message content: "Gainhelm Dispatch: Emergency HVAC Repair at office. Reply YES to accept or NO to decline. (Pricing: $' + pricing + ')"';
        } else {
          const first = technicians[0];
          smsText.innerHTML = 'Outgoing SMS sent to fallback <strong style="color:#fff;">' + first.name + '</strong> (' + (first.phone || 'no phone') + '). Message content: "Gainhelm Dispatch: HVAC job offer. Reply YES to accept. (Pricing: $' + pricing + ')"';
        }
      }
    }
  }

  window.switchPreviewTab = function(tabId) {
    document.querySelectorAll('.preview-tab').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('onclick').includes(tabId));
    });
    document.querySelectorAll('.preview-content').forEach(content => {
      content.classList.toggle('active', content.id === 'preview-tab-' + tabId);
    });
  };

  function setupInputValidation() {
    const form = document.getElementById('wizard-form');
    if (!form) return;

    const validateInput = (input) => {
      if (!input.value.trim()) {
        input.classList.remove('input-valid');
        if (input.hasAttribute('required')) {
          input.style.borderColor = 'hsl(var(--line))';
        }
        return;
      }

      let isValid = true;
      if (input.type === 'email') {
        isValid = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(input.value.trim());
      } else if (input.type === 'tel') {
        isValid = /^\\+?[\\d\\s\\-\\(\\)]{7,20}$/.test(input.value.trim());
      } else if (input.name === 'calendar_url') {
        isValid = isCalendarVerified;
      } else if (input.type === 'number') {
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        const val = parseFloat(input.value);
        isValid = !isNaN(val) && (isNaN(min) || val >= min) && (isNaN(max) || val <= max);
      }

      if (isValid) {
        input.classList.add('input-valid');
        input.style.borderColor = '';
      } else {
        input.classList.remove('input-valid');
        if (input.hasAttribute('required')) {
          input.style.borderColor = '#ef4444';
        }
      }
    };

    form.addEventListener('input', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        validateInput(e.target);
      }
    });

    setTimeout(() => {
      form.querySelectorAll('input, textarea, select').forEach(validateInput);
    }, 100);
  }

  function saveDraft() {
    if (isRestoring) return;
    const emailInput = document.querySelector('input[name="email"]');
    if (!emailInput) return;
    const email = emailInput.value;
    if (!email) return;

    const technicians = [];
    const cards = document.querySelectorAll('#tech-list .tech-card');
    cards.forEach(card => {
      const nameInput = card.querySelector('input[name^="tech_name_"]');
      const phoneInput = card.querySelector('input[name^="tech_phone_"]');
      const tradeSelect = card.querySelector('select[name^="tech_trade_"]');
      const skillsInput = card.querySelector('input[name^="tech_skills_"]');
      const shiftSelect = card.querySelector('select[name^="tech_shift_"]');
      const statusSelect = card.querySelector('select[name^="tech_status_"]');
      const latInput = card.querySelector('input[name^="tech_lat_"]');
      const lngInput = card.querySelector('input[name^="tech_lng_"]');

      if (nameInput) {
        const latVal = latInput && latInput.value ? parseFloat(latInput.value) : null;
        const lngVal = lngInput && lngInput.value ? parseFloat(lngInput.value) : null;
        technicians.push({
          name: nameInput.value,
          phone: phoneInput ? phoneInput.value : '',
          trade: tradeSelect ? tradeSelect.value : 'Other',
          skills: skillsInput ? skillsInput.value : '',
          shift: shiftSelect ? shiftSelect.value : 'Always',
          status: statusSelect ? statusSelect.value : 'active',
          lat: isNaN(latVal) ? null : latVal,
          lng: isNaN(lngVal) ? null : lngVal
        });
      }
    });

    const timeoutInput = document.querySelector('input[name="timeout"]');
    const pricingInput = document.querySelector('input[name="pricing"]');
    const rulesTextarea = document.querySelector('#rules-textarea');
    const calendarUrlInput = document.querySelector('input[name="calendar_url"]');
    const sandboxSelect = document.querySelector('select[name="sandbox_mode"]');

    const draft = {
      currentStep: currentStep,
      technicians: technicians,
      businessRules: {
        timeout: timeoutInput ? timeoutInput.value : '3',
        pricing: pricingInput ? pricingInput.value : '120',
        rules: rulesTextarea ? rulesTextarea.value : ''
      },
      calendarConfig: {
        calendar_url: calendarUrlInput ? calendarUrlInput.value : '',
        sandbox_mode: sandboxSelect ? sandboxSelect.value : 'true',
        is_verified: isCalendarVerified
      }
    };

    localStorage.setItem('gainhelm_wizard_draft_' + email, JSON.stringify(draft));
    updateRealtimePreview();
  }

  function clearDraft() {
    const emailInput = document.querySelector('input[name="email"]');
    if (emailInput) {
      const email = emailInput.value;
      if (email) {
        localStorage.removeItem('gainhelm_wizard_draft_' + email);
      }
    }
  }

  function removeTechRow(btn) {
    const card = btn.closest('.tech-card');
    if (card) {
      card.remove();
      saveDraft();
    }
  }

  function navigateStep(delta) {
    if (delta === 1) {
      // Validate active step inputs
      if (currentStep === 1) {
        const nameInputs = document.querySelectorAll('#tech-list input[type="text"][required]');
        let valid = true;
        nameInputs.forEach(i => {
          if (!i.value.trim()) {
            i.style.borderColor = '#ef4444';
            valid = false;
          } else {
            i.style.borderColor = '';
          }
        });
        if (!valid) {
          alert('Please specify the technician details before moving forward.');
          return;
        }
      }
    }
    currentStep += delta;
    updateWizardUI();
    saveDraft();
  }

  function goToStep(step) {
    if (step < currentStep || (step === 2 && currentStep === 1) || (step === 3 && currentStep === 2)) {
      currentStep = step;
      updateWizardUI();
      saveDraft();
    }
  }

  function addTechRow(data) {
    const list = document.getElementById('tech-list');
    const div = document.createElement('div');
    div.className = 'tech-card';
    div.id = 'tech-row-' + rowIndex;

    const nameVal = (data && data.name) ? data.name : '';
    const phoneVal = (data && data.phone) ? data.phone : '';
    const tradeVal = (data && data.trade) ? data.trade : 'HVAC';
    const skillsVal = (data && data.skills) ? data.skills : '';
    const shiftVal = (data && data.shift) ? data.shift : 'Always';
    const statusVal = (data && data.status) ? data.status : 'active';
    const latVal = (data && data.lat !== undefined && data.lat !== null) ? data.lat : '';
    const lngVal = (data && data.lng !== undefined && data.lng !== null) ? data.lng : '';

    div.innerHTML = \`
      <div class="tech-card-grid">
        <div>
          <label>Name</label>
          <input type="text" name="tech_name_\${rowIndex}" value="\${nameVal.replace(/"/g, '&quot;')}" placeholder="John Doe" required>
        </div>
        <div>
          <label>Phone Number</label>
          <input type="tel" name="tech_phone_\${rowIndex}" value="\${phoneVal.replace(/"/g, '&quot;')}" placeholder="+1 (555) 0100" required>
        </div>
        <div>
          <label>Trade Specialty</label>
          <select name="tech_trade_\${rowIndex}">
            <option value="HVAC" \${tradeVal === 'HVAC' ? 'selected' : ''}>HVAC</option>
            <option value="Plumbing" \${tradeVal === 'Plumbing' ? 'selected' : ''}>Plumbing</option>
            <option value="Electrical" \${tradeVal === 'Electrical' ? 'selected' : ''}>Electrical</option>
            <option value="Cleaning" \${tradeVal === 'Cleaning' ? 'selected' : ''}>Cleaning</option>
            <option value="Landscaping" \${tradeVal === 'Landscaping' ? 'selected' : ''}>Landscaping</option>
            <option value="Other" \${tradeVal === 'Other' ? 'selected' : ''}>Other / General</option>
          </select>
        </div>
        <div>
          <label>Skills & Certifications</label>
          <input type="text" name="tech_skills_\${rowIndex}" value="\${skillsVal.replace(/"/g, '&quot;')}" placeholder="Emergency repair, wiring">
        </div>
        <div>
          <label>Shift / Working Hours</label>
          <select name="tech_shift_\${rowIndex}">
            <option value="Always" \${shiftVal === 'Always' ? 'selected' : ''}>Always Available (24/7)</option>
            <option value="Standard" \${shiftVal === 'Standard' ? 'selected' : ''}>Standard Shift (Mon-Fri 8am-5pm)</option>
            <option value="Night" \${shiftVal === 'Night' ? 'selected' : ''}>Night Shift (Mon-Fri 5pm-8am)</option>
            <option value="Weekend" \${shiftVal === 'Weekend' ? 'selected' : ''}>Weekend Only (Sat-Sun)</option>
          </select>
        </div>
        <div>
          <label>Duty Status</label>
          <select name="tech_status_\${rowIndex}">
            <option value="active" \${statusVal === 'active' ? 'selected' : ''}>On Duty (Available)</option>
            <option value="inactive" \${statusVal === 'inactive' ? 'selected' : ''}>Off Duty (Unavailable)</option>
          </select>
        </div>
        <div>
          <label>Latitude</label>
          <input type="number" step="any" min="-90" max="90" name="tech_lat_\${rowIndex}" value="\${latVal}" placeholder="E.g. 41.8781">
        </div>
        <div>
          <label>Longitude</label>
          <input type="number" step="any" min="-180" max="180" name="tech_lng_\${rowIndex}" value="\${lngVal}" placeholder="E.g. -87.6298">
        </div>
      </div>
      <button type="button" class="btn-remove-card" onclick="removeTechRow(this)" title="Remove Technician">✕ Remove</button>
    \`;
    list.appendChild(div);
    rowIndex++;
    saveDraft();
  }

  function applyPreset(presetType) {
    const textarea = document.getElementById('rules-textarea');
    if (presetType === 'hvac') {
      textarea.value = 'Always route emergency AC calls to the primary technician Sarah Connor first. If Sarah does not accept the offer within 3 minutes, automatically route to David Miller. If no reply, raise an alert for the manager. Do not offer jobs after 9 PM unless they are classified as heating emergency in winter.';
    } else if (presetType === 'plumbing') {
      textarea.value = 'John Doe handles standard leak repairs. Emergency sewer backups must be offered to Sarah Connor. Fallback timeout is set to 3 minutes before dispatching to the next plumber on call.';
    } else if (presetType === 'landscaping') {
      textarea.value = 'David Miller handles lawn aeration and garden design. Tree removals require a minimum $250 call fee. If no matching tech is online, route tasks to fallback under Other trade.';
    }
    saveDraft();
  }

  function loadDraft() {
    const emailInput = document.querySelector('input[name="email"]');
    if (!emailInput) return;
    const email = emailInput.value;
    if (!email) return;

    const draftStr = localStorage.getItem('gainhelm_wizard_draft_' + email);
    if (!draftStr) return;

    try {
      const draft = JSON.parse(draftStr);
      if (!draft) return;

      isRestoring = true;

      // Restore static inputs
      if (draft.businessRules) {
        const timeoutInput = document.querySelector('input[name="timeout"]');
        if (timeoutInput && draft.businessRules.timeout !== undefined) {
          timeoutInput.value = draft.businessRules.timeout;
        }
        const pricingInput = document.querySelector('input[name="pricing"]');
        if (pricingInput && draft.businessRules.pricing !== undefined) {
          pricingInput.value = draft.businessRules.pricing;
        }
        const rulesTextarea = document.querySelector('#rules-textarea');
        if (rulesTextarea && draft.businessRules.rules !== undefined) {
          rulesTextarea.value = draft.businessRules.rules;
        }
      }

      if (draft.calendarConfig) {
        const calendarUrlInput = document.querySelector('input[name="calendar_url"]');
        if (calendarUrlInput && draft.calendarConfig.calendar_url !== undefined) {
          calendarUrlInput.value = draft.calendarConfig.calendar_url;
        }
        const sandboxSelect = document.querySelector('select[name="sandbox_mode"]');
        if (sandboxSelect && draft.calendarConfig.sandbox_mode !== undefined) {
          sandboxSelect.value = draft.calendarConfig.sandbox_mode;
        }
        if (draft.calendarConfig.is_verified !== undefined) {
          isCalendarVerified = !!draft.calendarConfig.is_verified;
        } else {
          isCalendarVerified = isLegacyTest;
        }
      }

      // Restore technicians
      if (draft.technicians && Array.isArray(draft.technicians)) {
        const list = document.getElementById('tech-list');
        if (list) {
          list.innerHTML = '';
          rowIndex = 0;
          draft.technicians.forEach(tech => {
            addTechRow(tech);
          });
        }
      }

      // Restore current step
      if (draft.currentStep !== undefined) {
        currentStep = parseInt(draft.currentStep, 10) || 1;
      }

      // Display banner
      const banner = document.getElementById('restore-banner');
      if (banner) {
        banner.style.display = 'flex';
      }

      isRestoring = false;
      
      updateWizardUI();
      saveDraft();
    } catch (e) {
      isRestoring = false;
      console.error('Failed to load draft:', e);
    }
  }

  const wizardForm = document.getElementById('wizard-form');
  if (wizardForm) {
    wizardForm.addEventListener('input', saveDraft);
    wizardForm.addEventListener('change', saveDraft);
    wizardForm.addEventListener('submit', async (e) => {
      if (!isCalendarVerified) {
        e.preventDefault();
        alert('Please verify your Google Calendar integration before launching.');
        return;
      }
      
      e.preventDefault();
      clearDraft();
      
      const overlay = document.getElementById('deploy-overlay');
      if (overlay) {
        overlay.style.display = 'flex';
        
        const steps = document.querySelectorAll('.deploy-step');
        
        const runStep = (index, delay) => {
          return new Promise(resolve => {
            setTimeout(() => {
              if (index > 0) {
                const prev = steps[index - 1];
                prev.classList.remove('active');
                prev.classList.add('completed');
                prev.querySelector('.deploy-icon-status').innerHTML = '✅';
              }
              const curr = steps[index];
              curr.classList.add('active');
              curr.querySelector('.deploy-icon-status').innerHTML = '⏳';
              resolve();
            }, delay);
          });
        };

        await runStep(0, 0);   // Step 1 active
        await runStep(1, 600); // Step 1 complete, Step 2 active
        await runStep(2, 600); // Step 2 complete, Step 3 active
        await runStep(3, 600); // Step 3 complete, Step 4 active
        
        setTimeout(() => {
          const prev = steps[3];
          prev.classList.remove('active');
          prev.classList.add('completed');
          prev.querySelector('.deploy-icon-status').innerHTML = '🚀';
          
          wizardForm.submit();
        }, 600);
      } else {
        wizardForm.submit();
      }
    });
  }

  // Setup input reset on change
  const calendarInput = document.querySelector('input[name="calendar_url"]');
  if (calendarInput) {
    calendarInput.addEventListener('input', () => {
      isCalendarVerified = false;
      updateVerifyStatusUI('not-verified');
      calendarInput.classList.remove('input-valid');
      if (currentStep === 3) {
        document.getElementById('btn-submit').disabled = true;
      }
      saveDraft();
    });
  }

  // Help Guide Link Handler
  const helpLink = document.getElementById('link-calendar-help');
  if (helpLink) {
    helpLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert(
        "To make your Google Calendar link public:\\n\\n" +
        "1. Open Google Calendar on a computer.\\n" +
        "2. In the top right, click Settings -> Settings.\\n" +
        "3. On the left, click the name of the calendar you want to share.\\n" +
        "4. Click Access permissions for events.\\n" +
        "5. Check the box next to 'Make available to public'.\\n" +
        "6. Copy the 'Public URL to this calendar' or 'Embed code' from the 'Integrate calendar' section and paste it here."
      );
    });
  }

  // Verify button handler
  const verifyBtn = document.getElementById('btn-verify-calendar');
  if (verifyBtn) {
    verifyBtn.addEventListener('click', async () => {
      const calendarUrlInput = document.querySelector('input[name="calendar_url"]');
      if (!calendarUrlInput) return;
      const url = calendarUrlInput.value.trim();

      updateVerifyStatusUI('verifying');
      if (currentStep === 3) {
        document.getElementById('btn-submit').disabled = true;
      }

      try {
        const response = await fetch('/api/validate-calendar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ calendar_url: url })
        });

        if (!response.ok) {
          throw new Error('HTTP error status: ' + response.status);
        }

        const data = await response.json();
        if (data.valid) {
          isCalendarVerified = true;
          updateVerifyStatusUI('verified');
          if (calendarUrlInput) {
            calendarUrlInput.classList.add('input-valid');
          }
          if (currentStep === 3) {
            document.getElementById('btn-submit').disabled = false;
          }
        } else {
          isCalendarVerified = false;
          updateVerifyStatusUI('error', data.error);
          if (calendarUrlInput) {
            calendarUrlInput.classList.remove('input-valid');
          }
          if (currentStep === 3) {
            document.getElementById('btn-submit').disabled = true;
          }
        }
      } catch (err) {
        isCalendarVerified = false;
        updateVerifyStatusUI('error', err.message);
        if (calendarUrlInput) {
          calendarUrlInput.classList.remove('input-valid');
        }
        if (currentStep === 3) {
          document.getElementById('btn-submit').disabled = true;
        }
      }
      saveDraft();
    });
  }

  // Init Progress & Preview
  updateWizardUI();
  loadDraft();
  setupInputValidation();
  updateRealtimePreview();
</script>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
<script>
  if (typeof L === 'undefined') {
    const mapEl = document.getElementById('map');
    if (mapEl) {
      mapEl.innerHTML = '<div style="color: #94a3b8; font-size: 1rem; font-weight: 600; text-align: center; display: flex; align-items: center; justify-content: center; height: 100%; font-family: sans-serif; background: #0b0f19;">🗺️ Map visualization offline</div>';
    }
  }
</script>
</body>
</html>`;
};
