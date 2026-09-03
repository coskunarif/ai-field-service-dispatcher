import { escapeHtml } from '../utils.js';

export const renderSandboxPage = (email = '', trade = 'HVAC', tech_count = '1-5', phone = '') => {
  const cleanEmail = escapeHtml(email || '');
  const cleanTrade = escapeHtml(trade || 'HVAC');
  const cleanTechCount = escapeHtml(tech_count || '1-5');
  const cleanPhone = escapeHtml(phone || '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gainhelm AI Sandbox Simulator</title>
<meta name="robots" content="noindex,follow">
<link rel="stylesheet" href="/styles.css?v=20260604-redesign">
<style>
  body {
    background:
      radial-gradient(1200px 650px at 10% -10%, hsl(var(--brand) / 0.18), transparent 56%),
      radial-gradient(900px 520px at 88% 2%, hsl(var(--cta) / 0.1), transparent 50%),
      radial-gradient(700px 500px at 50% 115%, hsl(var(--brand-2) / 0.08), transparent 52%),
      linear-gradient(180deg, hsl(var(--bg)) 0%, hsl(var(--bg-2)) 100%);
    min-height: 100vh;
    overflow-x: clip;
  }
  .sandbox-container {
    max-width: 1400px;
    margin: 40px auto 80px auto;
    padding: 0 24px;
  }
  .sandbox-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    border-bottom: 1px solid hsl(var(--line));
    padding-bottom: 16px;
  }
  .sandbox-header h1 {
    font-size: 1.8rem;
    color: #fff;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: hsl(var(--brand));
  }
  .sandbox-badge {
    background: hsl(var(--brand) / 0.1);
    color: hsl(var(--brand-2));
    border: 1px solid hsl(var(--brand) / 0.25);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .sandbox-grid {
    display: grid;
    grid-template-columns: 1.15fr 1fr 0.85fr;
    gap: 24px;
    margin-bottom: 24px;
  }
  @media (max-width: 1100px) {
    .sandbox-grid {
      grid-template-columns: 1fr;
    }
  }
  
  .panel-card {
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    height: 540px;
    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06);
    overflow: hidden;
  }
  .panel-header {
    background: rgba(15, 23, 42, 0.85);
    padding: 14px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .panel-header h3 {
    font-size: 0.82rem;
    font-weight: 700;
    color: #f8fafc;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .panel-body {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .config-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .input-label {
    font-size: 0.72rem;
    font-weight: 700;
    color: #94a3b8;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  select, textarea, input.txt-input {
    width: 100%;
    background: #030712;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #fff;
    padding: 10px 12px;
    font-family: inherit;
    font-size: 0.85rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  select:focus, textarea:focus, input.txt-input:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
    outline: none;
  }
  .scenario-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    overflow-y: auto;
    max-height: 180px;
  }
  .scenario-card {
    background: rgba(15, 23, 42, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 10px 12px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.2s ease;
    text-align: left;
    color: #cbd5e1;
  }
  .scenario-card:hover {
    background: rgba(30, 41, 59, 0.6);
    border-color: rgba(255, 255, 255, 0.16);
  }
  .scenario-card.active {
    background: rgba(16, 185, 129, 0.12);
    border-color: #10b981;
    color: #fff;
    font-weight: 600;
  }
  .btn-dispatch {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #020617;
    border: none;
    padding: 12px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.92rem;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: auto;
    box-shadow: 0 2px 10px rgba(16, 185, 129, 0.3);
    letter-spacing: -0.01em;
  }
  .btn-dispatch:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
  }
  .btn-dispatch:active {
    transform: translateY(0) scale(0.98);
  }
  .btn-dispatch:disabled {
    background: rgba(30, 41, 59, 0.6);
    color: #64748b;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  /* AI Dispatcher Brain Terminal */
  .terminal {
    background: #030712;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    flex: 1;
    font-family: 'JetBrains Mono', 'IBM Plex Mono', monospace;
    font-size: 0.78rem;
    padding: 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.7);
  }
  .term-line {
    line-height: 1.5;
    white-space: pre-wrap;
    opacity: 0;
    transform: translateY(4px);
    animation: fadeInTerm 0.3s ease forwards;
  }
  @keyframes fadeInTerm {
    to { opacity: 1; transform: translateY(0); }
  }
  .term-line.sys { color: #64748b; }
  .term-line.llm { color: #fbbf24; }
  .term-line.db { color: #fbbf24; }
  .term-line.routing { color: #60a5fa; }
  .term-line.sms { color: #c084fc; }
  .term-line.cal { color: #34d399; }
  .term-line.warn { color: #f87171; }
  
  /* Technician Phone Mockup */
  .phone-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
  }
  .phone {
    width: 280px;
    height: 470px;
    background: #000;
    border: 8px solid #1e2638;
    border-radius: 36px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.75), inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  }
  .phone::before {
    content: '';
    position: absolute;
    top: 6px;
    left: 50%;
    transform: translateX(-50%);
    width: 64px;
    height: 14px;
    background: #000;
    border-radius: 12px;
    z-index: 10;
  }
  .phone-header-bar {
    height: 44px;
    background: #131c31;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f8fafc;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    position: relative;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    transition: background 0.3s;
  }
  .phone-header-bar.active-dave {
    background: #1e3a8a;
  }
  .phone-body {
    flex: 1;
    padding: 14px 12px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: #090e1a;
  }
  .phone-bubble {
    max-width: 85%;
    padding: 8px 12px;
    border-radius: 14px;
    font-size: 0.8rem;
    line-height: 1.35;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    word-break: break-word;
  }
  .phone-bubble.received {
    background: #1e293b;
    color: #f8fafc;
    align-self: flex-start;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-bottom-left-radius: 4px;
  }
  .phone-bubble.sent {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #ffffff;
    align-self: flex-end;
    border-bottom-right-radius: 4px;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
  }
  .phone-bubble.system-note {
    background: transparent;
    color: #94a3b8;
    align-self: center;
    text-align: center;
    font-size: 0.7rem;
    border-radius: 0;
    padding: 4px;
    max-width: 100%;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
    margin: 8px 0;
    width: 100%;
  }
  .phone-footer {
    display: flex;
    flex-direction: column;
    background: #0c0f1d;
    border-top: 1px solid #1f2937;
  }
  .quick-reply-bar {
    padding: 8px;
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: center;
    background: #090e1a;
    min-height: 36px;
  }
  .quick-reply-btn {
    background: rgba(15, 23, 42, 0.85);
    border: 1px solid rgba(16, 185, 129, 0.3);
    color: #34d399;
    padding: 5px 12px;
    border-radius: 9999px;
    font-size: 0.72rem;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.15s ease;
  }
  .quick-reply-btn:hover {
    background: rgba(16, 185, 129, 0.2);
    border-color: #10b981;
    color: #ffffff;
    transform: translateY(-1px);
  }
  .phone-input-bar {
    display: flex;
    padding: 8px;
    gap: 6px;
    background: #0c0f1d;
  }
  .phone-input-bar input {
    flex: 1;
    background: #030712;
    border: 1px solid #374151;
    border-radius: 14px;
    padding: 0 12px;
    color: #f3f4f6;
    font-size: 0.78rem;
    height: 30px;
  }
  .phone-input-bar input:focus {
    outline: none;
    border-color: hsl(var(--brand));
  }
  .phone-input-bar button {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: none;
    color: #020617;
    font-weight: 700;
    padding: 0 14px;
    border-radius: 9999px;
    cursor: pointer;
    font-size: 0.75rem;
    height: 30px;
    transition: all 0.15s ease;
    box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
  }
  .phone-input-bar button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }
  
  /* Calendar Layout */
  .calendar-board {
    background: hsl(var(--surface));
    border: 1px solid hsl(var(--line));
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--shadow-md);
  }
  .calendar-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .calendar-title-row h3 {
    font-size: 1rem;
    color: #fff;
    font-weight: 700;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
  }
  @media (max-width: 768px) {
    .calendar-grid {
      grid-template-columns: 1fr;
    }
  }
  .calendar-day-col {
    background: hsl(var(--surface-2) / 0.3);
    border: 1px solid hsl(var(--line));
    border-radius: var(--radius-md);
    min-height: 220px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .day-col-header {
    background: hsl(var(--surface-2) / 0.8);
    padding: 10px;
    text-align: center;
    font-size: 0.78rem;
    font-weight: 700;
    color: hsl(var(--text-2));
    border-bottom: 1px solid hsl(var(--line));
  }
  .day-col-events {
    flex: 1;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .cal-event {
    background: hsl(var(--surface-3));
    border: 1px solid hsl(var(--line));
    border-left: 3px solid #64748b;
    padding: 8px 10px;
    border-radius: 6px;
    font-size: 0.72rem;
    color: hsl(var(--text-2));
    line-height: 1.3;
  }
  .cal-event.scheduled {
    border-left-color: #10b981;
    background: hsl(var(--surface-3) / 0.5);
  }
  .cal-event.new-job {
    background: linear-gradient(135deg, hsl(var(--brand) / 0.15) 0%, transparent 100%);
    border: 1px solid hsl(var(--brand));
    border-left: 3px solid hsl(var(--brand));
    color: #fff;
    font-weight: 600;
    animation: eventSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    transform: translateY(12px);
    opacity: 0;
  }
  @keyframes eventSlideIn {
    to { opacity: 1; transform: translateY(0); }
  }
  .nav-back {
    color: hsl(var(--text-3));
    text-decoration: none;
    font-size: 0.85rem;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: color 0.2s;
  }
  .nav-back:hover {
    color: hsl(var(--brand));
  }
</style>
</head>
<body>
<header style="border-bottom: 1px solid rgba(255, 255, 255, 0.08); background: rgba(8, 13, 23, 0.85); backdrop-filter: blur(16px); position: sticky; top: 0; z-index: 100;">
  <div style="max-width: 1400px; margin: 0 auto; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 14px 24px;">
    <div style="display: flex; align-items: center; gap: 16px;">
      <a href="/" class="logo" style="display: flex; align-items: center; gap: 10px; text-decoration: none; color: #fff; font-weight: 800; font-size: 1.15rem;">
        <div class="logo-icon" style="width: 32px; height: 32px; color: #10b981; display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
        </div>
        <span>Gainhelm</span>
      </a>
      <span style="display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 9999px; font-size: 0.72rem; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #34d399; letter-spacing: 0.02em;">
        <span style="width: 6px; height: 6px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981;"></span>
        v2.4 SIMULATOR
      </span>
    </div>
    <div style="display: flex; align-items: center; gap: 20px;">
      <a href="/app" style="color: #94a3b8; text-decoration: none; font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; transition: color 0.2s;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Supervision Board
      </a>
      <a href="/" class="nav-back">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back to Home
      </a>
    </div>
  </div>
</header>

<main class="sandbox-container">
  <div class="sandbox-header" style="margin-top: 12px;">
    <h1>
      Gainhelm AI Dispatch Simulator
      <span class="sandbox-badge">Interactive Mode</span>
    </h1>
    <div style="font-size: 0.85rem; color: #94a3b8;">
      Test the AI Dispatcher's decision-making and text message automation in real time.
    </div>
  </div>
  
  <!-- Config section -->
  <div class="config-section" style="background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 18px 22px; margin-bottom: 24px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06);">
    <div class="config-group">
      <div class="config-field">
        <label style="color: #cbd5e1; font-weight: 700; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em;">Primary Trade</label>
        <select id="trade-select" onchange="onTradeChange()">
          <option value="HVAC" ${cleanTrade === 'HVAC' ? 'selected' : ''}>HVAC</option>
          <option value="Plumbing" ${cleanTrade === 'Plumbing' ? 'selected' : ''}>Plumbing</option>
          <option value="Electrical" ${cleanTrade === 'Electrical' ? 'selected' : ''}>Electrical</option>
          <option value="Cleaning" ${cleanTrade === 'Cleaning' ? 'selected' : ''}>Cleaning</option>
          <option value="Landscaping" ${cleanTrade === 'Landscaping' ? 'selected' : ''}>Landscaping</option>
          <option value="Other" ${cleanTrade === 'Other' ? 'selected' : ''}>Other / General</option>
        </select>
      </div>
      <div class="config-field">
        <label style="color: #cbd5e1; font-weight: 700; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em;">Technician Pool Size</label>
        <select id="tech-pool-select">
          <option value="1-5" ${cleanTechCount === '1-5' ? 'selected' : ''}>1–5 techs</option>
          <option value="6-10" ${cleanTechCount === '6-10' ? 'selected' : ''}>6–10 techs</option>
          <option value="11-20" ${cleanTechCount === '11-20' ? 'selected' : ''}>11–20 techs</option>
        </select>
      </div>
      <div class="config-field">
        <label style="color: #cbd5e1; font-weight: 700; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em;">Demo Phone Number</label>
        <input type="text" id="demo-phone-input" class="txt-input" value="${cleanPhone || '+1 (555) 0288'}" placeholder="+1 (555) 0000">
      </div>
    </div>
    <div style="color: #64748b; font-size: 0.8rem; text-align: right; margin-top: 10px; font-family: 'JetBrains Mono', monospace;">
      ${cleanEmail ? `Early Access Lead: <strong style="color: #34d399;">${cleanEmail}</strong>` : 'Direct Public Preview Mode'}
    </div>
  </div>
  
  <div class="sandbox-grid">
    <!-- Panel 1: Customer Input -->
    <div class="panel-card">
      <div class="panel-header">
        <h3>1. Customer Request</h3>
      </div>
      <div class="panel-body">
        <div>
          <div class="input-label">Select Scenario Template</div>
          <div class="scenario-container" id="scenario-list">
            <!-- Dynamically populated -->
          </div>
        </div>
        
        <div class="custom-request-box">
          <div class="input-label">Or edit request description</div>
          <textarea id="request-desc" placeholder="Describe the customer's emergency or maintenance issue..."></textarea>
        </div>
        
        <button id="btn-trigger" class="btn-dispatch" onclick="triggerDispatcher()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Run AI Dispatcher
        </button>
      </div>
    </div>
    
    <!-- Panel 2: AI Dispatcher Brain -->
    <div class="panel-card">
      <div class="panel-header">
        <h3>2. AI Dispatcher Brain</h3>
        <span style="font-size: 0.72rem; color: #10b981; font-family: monospace;">● Live Output</span>
      </div>
      <div class="panel-body" style="padding: 12px;">
        <div class="terminal" id="terminal-feed">
          <div class="term-line sys">[SYSTEM] Ready. Select a scenario on the left and click "Run AI Dispatcher" to begin.</div>
        </div>
      </div>
    </div>
    
    <!-- Panel 3: Technician Phone Mockup -->
    <div class="panel-card">
      <div class="panel-header">
        <h3>3. Technician Phone</h3>
        <span style="font-size: 0.72rem; color: hsl(var(--text-3)); font-weight: 500;">SMS Interface</span>
      </div>
      <div class="panel-body" style="padding: 10px; background: #0b0f19; justify-content: center; align-items: center;">
        <div class="phone">
          <div class="phone-header-bar" id="phone-title">
            💬 No Active Dispatch
          </div>
          <div class="phone-body" id="phone-chat">
            <div class="phone-bubble received">No active dispatch messages yet. Trigger the dispatcher on the left.</div>
          </div>
          <div class="phone-footer">
            <div class="quick-reply-bar" id="phone-quick-replies">
              <!-- Dynamically populated quick replies -->
            </div>
            <form class="phone-input-bar" id="phone-form" onsubmit="sendPhoneMessage(event)">
              <input type="text" id="phone-input" placeholder="Type message..." autocomplete="off" disabled>
              <button type="submit" id="phone-btn-submit" disabled>Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Bottom Calendar -->
  <div class="calendar-board">
    <div class="calendar-title-row">
      <h3>4. Live Dispatch Board & Google Calendar</h3>
      <div style="font-size: 0.75rem; color: hsl(var(--text-3)); display: flex; align-items: center; gap: 8px;">
        <span style="display:inline-block; width: 8px; height: 8px; background: #10b981; border-radius:50%;"></span>
        Google Calendar Sandbox Sync Active
      </div>
    </div>
    
    <div class="calendar-grid">
      <!-- Monday -->
      <div class="calendar-day-col">
        <div class="day-col-header">Monday</div>
        <div class="day-col-events">
          <div class="cal-event scheduled">09:00 - Routine Service</div>
          <div class="cal-event scheduled">13:30 - Maintenance Check</div>
        </div>
      </div>
      <!-- Tuesday -->
      <div class="calendar-day-col">
        <div class="day-col-header">Tuesday</div>
        <div class="day-col-events">
          <div class="cal-event scheduled">10:00 - Inspection</div>
        </div>
      </div>
      <!-- Wednesday (Target for scheduled demo) -->
      <div class="calendar-day-col">
        <div class="day-col-header" style="color: hsl(var(--brand-2)); font-weight: 800;">Wednesday (Today)</div>
        <div class="day-col-events" id="today-events-col">
          <div class="cal-event scheduled">08:30 - Morning Briefing</div>
          <div class="cal-event scheduled">11:00 - Scheduled Audit</div>
          <!-- Scheduled job will slide in here -->
        </div>
      </div>
      <!-- Thursday -->
      <div class="calendar-day-col">
        <div class="day-col-header">Thursday</div>
        <div class="day-col-events">
          <div class="cal-event scheduled">14:00 - Project Walkthrough</div>
        </div>
      </div>
      <!-- Friday -->
      <div class="calendar-day-col">
        <div class="day-col-header">Friday</div>
        <div class="day-col-events">
          <div class="cal-event scheduled">09:30 - Roster Update</div>
          <div class="cal-event scheduled">15:00 - Weekly Wrap-up</div>
        </div>
      </div>
    </div>
  </div>
</main>

<footer>
  <div style="max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 24px;">
    <div>© 2026 Gainhelm. Premium AI dispatcher simulation.</div>
    <div class="footer-links">
      <a href="/">Home</a> · 
      <a href="/field-service-scheduling">Scheduling</a> · 
      <a href="/sitemap.xml">sitemap.xml</a>
    </div>
  </div>
</footer>

<script>
  const scenarios = {
    HVAC: [
      { id: 'hvac_emergency', name: 'Emergency AC Outage', text: 'AC stopped cooling, blowing warm air in 95-degree heat. Server room is overheating and critical equipment is at risk.' },
      { id: 'hvac_routine', name: 'Routine Furnace Maintenance', text: 'Annual heating system maintenance checklist before winter starts.' }
    ],
    Plumbing: [
      { id: 'plumb_burst', name: 'Burst Pipe (Active Flood)', text: 'Pipe burst under kitchen sink, flooding basement. Need immediate water shutoff and leak repair.' },
      { id: 'plumb_clog', name: 'Slow Clogged Drain Snaking', text: 'Bathroom drain snaking check-up for slow draining residential sink.' }
    ],
    Electrical: [
      { id: 'elec_spark', name: 'Sparking Hallway Outlet', text: 'Main outlet is actively sparking and smells like burning plastic.' },
      { id: 'elec_light', name: 'New LED Recessed Fixture Install', text: 'Install 4 recessed smart LED lighting fixtures in kitchen ceiling.' }
    ],
    Cleaning: [
      { id: 'clean_deep', name: 'Deep Move-Out Cleaning', text: 'Deep cleaning service for 3-bedroom apartment post-tenancy.' },
      { id: 'clean_regular', name: 'Bi-Weekly Recurring Cleaning', text: 'Standard home sweep and sanitization check.' }
    ],
    Landscaping: [
      { id: 'land_storm', name: 'Storm Damage Driveway Block', text: 'Felled tree limb blocking access to main driveway after heavy windstorm.' },
      { id: 'land_routine', name: 'Lawn Mow & Garden bed cleanup', text: 'Routine bi-weekly mowing, trimming, and weed removal.' }
    ],
    Other: [
      { id: 'other_lockout', name: 'Emergency Commercial Lockout', text: 'Locked out of business front office, keys left inside the desk drawer. Need immediate entry.' },
      { id: 'other_drywall', name: 'Drywall Hole Repair & Paint', text: 'Patch 12x12 hole in bedroom drywall and match paint.' }
    ]
  };

  let activeScenarioId = '';
  let currentState = 'idle'; // idle, dispatching, waiting_sarah, escalated, waiting_dave, completed
  let currentTrade = '${cleanTrade}';
  let activeTech = '';

  function onTradeChange() {
    const tradeSelect = document.getElementById('trade-select');
    currentTrade = tradeSelect.value;
    populateScenarios();
  }

  function populateScenarios() {
    const list = document.getElementById('scenario-list');
    list.innerHTML = '';
    const tradeScenarios = scenarios[currentTrade] || scenarios['Other'];
    
    tradeScenarios.forEach((sc, i) => {
      const card = document.createElement('div');
      card.className = 'scenario-card' + (i === 0 ? ' active' : '');
      if (i === 0) {
        activeScenarioId = sc.id;
        document.getElementById('request-desc').value = sc.text;
      }
      card.innerHTML = '<strong>' + sc.name + '</strong>';
      card.onclick = () => selectScenario(sc.id, sc.text, card);
      list.appendChild(card);
    });
  }

  function selectScenario(id, text, cardElement) {
    if (currentState === 'dispatching' || currentState.startsWith('waiting_')) return;
    activeScenarioId = id;
    document.getElementById('request-desc').value = text;
    
    const cards = document.querySelectorAll('.scenario-card');
    cards.forEach(c => c.classList.remove('active'));
    cardElement.classList.add('active');
  }

  function appendTerminalLine(text, styleClass) {
    const term = document.getElementById('terminal-feed');
    const line = document.createElement('div');
    line.className = 'term-line ' + styleClass;
    
    // Prefix with timestamp
    const now = new Date();
    const timeStr = '[' + now.toTimeString().split(' ')[0] + ']';
    line.textContent = timeStr + ' ' + text;
    
    term.appendChild(line);
    term.scrollTop = term.scrollHeight;
  }

  function appendPhoneMessage(text, sender) {
    const chat = document.getElementById('phone-chat');
    const bubble = document.createElement('div');
    bubble.className = 'phone-bubble ' + sender;
    bubble.innerHTML = text;
    chat.appendChild(bubble);
    chat.scrollTop = chat.scrollHeight;
  }

  function setPhoneHeader(text, isDave = false) {
    const header = document.getElementById('phone-title');
    header.textContent = text;
    if (isDave) {
      header.classList.add('active-dave');
    } else {
      header.classList.remove('active-dave');
    }
  }

  function updateQuickReplies(options) {
    const container = document.getElementById('phone-quick-replies');
    container.innerHTML = '';
    
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'quick-reply-btn';
      btn.textContent = opt.label;
      btn.onclick = () => handleQuickReply(opt.value);
      container.appendChild(btn);
    });
  }

  function disableInputs(disabled) {
    document.getElementById('btn-trigger').disabled = disabled;
    document.getElementById('trade-select').disabled = disabled;
    document.getElementById('tech-pool-select').disabled = disabled;
    document.getElementById('demo-phone-input').disabled = disabled;
    document.getElementById('request-desc').disabled = disabled;
  }

  async function triggerDispatcher() {
    const desc = document.getElementById('request-desc').value.trim();
    if (!desc) return;
    
    currentState = 'dispatching';
    disableInputs(true);
    
    // Reset terminal & phone mockup
    document.getElementById('terminal-feed').innerHTML = '';
    document.getElementById('phone-chat').innerHTML = '';
    document.getElementById('phone-quick-replies').innerHTML = '';
    document.getElementById('phone-input').disabled = true;
    document.getElementById('phone-btn-submit').disabled = true;
    
    appendTerminalLine('[SYSTEM] Initiating agentic dispatch loop...', 'sys');
    
    await delay(100);
    appendTerminalLine('[LLM] Analyzing incoming request: "' + desc + '"', 'llm');
    
    await delay(150);
    const urgency = desc.toLowerCase().includes('emergency') || desc.toLowerCase().includes('burst') || desc.toLowerCase().includes('spark') || desc.toLowerCase().includes('lockout') || desc.toLowerCase().includes('outage') ? 'CRITICAL' : 'ROUTINE';
    appendTerminalLine('[LLM] Intent classified: Trade = ' + currentTrade + ', Urgency = ' + urgency, 'llm');
    
    await delay(100);
    appendTerminalLine('[DB] Querying technician pool for active ' + currentTrade + ' contractors...', 'db');
    
    await delay(150);
    appendTerminalLine('[DB] Candidate Match: Sarah Connor (Primary), David Miller (Secondary).', 'db');
    
    await delay(100);
    appendTerminalLine('[ROUTING] Evaluating shift schedule and distance vectors...', 'routing');
    
    await delay(100);
    appendTerminalLine('[ROUTING] Match Found: Sarah Connor (+1 555-0288) is On Duty and standard shift matches.', 'routing');
    
    await delay(150);
    appendTerminalLine('[SMS] Dispatched dispatch offer to Sarah Connor (+1 555-0288)...', 'sms');
    
    await delay(100);
    activeTech = 'Sarah Connor';
    setPhoneHeader('💬 ' + activeTech + ' (Tech 1)', false);
    
    appendPhoneMessage('<strong>Gainhelm Dispatcher:</strong><br>New emergency ' + currentTrade.toLowerCase() + ' request at 123 Main St. Pays $150. Reply <strong>YES</strong> to accept, or <strong>BUSY</strong> to decline.', 'received');
    
    document.getElementById('phone-input').disabled = false;
    document.getElementById('phone-btn-submit').disabled = false;
    
    updateQuickReplies([
      { label: 'Accept Job (YES)', value: 'YES' },
      { label: 'Decline Job (BUSY)', value: 'BUSY' },
      { label: 'Running late (15 mins)', value: 'LATE' }
    ]);
    
    currentState = 'waiting_sarah';
  }

  function handleQuickReply(value) {
    document.getElementById('phone-input').value = value;
    sendPhoneMessage(null);
  }

  async function sendPhoneMessage(event) {
    if (event) event.preventDefault();
    
    const input = document.getElementById('phone-input');
    const text = input.value.trim();
    if (!text) return;
    
    input.value = '';
    appendPhoneMessage(text, 'sent');
    updateQuickReplies([]);
    document.getElementById('phone-input').disabled = true;
    document.getElementById('phone-btn-submit').disabled = true;
    
    const upperText = text.toUpperCase();
    
    if (currentState === 'waiting_sarah') {
      appendTerminalLine('[SMS] Received reply from Sarah Connor: "' + text + '"', 'sms');
      
      await delay(150);
      if (upperText === 'YES') {
        appendPhoneMessage('<strong>Gainhelm Dispatcher:</strong><br>Job confirmed! Scheduled in Google Calendar. Navigate to 123 Main St: <a href="https://maps.google.com/?q=123+Main+St" target="_blank" style="color: #fbbf24;">maps.google.com</a>', 'received');
        appendTerminalLine('[CALENDAR] Booking job to Google Calendar: "Emergency ' + currentTrade + ' - Sarah Connor" at 123 Main St.', 'cal');
        await delay(100);
        appendTerminalLine('[SYSTEM] Dispatch cycle complete. Roster matches updated.', 'sys');
        addCalendarEvent('Sarah Connor');
        currentState = 'completed';
        disableInputs(false);
      } else if (upperText === 'BUSY' || upperText === 'DECLINE') {
        appendPhoneMessage('<strong>Gainhelm Dispatcher:</strong><br>Understood. Re-routing dispatch offer.', 'received');
        appendTerminalLine('[ROUTING] Technician Sarah Connor declined (Reason: Busy). Removing from candidates.', 'routing');
        
        await delay(150);
        appendTerminalLine('[ROUTING] Next candidate: David Miller (Night Shift, On Duty, 2.3 miles away).', 'routing');
        await delay(100);
        appendTerminalLine('[SMS] Dispatched dispatch offer to David Miller (+1 555-0999)...', 'sms');
        
        await delay(100);
        activeTech = 'David Miller';
        appendPhoneMessage('---- SWITCH TO DAVID MILLER ----', 'system-note');
        setPhoneHeader('💬 ' + activeTech + ' (Tech 2)', true);
        appendPhoneMessage('<strong>Gainhelm Dispatcher:</strong><br>New emergency ' + currentTrade.toLowerCase() + ' request at 123 Main St. Pays $150. Reply <strong>YES</strong> to accept.', 'received');
        
        document.getElementById('phone-input').disabled = false;
        document.getElementById('phone-btn-submit').disabled = false;
        updateQuickReplies([
          { label: 'Accept Job (YES)', value: 'YES' }
        ]);
        currentState = 'waiting_dave';
      } else {
        appendPhoneMessage('<strong>Gainhelm Dispatcher:</strong><br>Sorry, I did not catch that. Reply YES to accept the dispatch, or BUSY to decline.', 'received');
        document.getElementById('phone-input').disabled = false;
        document.getElementById('phone-btn-submit').disabled = false;
        updateQuickReplies([
          { label: 'Accept Job (YES)', value: 'YES' },
          { label: 'Decline Job (BUSY)', value: 'BUSY' }
        ]);
      }
    } else if (currentState === 'waiting_dave') {
      appendTerminalLine('[SMS] Received reply from David Miller: "' + text + '"', 'sms');
      
      await delay(150);
      if (upperText === 'YES') {
        appendPhoneMessage('<strong>Gainhelm Dispatcher:</strong><br>Job confirmed! Scheduled in Google Calendar. Navigate to 123 Main St: <a href="https://maps.google.com/?q=123+Main+St" target="_blank" style="color: #fbbf24;">maps.google.com</a>', 'received');
        appendTerminalLine('[CALENDAR] Booking job to Google Calendar: "Emergency ' + currentTrade + ' - David Miller" at 123 Main St.', 'cal');
        await delay(100);
        appendTerminalLine('[SYSTEM] Dispatch cycle complete. Roster matches updated.', 'sys');
        addCalendarEvent('David Miller');
        currentState = 'completed';
        disableInputs(false);
      } else {
        appendPhoneMessage('<strong>Gainhelm Dispatcher:</strong><br>Please reply YES to accept the scheduled dispatch offer.', 'received');
        document.getElementById('phone-input').disabled = false;
        document.getElementById('phone-btn-submit').disabled = false;
        updateQuickReplies([
          { label: 'Accept Job (YES)', value: 'YES' }
        ]);
      }
    }
  }

  function addCalendarEvent(techName) {
    const col = document.getElementById('today-events-col');
    const event = document.createElement('div');
    event.className = 'cal-event new-job';
    event.innerHTML = '<strong>14:15 - Emergency ' + currentTrade + '</strong><br>123 Main St (' + techName + ')';
    col.appendChild(event);
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Initialize
  onTradeChange();
</script>
</body>
</html>`;
};
