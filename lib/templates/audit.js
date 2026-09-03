import { escapeHtml, stripLeadingStepEmoji } from '../utils.js';

export const renderAuditTrailHtml = logs => {
  if (!logs || logs.length === 0) {
    return `<div style="text-align: center; color: hsl(var(--text-3)); font-style: italic; font-size: 0.85rem; padding: 20px 0;">No dispatch runs recorded yet. Run a simulation to log history.</div>`;
  }

  return logs
    .map(l => {
      const timeStr = new Date(l.created_at).toLocaleString();
      let statusColor = '#ef4444'; // Red for escalated
      let statusText = 'Escalated';
      if (l.status === 'accepted') {
        statusColor = '#10b981'; // Green
        statusText = 'Accepted';
      } else if (l.status === 'manually_assigned') {
        statusColor = '#10b981'; // Green
        statusText = 'Manually Assigned';
      } else if (l.status === 'declined') {
        statusColor = '#f59e0b'; // Amber
        statusText = 'Declined';
      }

      const matchedTechStr = l.dispatched_to_name
        ? `${escapeHtml(l.dispatched_to_name)} (${escapeHtml(l.dispatched_to_phone)})`
        : 'None (System Escalation)';
      const logId = l.id;

      let steps = [];
      try {
        steps = JSON.parse(l.step_logs);
      } catch {
        steps = [];
      }

      const stepsHtml = steps
        .map(s => {
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

          return `<div style="font-size: 0.76rem; color: hsl(var(--text-2)); padding: 4px 0; border-bottom: 1px solid hsl(var(--line) / 0.3); display: flex; gap: 6px;">
        <span>${icon}</span>
        <span>${cleanText}</span>
      </div>`;
        })
        .join('');

      const calIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 4px; color: #64748b;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
      const jobIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 4px; color: #64748b;"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
      const userIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 4px; color: #64748b;"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
      const clockIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 4px; color: #64748b;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
      const mapPinIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 4px; color: #64748b;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;

      return `
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05); transition: all 0.2s ease;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.06); padding-bottom: 8px;">
          <span style="font-size: 0.72rem; color: #94a3b8; font-family: 'JetBrains Mono', monospace;">${calIcon}${timeStr}</span>
          <span style="padding: 2px 8px; border-radius: 9999px; background: ${statusColor}1A; color: ${statusColor}; border: 1px solid ${statusColor}33; font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'JetBrains Mono', monospace;">${statusText}</span>
        </div>
        <div style="font-size: 0.86rem; color: #f8fafc; line-height: 1.4;">
          ${jobIcon}<strong>Job:</strong> "${escapeHtml(l.job_description)}" <span class="brand-chip" style="font-size: 0.68rem; padding: 1px 6px; background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 4px; font-weight: 600;">${escapeHtml(l.trade)}</span>
        </div>
        <div style="font-size: 0.8rem; color: #cbd5e1;">
          ${userIcon}<strong>Dispatched to:</strong> <span style="font-family: 'JetBrains Mono', monospace;">${matchedTechStr}</span>
        </div>
        <div style="font-size: 0.8rem; color: #94a3b8;">
          ${clockIcon}<strong>Shift Time:</strong> ${escapeHtml(l.simulated_time)}
        </div>
        ${
          l.distance_miles !== null && l.distance_miles !== undefined
            ? `
        <div style="font-size: 0.8rem; color: #94a3b8;">
          ${mapPinIcon}<strong>Route Info:</strong> <span style="font-family: 'JetBrains Mono', monospace;">${l.distance_miles} miles, ${l.duration_mins} mins (${l.traffic_multiplier}x traffic)</span>
        </div>
        `
            : ''
        }
        <div style="margin-top: 4px;">
          <div style="display: flex; gap: 8px; align-items: center;">
            <button type="button" onclick="document.getElementById('audit-details-${logId}').style.display = document.getElementById('audit-details-${logId}').style.display === 'none' ? 'block' : 'none'" 
                    class="preset-btn" style="margin: 0; padding: 4px 10px; font-size: 0.72rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 6px; cursor: pointer; color: #cbd5e1; font-weight: 600; transition: all 0.15s ease;">
              Show Agent Reasoning Trail
            </button>
            ${
              l.status === 'accepted' || l.status === 'manually_assigned'
                ? `
            <a href="/app/track/${logId}" target="_blank" class="preset-btn" style="margin: 0; padding: 4px 10px; font-size: 0.72rem; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 6px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; color: #34d399; font-weight: 600; text-align: center; transition: all 0.15s ease;">
              Track Live Route
            </a>
            `
                : ''
            }
          </div>
          <div id="audit-details-${logId}" style="display: none; margin-top: 10px; background: #070b14; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 12px; max-height: 200px; overflow-y: auto; scrollbar-width: none; font-family: 'JetBrains Mono', monospace;">
            ${stepsHtml}
          </div>
        </div>
      </div>
    `;
    })
    .join('');
};
