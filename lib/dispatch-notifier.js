/**
 * Dispatch Notifier for Gainhelm Emergency Lead Arbitrage & SMS Routing
 * Integrates zero-dependency Twilio REST API and webhook forwarders.
 */

/**
 * Normalizes US phone numbers into E.164 standard (+1XXXXXXXXXX).
 * @param {string} phone
 * @returns {string|null}
 */
export function formatE164Phone(phone) {
  if (!phone || typeof phone !== 'string') return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  return null;
}

/**
 * Sends SMS via Twilio REST API using native fetch.
 * Gracefully skips if credentials are not configured.
 * @param {Object} params
 * @param {string} params.to
 * @param {string} params.body
 * @param {Object} [params.env]
 * @returns {Promise<{ ok: boolean, sid?: string, skipped?: boolean, reason?: string, error?: string }>}
 */
export async function sendTwilioSms({ to, body, env = process.env }) {
  const accountSid = env.TWILIO_ACCOUNT_SID;
  const authToken = env.TWILIO_AUTH_TOKEN;
  const fromNumber = env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return { ok: false, skipped: true, reason: 'Twilio credentials not configured' };
  }

  const formattedTo = formatE164Phone(to);
  if (!formattedTo) {
    return { ok: false, error: `Invalid recipient phone number: ${to}` };
  }

  try {
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const formParams = new URLSearchParams({
      To: formattedTo,
      From: fromNumber,
      Body: body,
    });

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formParams.toString(),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data.message || `Twilio HTTP ${res.status}` };
    }

    return { ok: true, sid: data.sid };
  } catch (err) {
    return { ok: false, error: err.message || 'Twilio request failed' };
  }
}

/**
 * Forwards lead payload to configured webhook (Zapier, Make, Slack, or local CRM).
 * @param {Object} params
 * @param {Object} params.payload
 * @param {Object} [params.env]
 * @returns {Promise<{ ok: boolean, skipped?: boolean, error?: string }>}
 */
export async function forwardLeadWebhook({ payload, env = process.env }) {
  const webhookUrl = env.LEAD_WEBHOOK_URL;
  if (!webhookUrl) {
    return { ok: false, skipped: true, reason: 'LEAD_WEBHOOK_URL not configured' };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { ok: false, error: `Webhook returned HTTP ${res.status}` };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message || 'Webhook post failed' };
  }
}

/**
 * Handles all outbound emergency notifications (Customer SMS, Contractor Alert, Webhook).
 * @param {Object} params
 * @param {Object} params.dispatch
 * @param {Object} [params.env]
 * @returns {Promise<{ customerSms: Object, contractorAlert: Object, webhook: Object }>}
 */
export async function notifyEmergencyDispatch({ dispatch, env = process.env }) {
  const customerPhone = dispatch.phone;
  const techName = dispatch.assignedTech || 'On-Duty Specialist';
  const trackingUrl = dispatch.trackingUrl || `/app/track/${dispatch.id}`;
  const fullTrackingUrl = `https://gainhelm.com${trackingUrl}`;

  // 1. Customer notification
  const customerBody = `Gainhelm Alert: Technician ${techName} has been dispatched. ETA: ~${dispatch.etaMins || 22} mins. Live GPS route & vehicle tracking: ${fullTrackingUrl}`;
  const customerSms = await sendTwilioSms({
    to: customerPhone,
    body: customerBody,
    env,
  });

  // 2. Contractor / Dispatcher notification
  let contractorAlert = { ok: false, skipped: true, reason: 'No contractor alert phone set' };
  const alertPhone = env.CONTRACTOR_ALERT_PHONE || env.DISPATCHER_ALERT_PHONE;
  if (alertPhone) {
    const alertBody = `🚨 NEW EMERGENCY DISPATCH: ${String(dispatch.trade || '').toUpperCase()} (${dispatch.zipCode}). Issue: ${dispatch.issue || 'Repair'}. Customer: ${customerPhone}. Address: ${dispatch.address || 'On file'}. Claim ticket: ${fullTrackingUrl}`;
    contractorAlert = await sendTwilioSms({
      to: alertPhone,
      body: alertBody,
      env,
    });
  }

  // 3. Webhook forwarding
  const webhookPayload = {
    event: 'emergency_dispatch_created',
    id: dispatch.id,
    trade: dispatch.trade,
    issue: dispatch.issue,
    urgency: dispatch.urgency,
    zipCode: dispatch.zipCode,
    phone: dispatch.phone,
    address: dispatch.address,
    notes: dispatch.notes,
    minCost: dispatch.minCost,
    maxCost: dispatch.maxCost,
    etaMins: dispatch.etaMins,
    assignedTech: dispatch.assignedTech,
    trackingUrl: fullTrackingUrl,
    timestamp: new Date().toISOString(),
  };

  const webhook = await forwardLeadWebhook({
    payload: webhookPayload,
    env,
  });

  return {
    customerSms,
    contractorAlert,
    webhook,
  };
}
