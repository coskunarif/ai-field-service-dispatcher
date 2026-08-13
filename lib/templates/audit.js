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

      return `
      <div style="background: hsl(var(--surface-2) / 0.4); border: 1px solid hsl(var(--line)); border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid hsl(var(--line) / 0.5); padding-bottom: 6px;">
          <span style="font-size: 0.72rem; color: hsl(var(--text-3)); font-family: 'IBM Plex Mono', monospace;">📅 ${timeStr}</span>
          <span style="padding: 2px 8px; border-radius: 6px; background: ${statusColor}1A; color: ${statusColor}; border: 1px solid ${statusColor}33; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">${statusText}</span>
        </div>
        <div style="font-size: 0.84rem; color: #fff; line-height: 1.4;">
          🏢 <strong>Job:</strong> "${escapeHtml(l.job_description)}" <span class="brand-chip" style="font-size: 0.7rem; padding: 1px 5px; background: hsl(var(--brand) / 0.1); color: hsl(var(--brand-2)); border: 1px solid hsl(var(--brand) / 0.25); border-radius: 4px;">${escapeHtml(l.trade)}</span>
        </div>
        <div style="font-size: 0.8rem; color: hsl(var(--text-2));">
          👤 <strong>Dispatched to:</strong> ${matchedTechStr}
        </div>
        <div style="font-size: 0.8rem; color: hsl(var(--text-3));">
          ⏱️ <strong>Shift Time:</strong> ${escapeHtml(l.simulated_time)}
        </div>
        ${
          l.distance_miles !== null && l.distance_miles !== undefined
            ? `
        <div style="font-size: 0.8rem; color: hsl(var(--text-3));">
          📍 <strong>Route Info:</strong> ${l.distance_miles} miles, ${l.duration_mins} mins (${l.traffic_multiplier}x traffic)
        </div>
        `
            : ''
        }
        <div>
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
            <button type="button" onclick="document.getElementById('audit-details-${logId}').style.display = document.getElementById('audit-details-${logId}').style.display === 'none' ? 'block' : 'none'" 
                    class="preset-btn" style="margin: 0; padding: 4px 10px; font-size: 0.72rem; background: hsl(var(--surface-3)); border: 1px solid hsl(var(--line)); border-radius: 6px; cursor: pointer; color: hsl(var(--brand-2)); font-weight: bold;">
              Show Agent Reasoning Trail
            </button>
            ${
              l.status === 'accepted' || l.status === 'manually_assigned'
                ? `
            <a href="/app/track/${logId}" target="_blank" class="preset-btn" style="margin: 0; padding: 4px 10px; font-size: 0.72rem; background: hsl(var(--brand) / 0.2); border: 1px solid hsl(var(--brand)); border-radius: 6px; text-decoration: none; display: inline-block; color: hsl(var(--brand-2)); font-weight: bold; text-align: center;">
              Track Live Route
            </a>
            `
                : ''
            }
          </div>
          <div id="audit-details-${logId}" style="display: none; margin-top: 8px; background: hsl(var(--bg) / 0.8); border: 1px solid hsl(var(--line)); border-radius: 8px; padding: 10px; max-height: 200px; overflow-y: auto; scrollbar-width: none;">
            ${stepsHtml}
          </div>
        </div>
      </div>
    `;
    })
    .join('');
};
