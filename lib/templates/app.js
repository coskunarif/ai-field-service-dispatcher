import { escapeHtml, stripLeadingStepEmoji } from '../utils.js';
import { renderAuditTrailHtml } from './audit.js';

export const renderAppPage = (email, context, dispatchLogs = []) => {
  const technicians = context ? JSON.parse(context.technicians) : [];
  const businessRules = context
    ? JSON.parse(context.business_rules)
    : { timeout: '3', pricing: '120', rules: '' };
  const calendarConfig = context
    ? JSON.parse(context.calendar_config)
    : { calendar_url: '', sandbox_mode: 'true' };

  let techListHtml = '';
  if (technicians.length === 0) {
    techListHtml =
      '<p style="color: hsl(var(--text-3)); font-style: italic; font-size: 0.85rem;">No technicians configured.</p>';
  } else {
    technicians.forEach(t => {
      const shift = t.shift || 'Always';
      const status = t.status || 'active';
      const isOnline = status === 'active';
      const shiftLabels = {
        Always: '24/7 (Always Available)',
        Standard: 'Standard Shift (Mon-Fri 8-5)',
        Night: 'Night Shift (Mon-Fri 5pm-8am)',
        Weekend: 'Weekend Shift (Sat-Sun)',
      };
      const shiftLabel = shiftLabels[shift] || shift;

      const phoneIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 4px; color: #64748b;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
      const toolIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 4px; color: #64748b;"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;
      const clockIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 4px; color: #64748b;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

      const statusBadge = isOnline
        ? `<span style="display: inline-flex; align-items: center; gap: 5px; color: #10b981; font-weight: 600; font-size: 0.72rem; font-family: 'JetBrains Mono', monospace;"><span style="position: relative; display: inline-flex; width: 6px; height: 6px;"><span style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: #10b981; opacity: 0.75; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span><span style="width: 6px; height: 6px; background: #10b981; border-radius: 50%;"></span></span> On Duty</span>`
        : `<span style="display: inline-flex; align-items: center; gap: 5px; color: #94a3b8; font-weight: 600; font-size: 0.72rem; font-family: 'JetBrains Mono', monospace;"><span style="width: 6px; height: 6px; background: #64748b; border-radius: 50%;"></span> Off Duty</span>`;

      techListHtml += `
        <div style="padding: 12px 14px; background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; margin-bottom: 10px; transition: all 0.2s ease; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="color: #f8fafc; font-size: 0.9rem; font-weight: 600;">${escapeHtml(t.name)}</strong>
            <span class="brand-chip" style="font-size: 0.68rem; padding: 2px 7px; background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 4px; font-weight: 600;">${escapeHtml(t.trade)}</span>
          </div>
          <div style="font-size: 0.78rem; color: #94a3b8; line-height: 1.45; margin-bottom: 8px;">
            ${phoneIcon} <span style="font-family: 'JetBrains Mono', monospace; color: #cbd5e1;">${escapeHtml(t.phone)}</span> <br>
            ${toolIcon} Skills: <span style="color: #e2e8f0;">${escapeHtml(t.skills || 'General maintenance')}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.06); padding-top: 8px; font-size: 0.72rem; color: #94a3b8;">
            <span>${clockIcon} ${escapeHtml(shiftLabel)}</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span id="status-badge-${escapeHtml(t.name.replace(/\s+/g, '-'))}">${statusBadge}</span>
              <button type="button" onclick="toggleTechStatus('${escapeHtml(t.name)}')" class="preset-btn" style="margin: 0; padding: 3px 8px; font-size: 0.7rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 5px; cursor: pointer; color: #cbd5e1; font-weight: 500; transition: all 0.15s ease;">Toggle</button>
              <span id="assign-container-${escapeHtml(t.name.replace(/\s+/g, '-'))}">
                ${isOnline ? `<button type="button" onclick="forceAssignTech('${escapeHtml(t.name)}')" class="preset-btn" style="margin: 0; padding: 3px 8px; font-size: 0.7rem; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 5px; cursor: pointer; color: #34d399; font-weight: 600; transition: all 0.15s ease;">Assign</button>` : ''}
              </span>
            </div>
          </div>
        </div>
      `;
    });
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gainhelm AI Dispatch Board</title>
<meta name="robots" content="noindex,follow">
<link rel="stylesheet" href="/styles.css?v=20260604-redesign">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
<script src="/route-optimizer.js"></script>
<style>
  /* Leaflet Dark Mode Customizations */
  .leaflet-popup-content-wrapper, .leaflet-popup-tip {
    background: #1e293b !important;
    color: #f1f5f9 !important;
    border: 1px solid hsl(var(--line));
    border-radius: 8px;
  }
  .leaflet-popup-content {
    font-family: inherit;
    font-size: 0.85rem;
    line-height: 1.4;
  }
  body {
    background:
      radial-gradient(1000px 500px at 50% -10%, hsl(var(--brand) / 0.08), transparent 50%),
      linear-gradient(180deg, hsl(var(--bg)) 0%, hsl(var(--bg-2)) 100%);
  }
  .app-grid {
    display: grid;
    grid-template-columns: 310px 1fr 340px;
    gap: 24px;
    max-width: 1450px;
    margin: 24px auto;
    padding: 0 24px;
  }
  @media (max-width: 1100px) {
    .app-grid {
      grid-template-columns: 1fr;
    }
  }
  .panel {
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06);
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  /* Stats Cards */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    max-width: 1450px;
    margin: 24px auto 0 auto;
    padding: 0 24px;
  }
  @media (max-width: 768px) {
    .stats-row {
      grid-template-columns: 1fr 1fr;
    }
  }
  .stat-card {
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06);
    transition: all 0.2s ease;
  }
  .stat-card:hover {
    border-color: rgba(255, 255, 255, 0.16);
    transform: translateY(-1px);
  }
  .stat-value {
    font-size: 1.85rem;
    font-weight: 800;
    color: #f8fafc;
    font-family: 'JetBrains Mono', monospace;
    font-feature-settings: "tnum" 1;
    line-height: 1.1;
  }
  .stat-label {
    font-size: 0.72rem;
    color: #94a3b8;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Console Terminal */
  .console-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid hsl(var(--line));
    padding-bottom: 12px;
  }
  .console-status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: monospace;
    font-size: 0.8rem;
    color: hsl(var(--brand-2));
  }
  .pulse-dot {
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    box-shadow: 0 0 10px #10b981;
    animation: blink 1.5s infinite ease-in-out;
  }
  @keyframes blink {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }
  .console-filters {
    display: flex;
    gap: 6px;
  }
  .filter-btn {
    background: hsl(var(--surface-3));
    border: 1px solid hsl(var(--line));
    color: hsl(var(--text-3));
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .filter-btn.active {
    background: hsl(var(--brand) / 0.15);
    border-color: hsl(var(--brand));
    color: hsl(var(--brand-2));
  }
  .feed-container {
    height: 380px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    background: #030712;
    padding: 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-family: 'JetBrains Mono', 'IBM Plex Mono', monospace;
    font-size: 0.8rem;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.6);
  }
  .feed-entry {
    padding: 8px 12px;
    border-radius: 6px;
    line-height: 1.45;
    border-left: 2px solid #475569;
    background: rgba(15, 23, 42, 0.6);
    color: #cbd5e1;
    border: 1px solid rgba(255, 255, 255, 0.04);
    border-left: 3px solid #475569;
  }
  .feed-entry.info {
    border-left-color: #3b82f6;
    background: rgba(59, 130, 246, 0.06);
  }
  .feed-entry.ai {
    border-left-color: #10b981;
    background: rgba(16, 185, 129, 0.06);
    color: #e2e8f0;
  }
  .feed-entry.success {
    border-left-color: #10b981;
    background: rgba(16, 185, 129, 0.08);
  }
  .feed-entry.warning {
    border-left-color: #ef4444;
    background: rgba(239, 68, 68, 0.08);
  }
  .log-time {
    font-size: 0.7rem;
    color: #64748b;
    margin-bottom: 2px;
    font-family: 'JetBrains Mono', monospace;
  }

  /* Interactive Phone Simulation (Titanium Pro Mockup) */
  .phone-frame {
    width: 100%;
    max-width: 320px;
    background: #000;
    border: 8px solid #1e2638;
    border-radius: 36px;
    height: 520px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.75), inset 0 0 0 1px rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
  }
  .phone-frame::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 72px;
    height: 16px;
    background: #000;
    border-radius: 12px;
    z-index: 10;
  }
  .phone-screen {
    flex: 1;
    background: #090e1a;
    display: flex;
    flex-direction: column;
    padding: 28px 12px 12px 12px;
  }
  .phone-header {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 6px 0 10px 0;
    text-align: center;
    color: #fff;
    font-weight: 700;
    font-size: 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .phone-chat-area {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 4px;
    scrollbar-width: none;
  }
  .phone-chat-area::-webkit-scrollbar {
    display: none;
  }
  .sms-bubble {
    max-width: 84%;
    padding: 8px 12px;
    border-radius: 14px;
    font-size: 0.8rem;
    line-height: 1.35;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  .sms-bubble.received {
    align-self: flex-start;
    background: #1e293b;
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #f1f5f9;
    border-bottom-left-radius: 4px;
  }
  .sms-bubble.sent {
    align-self: flex-end;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #ffffff;
    font-weight: 500;
    border-bottom-right-radius: 4px;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
  }
  .phone-input-bar {
    display: flex;
    gap: 6px;
    margin-top: 8px;
  }
  .phone-input-bar input {
    flex: 1;
    background: #030712;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 18px;
    padding: 6px 12px;
    color: #fff;
    font-size: 0.8rem;
    transition: all 0.2s ease;
  }
  .phone-input-bar input:focus {
    border-color: #10b981;
    outline: none;
  }
  .phone-send-btn {
    background: #10b981;
    color: #030712;
    border: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-weight: 700;
    transition: all 0.15s ease;
  }
  .phone-send-btn:hover {
    transform: scale(1.05);
    background: #34d399;
  }
  .quick-reply-drawer {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding: 4px 0;
    margin-top: 8px;
    scrollbar-width: none;
  }
  .quick-reply-drawer::-webkit-scrollbar {
    display: none;
  }
  .quick-pill {
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(16, 185, 129, 0.3);
    color: #34d399;
    padding: 4px 10px;
    border-radius: 14px;
    font-size: 0.74rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s ease;
  }
  .quick-pill:hover {
    background: rgba(16, 185, 129, 0.15);
    border-color: #10b981;
    transform: translateY(-1px);
  }

  /* Calendar Notification banner */
  .calendar-alert {
    position: absolute;
    top: -60px;
    left: 10px;
    right: 10px;
    background: hsl(var(--surface-2));
    border: 1px solid #10b981;
    border-radius: 12px;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: var(--shadow-md);
    transition: top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 100;
  }
  .calendar-alert.show {
    top: 30px;
  }
  .calendar-title {
    color: #fff;
    font-size: 0.8rem;
    font-weight: 700;
  }
  .calendar-sub {
    color: #10b981;
    font-size: 0.72rem;
    font-weight: 600;
  }
</style>
</head>
<body>
<header style="position: sticky; top: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; padding: 12px 28px; background: rgba(8, 13, 23, 0.85); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
  <div style="display: flex; align-items: center; gap: 14px;">
    <a href="/" class="logo" style="text-decoration: none; display: flex; align-items: center; gap: 10px;">
      <div class="logo-icon" style="width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(16, 185, 129, 0.35);">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
      </div>
      <span style="color: #ffffff; font-weight: 700; font-size: 1.15rem; letter-spacing: -0.02em;">Gainhelm</span>
    </a>
    <span style="padding: 2px 8px; border-radius: 9999px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); color: #34d399; font-size: 0.7rem; font-weight: 600; font-family: 'JetBrains Mono', monospace;">v2.4 DISPATCH-ENGINE</span>
  </div>
  <div style="display: flex; align-items: center; gap: 10px;">
    <a href="/sandbox" style="padding: 6px 12px; border-radius: 6px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #cbd5e1; font-size: 0.8rem; font-weight: 600; text-decoration: none; transition: all 0.15s ease;">Simulator</a>
    <a href="/setup?email=${escapeHtml(email)}" style="padding: 6px 12px; border-radius: 6px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #cbd5e1; font-size: 0.8rem; font-weight: 600; text-decoration: none; transition: all 0.15s ease;">Settings</a>
    <div style="font-size: 0.82rem; color: #34d399; font-weight: 700; padding: 4px 10px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 6px;">Supervision Board</div>
  </div>
</header>
<main>
  
  <!-- Stats Row -->
  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-value" id="dispatch-count">0</div>
      <div class="stat-label">Dispatches Routed</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${technicians.length}</div>
      <div class="stat-label">Active Team</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" id="alert-count">0</div>
      <div class="stat-label">Pending Alerts</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" id="match-rate">100%</div>
      <div class="stat-label">Match Success Rate</div>
    </div>
  </div>

  <div class="app-grid">
    
    <!-- LEFT PANEL: Context Detail -->
    <div class="panel">
      <div>
        <h3 style="color: #fff; margin-bottom: 6px; font-size: 1.1rem; font-weight: 700; letter-spacing: -0.01em;">Dispatcher Context</h3>
        <p style="font-size: 0.8rem; color: #94a3b8; line-height: 1.45;">
          Active rule sets running on the Gainhelm sandbox gateway.
        </p>
      </div>

      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px 14px;">
        <div style="font-size: 0.72rem; text-transform: uppercase; color: #94a3b8; font-weight: 600; margin-bottom: 4px; letter-spacing: 0.04em;">Subscribed Owner</div>
        <strong style="color: #34d399; font-size: 0.86rem; font-family: 'JetBrains Mono', monospace; overflow-wrap: break-word;">${escapeHtml(email)}</strong>
      </div>

      <div>
        <h4 style="color: #fff; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 6px; margin-bottom: 10px;">Dispatch Rules</h4>
        <div style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.5; display: flex; flex-direction: column; gap: 8px;">
          <div><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 4px; color: #64748b;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Reply Timeout: <strong>${escapeHtml(businessRules.timeout)} minutes</strong></div>
          <div><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 4px; color: #64748b;"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Base Fee: <strong>$${escapeHtml(businessRules.pricing)}</strong></div>
          <div><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 4px; color: #64748b;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> Custom Guidelines: <br>
               <span style="color: #94a3b8; font-style: italic; font-size: 0.78rem; display: block; margin-top: 4px; border-left: 2px solid #10b981; padding-left: 8px;">
                 "${escapeHtml(businessRules.rules || 'No custom rules specified.')}"
               </span>
          </div>
        </div>
      </div>

      <div>
        <h4 style="color: #fff; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 6px; margin-bottom: 12px;">Configured Team</h4>
        ${techListHtml}
      </div>

      <a href="/setup?email=${escapeHtml(email)}" class="cta-secondary" style="text-align: center; font-weight: bold; border-color: rgba(255, 255, 255, 0.12); border-radius: 8px; padding: 10px; font-size: 0.85rem;">
        Modify AI Context
      </a>
    </div>

    <!-- CENTER PANEL: AI Terminal Console & Recent Dispatches -->
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div id="map-panel" class="panel" style="height: 280px; min-height: 250px; max-height: 300px; padding: 0; overflow: hidden; position: relative;">
        <div id="map" style="width: 100%; height: 100%; z-index: 1; background: #0b0f19;"></div>
      </div>
      <div class="panel" style="gap: 16px;">
        <div class="console-header">
          <div>
            <h2 style="color: #fff; font-size: 1.35rem; font-weight: 700; margin-bottom: 2px;">AI Dispatch Terminal</h2>
            <div class="console-status">
              <span class="pulse-dot"></span>
              <span>SYSTEM ON: GATEWAY_SIMULATOR</span>
            </div>
          </div>
          <div class="console-filters">
            <button class="filter-btn active" id="btn-filter-all" onclick="filterLogs('all')">ALL</button>
            <button class="filter-btn" id="btn-filter-ai" onclick="filterLogs('ai')">REASONING</button>
            <button class="filter-btn" id="btn-filter-sms" onclick="filterLogs('sms')">SMS</button>
          </div>
        </div>

        <div class="feed-container" id="feed">
          <div class="feed-entry info">
            <div class="log-time">${new Date().toLocaleTimeString()}</div>
            Gainhelm AI Dispatcher is running in sandbox mode for <strong>${escapeHtml(email)}</strong>. Submit a job request below to trigger the simulation.
          </div>
        </div>

        <!-- Simulator Form -->
        <form id="simulate-form" onsubmit="triggerSimulation(event)" style="display: flex; flex-direction: column; gap: 12px; background: rgba(15, 23, 42, 0.6); padding: 18px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 1px 3px rgba(0,0,0,0.3);">
          <div style="font-weight: 700; color: #f8fafc; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.04em;">Simulate Dispatch Request</div>
          <div style="display: flex; gap: 10px;">
            <div style="flex: 2;">
              <input type="text" id="job-desc" placeholder="E.g. Broken pipe at 789 Maple Rd or AC repair" required style="width: 100%; background: #030712; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; padding: 10px 14px; color: #fff; font-size: 0.88rem;">
            </div>
            <div style="flex: 1;">
              <select id="job-trade" style="width: 100%; background: #030712; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; padding: 10px 14px; color: #fff; font-size: 0.88rem;">
                <option value="HVAC">HVAC</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Landscaping">Landscaping</option>
                <option value="Other">Other / General</option>
              </select>
            </div>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label for="job-time" style="font-size: 0.72rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; display: block;">Simulated Job Time</label>
            <select id="job-time" style="width: 100%; background: #030712; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; padding: 10px 14px; color: #fff; font-size: 0.88rem;">
              <option value="BusinessHours">Normal Business Hours (Mon-Fri 9am-5pm)</option>
              <option value="AfterHours">After Hours / Late Night (Mon-Fri 11pm)</option>
              <option value="Weekend">Weekend / Off-Shift Hours (Saturday 2pm)</option>
            </select>
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label for="traffic-multiplier" style="font-size: 0.72rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; display: block;">Traffic Conditions</label>
            <select id="traffic-multiplier" style="width: 100%; background: #030712; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; padding: 10px 14px; color: #fff; font-size: 0.88rem;">
              <option value="1.0">Normal (1.0x)</option>
              <option value="1.8">Rush Hour (1.8x)</option>
              <option value="3.0">Accident / Gridlock (3.0x)</option>
            </select>
          </div>
          
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 0.74rem; color: #94a3b8; align-self: center;">Quick Prompts:</span>
            <button type="button" class="preset-btn" onclick="fillPrompt('AC making loud buzzing noise', 'HVAC')" style="padding: 4px 10px; font-size: 0.72rem; border-radius: 9999px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.12); color: #cbd5e1; cursor: pointer; transition: all 0.15s ease;">AC Noise (HVAC)</button>
            <button type="button" class="preset-btn" onclick="fillPrompt('Kitchen sink leaking under cabinet', 'Plumbing')" style="padding: 4px 10px; font-size: 0.72rem; border-radius: 9999px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.12); color: #cbd5e1; cursor: pointer; transition: all 0.15s ease;">Leak (Plumbing)</button>
            <button type="button" class="preset-btn" onclick="fillPrompt('Living room outlets lost power', 'Electrical')" style="padding: 4px 10px; font-size: 0.72rem; border-radius: 9999px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.12); color: #cbd5e1; cursor: pointer; transition: all 0.15s ease;">Outlets (Electrical)</button>
          </div>

          <button type="submit" class="cta-primary" style="border: none; border-radius: 8px; padding: 12px; font-weight: 700; cursor: pointer; font-size: 0.92rem; margin-top: 6px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #020617; box-shadow: 0 2px 10px rgba(16, 185, 129, 0.3); letter-spacing: -0.01em;">
            Dispatch Work Order
          </button>
        </form>
      </div>

      <!-- Recent Dispatches Audit Trail -->
      <div class="panel" style="gap: 16px;">
        <div>
          <h3 style="color: #fff; margin-bottom: 4px; font-size: 1.15rem; font-weight: 700;">Recent Dispatches (Audit Trail)</h3>
          <p style="font-size: 0.82rem; color: hsl(var(--text-3)); line-height: 1.45;">
            Persistent history of dispatcher runs stored in PostgreSQL database.
          </p>
        </div>
        
        <div id="audit-trail-container" style="display: flex; flex-direction: column; gap: 10px; max-height: 350px; overflow-y: auto; scrollbar-width: none;">
          ${renderAuditTrailHtml(dispatchLogs)}
        </div>
      </div>
    </div>

    <!-- RIGHT PANEL: Live Phone Emulator -->
    <div class="panel" style="align-items: center; justify-content: center;">
      <div class="phone-frame">
        
        <!-- Google Calendar Slide Notification -->
        <div class="calendar-alert" id="calendar-alert">
          <div style="background: #10b981; color: #000; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: bold;">📅</div>
          <div style="flex: 1;">
            <div class="calendar-title">Google Calendar Event</div>
            <div class="calendar-sub" id="calendar-event-text">Job scheduled successfully!</div>
          </div>
        </div>

        <div class="phone-screen">
          
          <div class="phone-header">
            <span id="phone-title" style="color: hsl(var(--brand-2));">💬 Dispatch Simulation</span>
            <span id="phone-subtitle" style="font-size: 0.72rem; color: hsl(var(--text-3)); font-weight: 500;">No active dispatches</span>
          </div>

          <div class="phone-chat-area" id="phone-chat">
            <div style="text-align: center; color: hsl(var(--text-3)); font-size: 0.78rem; margin-top: 100px;">
              📵 Waiting for incoming dispatch SMS.
            </div>
          </div>

          <!-- Quick replies tray -->
          <div class="quick-reply-drawer" id="quick-replies" style="display: none;">
            <button type="button" class="quick-pill quick-reply-btn" onclick="sendMockSMS('YES')">Accept Job (YES)</button>
            <button type="button" class="quick-pill quick-reply-btn" onclick="sendMockSMS('DECLINE')">Decline Job (BUSY)</button>
            <button type="button" class="quick-pill" onclick="sendMockSMS('I am busy right now')">I am busy</button>
          </div>

          <div class="phone-input-bar">
            <input type="text" id="phone-input" placeholder="Type response..." onkeydown="if(event.key === 'Enter') submitPhoneSMS()">
            <button class="phone-send-btn" onclick="submitPhoneSMS()">↑</button>
          </div>

        </div>
      </div>
      <p style="font-size: 0.78rem; color: hsl(var(--text-3)); text-align: center; max-width: 280px; margin-top: 6px; line-height: 1.45;">
        Simulate the technician's phone! Use the keyboard or quick-replies to accept/decline job notifications.
      </p>
    </div>

  </div>
</main>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
<script>
  const escapeHtml = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const stepEmojis = ['🤖', '📥', '💬', '📱', '✅', '⚠️'];
  function stripLeadingStepEmoji(text) {
    const matched = stepEmojis.find(e => text.startsWith(e));
    return matched ? text.slice(matched.length).replace(/^\\s*/, '') : text;
  }

  const technicians = ${JSON.stringify(technicians)};
  const rules = ${JSON.stringify(businessRules)};
  const calendar = ${JSON.stringify(calendarConfig)};
  
  let dispatchCount = 0;
  let activeAlerts = 0;
  let activeTech = null;
  let activeJob = '';
  let activeTrade = '';
  let currentStep = 0; // State machine step for conversation simulation
  let currentSessionLogs = [];

  let activeRouteDistance = null;
  let activeRouteDuration = null;
  let activeTrafficMultiplier = null;

  let map = null;
  let techMarkers = {};
  let jobMarker = null;
  let routingPolyline = null;
  let activeLogId = null;
  let notesPollInterval = null;

  function getStableJobCoords(uuidStr) {
    let hash = 0;
    for (let i = 0; i < uuidStr.length; i++) {
      hash = uuidStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const latOffset = ((hash & 0xFF) / 255 - 0.5) * 0.015;
    const lngOffset = (((hash >> 8) & 0xFF) / 255 - 0.5) * 0.015;
    return [41.8781 + latOffset, -87.6298 + lngOffset];
  }

  function startPollingNotes(logId) {
    activeLogId = logId;
    if (notesPollInterval) {
      clearInterval(notesPollInterval);
    }
    notesPollInterval = setInterval(() => {
      fetch('/app/poll-notes?id=' + activeLogId)
        .then(res => res.json())
        .then(pollData => {
          if (pollData && pollData.notes && pollData.notes.length > 0) {
            pollData.notes.forEach(note => {
              logEvent('📱 Customer sent entry note: ' + note, 'sms');
              addPhoneSMS('Customer Note: ' + note, 'received');
            });
          }
        }).catch(err => console.error('Error polling notes:', err));
    }, 2000);
  }

  // Custom SVG Markers
  const greenIcon = typeof L !== 'undefined' ? L.divIcon({
    html: \`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#10b981" stroke="#fff" stroke-width="2"/>
             <circle cx="12" cy="9" r="3" fill="#fff"/>
           </svg>\`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
    className: ''
  }) : null;

  const greyIcon = typeof L !== 'undefined' ? L.divIcon({
    html: \`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#94a3b8" stroke="#fff" stroke-width="2"/>
             <circle cx="12" cy="9" r="3" fill="#fff"/>
           </svg>\`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
    className: ''
  }) : null;

  const orangeJobIcon = typeof L !== 'undefined' ? L.divIcon({
    html: \`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="animation: pulse 1.5s infinite ease-in-out;">
             <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#f59e0b" stroke="#fff" stroke-width="2"/>
             <circle cx="12" cy="9" r="3" fill="#fff"/>
           </svg>\`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
    className: ''
  }) : null;

  const redJobIcon = typeof L !== 'undefined' ? L.divIcon({
    html: \`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#ef4444" stroke="#fff" stroke-width="2"/>
             <circle cx="12" cy="9" r="3" fill="#fff"/>
           </svg>\`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
    className: ''
  }) : null;

  const defaultLat = 41.8781;
  const defaultLng = -87.6298;

  function initMap() {
    if (typeof L === 'undefined') {
      const mapEl = document.getElementById('map');
      if (mapEl) {
        mapEl.innerHTML = '<div style="color: #94a3b8; font-size: 1rem; font-weight: 600; text-align: center; display: flex; align-items: center; justify-content: center; height: 100%; font-family: sans-serif; background: #0b0f19;">🗺️ Map visualization offline</div>';
      }
      return;
    }

    map = L.map('map').setView([defaultLat, defaultLng], 13);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    plotTechnicians();
  }

  window.toggleAuditDetails = function(el) {
    const logId = el.getAttribute('data-id');
    const target = document.getElementById('audit-details-' + logId);
    if (target) {
      target.style.display = target.style.display === 'none' ? 'block' : 'none';
    }
  };

  function plotTechnicians() {
    if (!map) return;
    
    for (let key in techMarkers) {
      map.removeLayer(techMarkers[key]);
    }
    techMarkers = {};

    technicians.forEach((t, i) => {
      if (t.lat === null || t.lng === null || t.lat === undefined || t.lng === undefined || String(t.lat).trim() === '' || String(t.lng).trim() === '') {
        return;
      }
      let lat = parseFloat(t.lat);
      let lng = parseFloat(t.lng);
      
      const hasValidCoords = !isNaN(lat) && lat >= -90.0 && lat <= 90.0 && !isNaN(lng) && lng >= -180.0 && lng <= 180.0;
      
      if (!hasValidCoords) {
        lat = defaultLat + (i + 1) * 0.005 * Math.sin(i);
        lng = defaultLng + (i + 1) * 0.005 * Math.cos(i);
      }
      
      const isOnline = t.status === 'active';
      const icon = isOnline ? greenIcon : greyIcon;
      
      const marker = L.marker([lat, lng], { icon: icon }).addTo(map);
      
      const popupHtml = \`
        <div style="font-family: inherit; color: #f1f5f9;">
          <h4 style="margin: 0 0 4px 0; color: #fff;">\${escapeHtml(t.name)}</h4>
          <div style="font-size: 0.8rem; margin-bottom: 4px;"><strong>Trade:</strong> \${escapeHtml(t.trade)}</div>
          <div style="font-size: 0.8rem; margin-bottom: 4px;"><strong>Phone:</strong> \${escapeHtml(t.phone)}</div>
          <div style="font-size: 0.8rem; margin-bottom: 6px;"><strong>Status:</strong> \${isOnline ? 'On Duty' : 'Off Duty'}</div>
          \${isOnline ? \`<button type="button" onclick="forceAssignTech('\${escapeHtml(t.name)}')" class="preset-btn" style="margin: 4px 0 0 0; width: 100%; padding: 4px 8px; font-size: 0.72rem; background: hsl(var(--brand) / 0.2); border: 1px solid hsl(var(--brand)); color: hsl(var(--brand-2)); font-weight: bold; border-radius: 6px; cursor: pointer;">Force Assign</button>\` : ''}
        </div>
      \`;
      marker.bindPopup(popupHtml);
      techMarkers[t.name] = marker;
    });
  }

  function calculateAndAnimateRoute(tech, color = '#f59e0b', isDashed = true) {
    if (!tech) return;
    
    let techLat = parseFloat(tech.lat);
    let techLng = parseFloat(tech.lng);
    
    if (isNaN(techLat) || isNaN(techLng)) {
      const techMarker = techMarkers[tech.name];
      if (techMarker) {
        const latLng = techMarker.getLatLng();
        techLat = latLng.lat;
        techLng = latLng.lng;
      } else {
        techLat = defaultLat;
        techLng = defaultLng;
      }
    }
    
    let jobLat = defaultLat;
    let jobLng = defaultLng;
    if (jobMarker) {
      const jobLatLng = jobMarker.getLatLng();
      jobLat = jobLatLng.lat;
      jobLng = jobLatLng.lng;
    }
    
    activeTrafficMultiplier = parseFloat(document.getElementById('traffic-multiplier').value || '1.0');
    
    if (techLat === jobLat && techLng === jobLng) {
      activeRouteDistance = 0;
      activeRouteDuration = 1;
    } else {
      activeRouteDistance = RouteOptimizer.haversineDistance(techLat, techLng, jobLat, jobLng);
      activeRouteDuration = RouteOptimizer.calculateETA(activeRouteDistance, activeTrafficMultiplier);
    }
    
    if (typeof L !== 'undefined' && map) {
      const techMarker = techMarkers[tech.name];
      if (techMarker) {
        if (routingPolyline) {
          map.removeLayer(routingPolyline);
        }
        
        const options = {
          color: color,
          weight: 3
        };
        if (isDashed) {
          options.dashArray = '5, 10';
        }
        
        routingPolyline = L.polyline([[techLat, techLng], [jobLat, jobLng]], options).addTo(map);
        
        if (!isDashed) {
          const pathEl = routingPolyline.getElement();
          if (pathEl) {
            pathEl.removeAttribute('stroke-dasharray');
            pathEl.setAttribute('stroke', color);
          }
        }
        
        RouteOptimizer.animateMarker(techMarker, routingPolyline, [techLat, techLng], [jobLat, jobLng], 2000);
      }
    }
  }

  function isTechOnShift(tech, simulatedTime) {
    const shift = tech.shift || 'Always';
    if (shift === 'Always') return true;
    if (simulatedTime === 'BusinessHours' && shift === 'Standard') return true;
    if (simulatedTime === 'AfterHours' && shift === 'Night') return true;
    if (simulatedTime === 'Weekend' && shift === 'Weekend') return true;
    return false;
  }

  function findEligibleTechnician(trade, simulatedTime, excludeTechName = null, silent = false) {
    if (!silent) logEvent(\`🤖 Agent Reasoning: Evaluating active roster matching trade '\${trade}' or General fallback.\`, 'ai');
    
    // First pass: look for exact trade match
    const tradeTechs = technicians.filter(t => t.trade.toUpperCase() === trade.toUpperCase() && t.name !== excludeTechName);
    
    for (const t of tradeTechs) {
      const status = t.status || 'active';
      const shift = t.shift || 'Always';
      const isOnShift = isTechOnShift(t, simulatedTime);
      const isOnline = status === 'active';
      
      if (!isOnline) {
        if (!silent) logEvent(\`🤖 Agent Reasoning: Checked \${t.name} (Trade: \${t.trade}). Skipped - status is Off Duty.\`, 'ai');
        continue;
      }
      if (!isOnShift) {
        if (!silent) logEvent(\`🤖 Agent Reasoning: Checked \${t.name} (Trade: \${t.trade}, Shift: \${shift}). Skipped - shift not active for \${simulatedTime}.\`, 'ai');
        continue;
      }
      
      if (!silent) logEvent(\`🤖 Agent Reasoning: Checked \${t.name}. Eligible and available (On Duty, shift active).\`, 'ai');
      return t;
    }
    
    // Second pass: look for General / Other fallback
    if (!silent) logEvent(\`🤖 Agent Reasoning: No exact trade match available on shift. Checking 'Other/General' fallbacks.\`, 'ai');
    const fallbackTechs = technicians.filter(t => 
      (t.trade.toUpperCase() === 'OTHER' || t.trade.toUpperCase() === 'GENERAL') && t.name !== excludeTechName
    );
    
    for (const t of fallbackTechs) {
      const status = t.status || 'active';
      const shift = t.shift || 'Always';
      const isOnShift = isTechOnShift(t, simulatedTime);
      const isOnline = status === 'active';
      
      if (!isOnline) {
        if (!silent) logEvent(\`🤖 Agent Reasoning: Checked fallback \${t.name} (Trade: \${t.trade}). Skipped - status is Off Duty.\`, 'ai');
        continue;
      }
      if (!isOnShift) {
        if (!silent) logEvent(\`🤖 Agent Reasoning: Checked fallback \${t.name} (Trade: \${t.trade}, Shift: \${shift}). Skipped - shift not active for \${simulatedTime}.\`, 'ai');
        continue;
      }
      
      if (!silent) logEvent(\`🤖 Agent Reasoning: Checked fallback \${t.name}. Eligible and available (On Duty, shift active).\`, 'ai');
      return t;
    }

    return null;
  }

  function triggerSimulation(e) {
    if (e) e.preventDefault();
    plotTechnicians();
    const desc = document.getElementById('job-desc').value.trim();
    const trade = document.getElementById('job-trade').value;
    const simTime = document.getElementById('job-time').value;
    if (!desc) return;
    
    currentSessionLogs = [];
    activeRouteDistance = null;
    activeRouteDuration = null;
    activeTrafficMultiplier = parseFloat(document.getElementById('traffic-multiplier').value || '1.0');
    
    document.getElementById('job-desc').value = '';
    activeJob = desc;
    activeTrade = trade;
    currentStep = 1;
    dispatchCount++;
    document.getElementById('dispatch-count').innerText = dispatchCount;
    
    // Clear chat simulation
    const chat = document.getElementById('phone-chat');
    chat.innerHTML = '';
    document.getElementById('quick-replies').style.display = 'flex';

    if (map) {
      if (routingPolyline) {
        map.removeLayer(routingPolyline);
        routingPolyline = null;
      }
    }

    // Job Pin Coordinate
    const jobLat = defaultLat + (Math.random() - 0.5) * 0.015;
    const jobLng = defaultLng + (Math.random() - 0.5) * 0.015;
    if (map) {
      if (jobMarker) {
        map.removeLayer(jobMarker);
      }
      jobMarker = L.marker([jobLat, jobLng], { icon: orangeJobIcon }).addTo(map);
      jobMarker.bindPopup(\`<div style="color: #fff;"><strong>Job:</strong> \\\${escapeHtml(desc)}</div>\`).openPopup();
    }

    const firstMatch = findEligibleTechnician(trade, simTime, null, true);
    if (firstMatch && map && jobMarker) {
      activeTech = firstMatch;
      document.getElementById('phone-title').innerText = '💬 ' + firstMatch.name;
      document.getElementById('phone-subtitle').innerText = firstMatch.trade + ' • ' + firstMatch.phone;

      const techMarker = techMarkers[firstMatch.name];
      if (techMarker) {
        const techLatLng = techMarker.getLatLng();
        const jobLatLng = jobMarker.getLatLng();
        routingPolyline = L.polyline([techLatLng, jobLatLng], {
          color: '#f59e0b',
          dashArray: '5, 10',
          weight: 3
        }).addTo(map);
      }
    } else if (map && jobMarker) {
      jobMarker.setIcon(redJobIcon);
    }

    logEvent(\`📥 Job Request Received: "\${desc}" (Trade Required: \${trade}, Time: \${simTime})\`, 'info');
    
    setTimeout(() => {
      logEvent(\`🤖 Agent Reasoning: Evaluated dispatch rules (Fee: $\${rules.pricing}, Timeout: \${rules.timeout} min).\`, 'ai');
    }, 800);

    setTimeout(() => {
      if (currentStep !== 1) return;

      const match = findEligibleTechnician(trade, simTime);
      
      if (!match) {
        logEvent(\`⚠️ Agent Alert: No technicians are available for trade '\${trade}' during \${simTime}. Escalation triggered.\`, 'warning');
        activeAlerts++;
        document.getElementById('alert-count').innerText = activeAlerts;
        
        chat.innerHTML = \`<div style="text-align: center; color: #ef4444; font-size: 0.78rem; margin-top: 80px;">⚠️ Dispatch Alert: No active technician found for \${trade} during \${simTime}</div>\`;
        document.getElementById('phone-subtitle').innerText = 'System Alert';
        saveDispatchLog('escalated');

        if (routingPolyline && map) {
          map.removeLayer(routingPolyline);
          routingPolyline = null;
        }
        if (jobMarker) {
          jobMarker.setIcon(redJobIcon);
        }
        return;
      }
      
      activeTech = match;
      document.getElementById('phone-title').innerText = '💬 ' + match.name;
      document.getElementById('phone-subtitle').innerText = match.trade + ' • ' + match.phone;
      
      logEvent(\`🤖 Agent Reasoning: Dispatched job to technician \${match.name} (\${match.phone}) for trade '\${trade}'.\`, 'ai');
      
      // Calculate route and start marker animation
      calculateAndAnimateRoute(match, '#f59e0b', true);

      setTimeout(() => {
        if (currentStep !== 1) return;
        const trafficMultiplierVal = document.getElementById('traffic-multiplier').value;
        let trafficLabel = 'Normal';
        if (trafficMultiplierVal === '1.8') trafficLabel = 'Rush Hour';
        else if (trafficMultiplierVal === '3.0') trafficLabel = 'Accident';
        
        const smsText = \`Gainhelm AI Offer: Emergency \${trade} job at \${desc}. Call Fee: $\${rules.pricing}. ETA: \${activeRouteDuration} mins under \${trafficLabel} traffic. Reply YES to accept, or NO to decline.\`;
        logEvent(\`💬 Sent SMS to \${match.name}: "\${smsText}"\`, 'sms');
        addPhoneSMS(smsText, 'received');
      }, 1000);

    }, 1800);
  }

  function logEvent(text, type = 'info') {
    const feed = document.getElementById('feed');
    const entry = document.createElement('div');
    entry.className = 'feed-entry ' + type;
    const timeStr = new Date().toLocaleTimeString();
    entry.innerHTML = \`<div class="log-time">\${timeStr}</div><div>\${text}</div>\`;
    feed.appendChild(entry);
    feed.scrollTop = feed.scrollHeight;

    // Track logs
    let icon = '';
    if (type === 'ai') icon = '🤖 ';
    else if (type === 'sms') icon = '💬 ';
    else if (type === 'info' && text.includes('📥')) icon = '';
    else if (type === 'info') icon = 'ℹ️ ';
    else if (type === 'warning') icon = '⚠️ ';
    else if (type === 'success') icon = '✅ ';
    currentSessionLogs.push(icon + text);
  }

  function saveDispatchLog(status) {
    const body = {
      email: ${JSON.stringify(email)},
      jobDescription: activeJob,
      trade: activeTrade,
      simulatedTime: document.getElementById('job-time').value,
      dispatchedToName: activeTech ? activeTech.name : null,
      dispatchedToPhone: activeTech ? activeTech.phone : null,
      status: status,
      stepLogs: currentSessionLogs,
      distance_miles: activeRouteDistance,
      duration_mins: activeRouteDuration,
      traffic_multiplier: activeTrafficMultiplier
    };
    fetch('/app/log-dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(res => res.json())
      .then(data => {
        if (data.success) {
          body.id = data.id;
          startPollingNotes(data.id);
          
          if (jobMarker && data.id) {
            const stableCoords = getStableJobCoords(data.id);
            jobMarker.setLatLng(stableCoords);
            if (activeTech && map) {
              if (routingPolyline) {
                map.removeLayer(routingPolyline);
              }
              const techMarker = techMarkers[activeTech.name];
              if (techMarker) {
                const techLatLng = techMarker.getLatLng();
                const isManual = currentStep === 2;
                routingPolyline = L.polyline([techLatLng, stableCoords], {
                  color: isManual ? '#10b981' : '#f59e0b',
                  dashArray: isManual ? undefined : '5, 10',
                  weight: 3
                }).addTo(map);
              }
            }
          }
          
          appendAuditTrailRow(body);
        }
      }).catch(err => console.error('Error logging dispatch:', err));
  }

  function appendAuditTrailRow(body) {
    const container = document.getElementById('audit-trail-container');
    if (!container) return;
    
    const placeholder = container.querySelector('div[style*="font-style: italic"]');
    if (placeholder) {
      placeholder.remove();
    }
    
    const timeStr = new Date().toLocaleString();
    let statusColor = '#ef4444';
    let statusText = 'Escalated';
    if (body.status === 'accepted') {
      statusColor = '#10b981';
      statusText = 'Accepted';
    } else if (body.status === 'manually_assigned') {
      statusColor = '#10b981';
      statusText = 'Manually Assigned';
    } else if (body.status === 'declined') {
      statusColor = '#f59e0b';
      statusText = 'Declined';
    }
    
    const matchedTechStr = body.dispatchedToName ? (escapeHtml(body.dispatchedToName) + ' (' + escapeHtml(body.dispatchedToPhone) + ')') : 'None (System Escalation)';
    const logId = body.id || 'temp-' + Math.random().toString(36).substring(7);
    
    const stepsHtml = body.stepLogs.map(s => {
      let icon = 'ℹ️';
      if (s.includes('🤖')) icon = '🤖';
      else if (s.includes('📥')) icon = '📥';
      else if (s.includes('💬')) icon = '💬';
      else if (s.includes('📱')) icon = '📱';
      else if (s.includes('✅')) icon = '✅';
      else if (s.includes('⚠️')) icon = '⚠️';
      
      const cleanText = stripLeadingStepEmoji(s)
        .replace('Agent Reasoning:', '<strong>Reasoning:</strong>')
        .replace('Agent Alert:', '<strong>Alert:</strong>')
        .replace('Agent Action:', '<strong>Action:</strong>')
        .replace('Job Request Received:', '<strong>Job Received:</strong>')
        .replace('Sent SMS to', '<strong>SMS Sent to</strong>')
        .replace('Received SMS from', '<strong>SMS Recv from</strong>');
        
      return '<div style="font-size: 0.76rem; color: hsl(var(--text-2)); padding: 4px 0; border-bottom: 1px solid hsl(var(--line) / 0.3); display: flex; gap: 6px;">' +
        '<span>' + icon + '</span>' +
        '<span>' + cleanText + '</span>' +
      '</div>';
    }).join('');

    const row = document.createElement('div');
    row.style.cssText = 'background: hsl(var(--surface-2) / 0.4); border: 1px solid hsl(var(--line)); border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; animation: slideIn 0.3s ease-out;';
    
    let routeInfoHtml = '';
    if (body.distance_miles !== null && body.distance_miles !== undefined) {
      routeInfoHtml = '<div style="font-size: 0.8rem; color: hsl(var(--text-3));">' +
        '📍 <strong>Route Info:</strong> ' + body.distance_miles + ' miles, ' + body.duration_mins + ' mins (' + body.traffic_multiplier + 'x traffic)' +
      '</div>';
    }

    let trackLinkHtml = '';
    if (body.status === 'accepted' || body.status === 'manually_assigned') {
      trackLinkHtml = '<a href="/app/track/' + logId + '" target="_blank" class="preset-btn" style="margin: 0; padding: 4px 10px; font-size: 0.72rem; background: hsl(var(--brand) / 0.2); border: 1px solid hsl(var(--brand)); border-radius: 6px; text-decoration: none; display: inline-block; color: hsl(var(--brand-2)); font-weight: bold; text-align: center;">' +
        'Track Live Route' +
      '</a>';
    }

    row.innerHTML = 
      '<div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid hsl(var(--line) / 0.5); padding-bottom: 6px;">' +
        '<span style="font-size: 0.72rem; color: hsl(var(--text-3)); font-family: monospace;">📅 ' + timeStr + '</span>' +
        '<span style="padding: 2px 8px; border-radius: 6px; background: ' + statusColor + '1A; color: ' + statusColor + '; border: 1px solid ' + statusColor + '33; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">' + statusText + '</span>' +
      '</div>' +
      '<div style="font-size: 0.84rem; color: #fff; line-height: 1.4;">' +
        '🏢 <strong>Job:</strong> "' + escapeHtml(body.jobDescription) + '" <span class="brand-chip" style="font-size: 0.7rem; padding: 1px 5px; background: hsl(var(--brand) / 0.1); color: hsl(var(--brand-2)); border: 1px solid hsl(var(--brand) / 0.25); border-radius: 4px;">' + escapeHtml(body.trade) + '</span>' +
      '</div>' +
      '<div style="font-size: 0.8rem; color: hsl(var(--text-2));">' +
        '👤 <strong>Dispatched to:</strong> ' + matchedTechStr +
      '</div>' +
      '<div style="font-size: 0.8rem; color: hsl(var(--text-3));">' +
        '⏱️ <strong>Shift Time:</strong> ' + escapeHtml(body.simulatedTime) +
      '</div>' +
      routeInfoHtml +
      '<div>' +
        '<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">' +
          '<button type="button" onclick="toggleAuditDetails(this)" data-id="' + logId + '"' +
                  ' class="preset-btn" style="margin: 0; padding: 4px 10px; font-size: 0.72rem; background: hsl(var(--surface-3)); border: 1px solid hsl(var(--line)); border-radius: 6px; cursor: pointer; color: hsl(var(--brand-2)); font-weight: bold;">' +
            'Show Agent Reasoning Trail' +
          '</button>' +
          trackLinkHtml +
        '</div>' +
        '<div id="audit-details-' + logId + '" style="display: none; margin-top: 8px; background: hsl(var(--bg) / 0.8); border: 1px solid hsl(var(--line)); border-radius: 8px; padding: 10px; max-height: 200px; overflow-y: auto; scrollbar-width: none;">' +
          stepsHtml +
        '</div>' +
      '</div>';
    
    container.insertBefore(row, container.firstChild);
  }

  async function toggleTechStatus(techName) {
    try {
      const res = await fetch('/app/toggle-technician', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ${JSON.stringify(email)}, techName })
      });
      const data = await res.json();
      if (data.success) {
        const tech = technicians.find(t => t.name === techName);
        if (tech) {
          tech.status = tech.status === 'active' ? 'inactive' : 'active';
          
          const isOnline = tech.status === 'active';
          const badgeElement = document.getElementById('status-badge-' + techName.replace(/\\s+/g, '-'));
          if (badgeElement) {
            badgeElement.innerHTML = isOnline
              ? \`<span style="display: inline-flex; align-items: center; gap: 6px; color: #10b981; font-weight: 700; font-size: 0.75rem;"><span style="width: 6px; height: 6px; background: #10b981; border-radius: 50%; box-shadow: 0 0 6px #10b981;"></span> On Duty</span>\`
              : \`<span style="display: inline-flex; align-items: center; gap: 6px; color: #94a3b8; font-weight: 700; font-size: 0.75rem;"><span style="width: 6px; height: 6px; background: #94a3b8; border-radius: 50%;"></span> Off Duty</span>\`;
          }

          const assignContainer = document.getElementById('assign-container-' + techName.replace(/\\s+/g, '-'));
          if (assignContainer) {
            assignContainer.innerHTML = isOnline
              ? \`<button type="button" onclick="forceAssignTech('\${escapeHtml(techName)}')" class="preset-btn" style="margin: 0; padding: 2px 6px; font-size: 0.68rem; background: hsl(var(--brand) / 0.1); border: 1px solid hsl(var(--brand)); border-radius: 4px; cursor: pointer; color: hsl(var(--brand-2)); font-weight: 600;">Assign</button>\`
              : '';
          }

          if (map && techMarkers[techName]) {
            techMarkers[techName].setIcon(isOnline ? greenIcon : greyIcon);
            const popupHtml = \`
              <div style="font-family: inherit; color: #f1f5f9;">
                <h4 style="margin: 0 0 4px 0; color: #fff;">\${escapeHtml(tech.name)}</h4>
                <div style="font-size: 0.8rem; margin-bottom: 4px;"><strong>Trade:</strong> \${escapeHtml(tech.trade)}</div>
                <div style="font-size: 0.8rem; margin-bottom: 4px;"><strong>Phone:</strong> \${escapeHtml(tech.phone)}</div>
                <div style="font-size: 0.8rem; margin-bottom: 6px;"><strong>Status:</strong> \${isOnline ? 'On Duty' : 'Off Duty'}</div>
                \${isOnline ? \`<button type="button" onclick="forceAssignTech('\${escapeHtml(tech.name)}')" class="preset-btn" style="margin: 4px 0 0 0; width: 100%; padding: 4px 8px; font-size: 0.72rem; background: hsl(var(--brand) / 0.2); border: 1px solid hsl(var(--brand)); color: hsl(var(--brand-2)); font-weight: bold; border-radius: 6px; cursor: pointer;">Force Assign</button>\` : ''}
              </div>
            \`;
            techMarkers[techName].setPopupContent(popupHtml);
          }
          
          logEvent(\`⚙️ Owner Command: Toggled \${techName} status to \${isOnline ? 'On Duty' : 'Off Duty'}.\`, 'info');
        }
      } else {
        alert('Failed to toggle duty status.');
      }
    } catch (err) {
      console.error('CLIENT: toggleTechStatus error:', err);
      alert('Error connecting to server.');
    }
  }

  function filterLogs(filterType) {
    document.querySelectorAll('.console-filters button').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-filter-' + filterType).classList.add('active');

    document.querySelectorAll('.feed-entry').forEach(el => {
      if (filterType === 'all') {
        el.style.display = 'block';
      } else if (filterType === 'ai') {
        el.style.display = el.classList.contains('ai') ? 'block' : 'none';
      } else if (filterType === 'sms') {
        el.style.display = el.classList.contains('sms') ? 'block' : 'none';
      }
    });
  }

  function fillPrompt(desc, trade) {
    document.getElementById('job-desc').value = desc;
    document.getElementById('job-trade').value = trade;
  }

  function addPhoneSMS(text, type) {
    const chat = document.getElementById('phone-chat');
    const bubble = document.createElement('div');
    bubble.className = 'sms-bubble ' + type;
    bubble.innerText = text;
    chat.appendChild(bubble);
    chat.scrollTop = chat.scrollHeight;
  }

  function sendMockSMS(text) {
    if (!activeTech || currentStep !== 1) return;
    addPhoneSMS(text, 'sent');
    logEvent(\`📱 Received SMS from \${activeTech.name}: "\${text}"\`, 'sms');

    // Process reply
    const norm = text.trim().toUpperCase();
    if (norm.includes('YES')) {
      currentStep = 2; // Accept state
      document.getElementById('quick-replies').style.display = 'none';

      if (routingPolyline) {
        routingPolyline.setStyle({
          color: '#10b981',
          dashArray: null
        });
        const pathEl = routingPolyline.getElement();
        if (pathEl) {
          pathEl.removeAttribute('stroke-dasharray');
          pathEl.setAttribute('stroke', '#10b981');
        }
      }
      
      setTimeout(() => {
        logEvent(\`🤖 Agent Action: Booking event on Google Calendar (\${calendar.calendar_url || 'https://calendar.google.com'}).\`, 'ai');
      }, 800);

      setTimeout(() => {
        logEvent(\`✅ Dispatch Complete: \${activeTech.name} is scheduled for "\${activeJob}". Customer notified.\`, 'success');
        
        // Show success alert on phone
        document.getElementById('calendar-event-text').innerText = \`\${activeTech.name} scheduled for \${activeJob.substring(0, 20)}...\`;
        const alertBanner = document.getElementById('calendar-alert');
        alertBanner.classList.add('show');
        setTimeout(() => alertBanner.classList.remove('show'), 6000);

        saveDispatchLog('accepted');
      }, 1800);

    } else if (norm.includes('NO') || norm.includes('DECLINE') || norm.includes('BUSY')) {
      currentStep = 0;
      document.getElementById('quick-replies').style.display = 'none';
      saveDispatchLog('declined');

      if (routingPolyline && map) {
        map.removeLayer(routingPolyline);
        routingPolyline = null;
      }

      setTimeout(() => {
        logEvent(\`🤖 Agent Reasoning: \${activeTech.name} declined the offer. Commencing fallback routing.\`, 'ai');
        
        // Look for fallback
        const simTime = document.getElementById('job-time').value;
        const fallback = findEligibleTechnician(activeTrade, simTime, activeTech.name);
        if (fallback) {
          setTimeout(() => {
            activeTech = fallback;
            document.getElementById('phone-title').innerText = '💬 ' + fallback.name;
            document.getElementById('phone-subtitle').innerText = fallback.trade + ' • ' + fallback.phone;
            
            // Clear current screen and start fresh for fallback
            const chat = document.getElementById('phone-chat');
            chat.innerHTML = '';
            document.getElementById('quick-replies').style.display = 'flex';
            currentStep = 1;

            calculateAndAnimateRoute(fallback, '#f59e0b', true);

            logEvent(\`🤖 Agent Reasoning: Rerouting job to fallback technician \${fallback.name} (\${fallback.phone}).\`, 'ai');
            
            setTimeout(() => {
              const trafficMultiplierVal = document.getElementById('traffic-multiplier').value;
              let trafficLabel = 'Normal';
              if (trafficMultiplierVal === '1.8') trafficLabel = 'Rush Hour';
              else if (trafficMultiplierVal === '3.0') trafficLabel = 'Accident';

              const smsText = \`Gainhelm AI Offer: Emergency \${activeTrade} job at \${activeJob}. Call Fee: $\${rules.pricing}. ETA: \${activeRouteDuration} mins under \${trafficLabel} traffic. Reply YES to accept.\`;
              logEvent(\`💬 Sent SMS to \${fallback.name}: "\${smsText}"\`, 'sms');
              addPhoneSMS(smsText, 'received');
            }, 1000);

          }, 800);
        } else {
          if (routingPolyline && map) {
            map.removeLayer(routingPolyline);
            routingPolyline = null;
          }
          if (jobMarker) {
            jobMarker.setIcon(redJobIcon);
          }
          logEvent(\`⚠️ Agent Alert: No fallback technicians are available matching trade '\${activeTrade}' during \${simTime}. Owner alerted.\`, 'warning');
          activeAlerts++;
          document.getElementById('alert-count').innerText = activeAlerts;
          saveDispatchLog('escalated');
        }
      }, 1000);
    } else {
      // Unrecognized reply
      setTimeout(() => {
        logEvent(\`🤖 Agent Reasoning: Unrecognized SMS format from \${activeTech.name}. Resending instructions.\`, 'ai');
        setTimeout(() => {
          const resendText = \`Gainhelm AI: Please reply YES to accept the dispatch task, or DECLINE to reject.\`;
          logEvent(\`💬 Sent SMS to \${activeTech.name}: "\${resendText}"\`, 'sms');
          addPhoneSMS(resendText, 'received');
        }, 800);
      }, 1000);
    }
  }

  function forceAssignTech(techName) {
    if (!activeJob) {
      alert('Please initiate a dispatch request first so there is a job to assign.');
      return;
    }
    
    const tech = technicians.find(t => t.name === techName);
    if (!tech) return;
    
    if (tech.status !== 'active') {
      alert('Technician is Off Duty and cannot be assigned.');
      return;
    }
    
    if (currentStep === 2) return;
    
    currentStep = 2;
    activeTech = tech;
    
    document.getElementById('phone-title').innerText = '💬 ' + tech.name;
    document.getElementById('phone-subtitle').innerText = tech.trade + ' • ' + tech.phone;
    document.getElementById('quick-replies').style.display = 'none';
    
    calculateAndAnimateRoute(tech, '#10b981', false);
    
    logEvent(\`⚙. Dispatch Override: Manually scheduled \${tech.name} for job.\`, 'info');
    logEvent(\`🤖 Agent Action: Booking event on Google Calendar (\${calendar.calendar_url || 'https://calendar.google.com'}).\`, 'ai');
    logEvent(\`✅ Dispatch Complete: \${tech.name} is scheduled for "\${activeJob}". Customer notified.\`, 'success');
    
    document.getElementById('calendar-event-text').innerText = \`\${tech.name} scheduled for \${activeJob.substring(0, 20)}...\`;
    const alertBanner = document.getElementById('calendar-alert');
    alertBanner.classList.add('show');
    setTimeout(() => alertBanner.classList.remove('show'), 6000);
    
    const body = {
      email: ${JSON.stringify(email)},
      jobDescription: activeJob,
      trade: activeTrade,
      simulatedTime: document.getElementById('job-time').value,
      technicianName: tech.name,
      technicianPhone: tech.phone,
      stepLogs: currentSessionLogs,
      distance_miles: activeRouteDistance,
      duration_mins: activeRouteDuration,
      traffic_multiplier: activeTrafficMultiplier
    };
    
    fetch('/app/manual-dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(res => res.json())
      .then(data => {
        if (data.success) {
          activeLogId = data.id;
          startPollingNotes(data.id);
          
          if (jobMarker && data.id) {
            const stableCoords = getStableJobCoords(data.id);
            jobMarker.setLatLng(stableCoords);
            if (activeTech && map) {
              if (routingPolyline) {
                map.removeLayer(routingPolyline);
              }
              const techMarker = techMarkers[activeTech.name];
              if (techMarker) {
                const techLatLng = techMarker.getLatLng();
                routingPolyline = L.polyline([techLatLng, stableCoords], {
                  color: '#10b981',
                  weight: 3
                }).addTo(map);
              }
            }
          }

          const auditBody = {
            id: data.id,
            email: body.email,
            jobDescription: body.jobDescription,
            trade: body.trade,
            simulatedTime: body.simulatedTime,
            dispatchedToName: body.technicianName,
            dispatchedToPhone: body.technicianPhone,
            status: 'manually_assigned',
            stepLogs: body.stepLogs,
            distance_miles: body.distance_miles,
            duration_mins: body.duration_mins,
            traffic_multiplier: body.traffic_multiplier
          };
          appendAuditTrailRow(auditBody);
        }
      }).catch(err => console.error('Error logging manual dispatch:', err));
  }

  function submitPhoneSMS() {
    const input = document.getElementById('phone-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendMockSMS(text);
  }

  // Initialize map
  initMap();
</script>
</body>
</html>`;
};
