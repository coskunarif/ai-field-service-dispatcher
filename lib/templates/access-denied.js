import { escapeHtml } from '../utils.js';

export const renderAccessDeniedPage = email => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Access Restricted - Gainhelm</title>
<link rel="stylesheet" href="/styles.css?v=20260604-redesign">
<style>
  body {
    background:
      radial-gradient(1000px 500px at 50% -10%, hsl(var(--brand) / 0.08), transparent 50%),
      linear-gradient(180deg, hsl(var(--bg)) 0%, hsl(var(--bg-2)) 100%);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .denied-container {
    max-width: 500px;
    width: 100%;
    padding: 40px;
    background: hsl(var(--surface) / 0.85);
    backdrop-filter: blur(16px);
    border: 1px solid #ef4444;
    border-radius: 24px;
    box-shadow: 0 0 30px rgba(239, 68, 68, 0.15);
    text-align: center;
  }
  .denied-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 20px auto;
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .denied-title {
    color: #fff;
    font-size: 1.6rem;
    font-weight: 700;
    margin-bottom: 12px;
  }
  .denied-desc {
    color: hsl(var(--text-3));
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 28px;
  }
  .denied-email {
    font-family: 'IBM Plex Mono', monospace;
    background: hsl(var(--surface-3));
    padding: 4px 10px;
    border-radius: 6px;
    color: hsl(var(--brand-2));
    border: 1px solid hsl(var(--line));
    word-break: break-all;
  }
</style>
</head>
<body>
  <div class="denied-container">
    <div class="denied-icon">
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
    </div>
    <h1 class="denied-title">Access Restricted</h1>
    <p class="denied-desc">
      The email <span class="denied-email">${escapeHtml(email)}</span> is not registered on the early-access waitlist. Please register to access the configuration setup.
    </p>
    <a href="/" class="cta-primary" style="display: inline-block; padding: 12px 24px; border-radius: 10px; font-weight: bold; cursor: pointer;">Return to Join Waitlist</a>
  </div>
</body>
</html>`;
};
