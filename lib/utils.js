/**
 * Shared Utility Functions for Gainhelm Lead Management and Intent Analysis
 */

/**
 * Computes intent score (0-100) based on title and snippet text content.
 * @param {string} [title]
 * @param {string} [snippet]
 * @returns {number}
 */
export function computeIntentScore(title, snippet) {
  const text = `${title || ''} ${snippet || ''}`.toLowerCase();
  let score = 50;

  if (text.includes('scheduling') || text.includes('schedule')) {
    score += 15;
  }
  if (text.includes('dispatch') || text.includes('dispatcher')) {
    score += 15;
  }

  const competitors = ['jobber', 'servicetitan', 'housecallpro', 'fieldedge', 'buildops'];
  if (competitors.some(comp => text.includes(comp))) {
    score += 20;
  }

  const painWords = ['phone tag', 'spreadsheet', 'lost track', 'mess', 'calendar'];
  if (painWords.some(pain => text.includes(pain))) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Drafts suggested sales outreach reply tailored to title and snippet content.
 * @param {string} [title]
 * @param {string} [snippet]
 * @returns {string}
 */
export function draftSuggestedReply(title, snippet) {
  const text = `${title || ''} ${snippet || ''}`.toLowerCase();
  const isHvacPlumbingElectrical = [
    'hvac',
    'plumbing',
    'plumber',
    'electrical',
    'electrician',
  ].some(keyword => text.includes(keyword));

  if (isHvacPlumbingElectrical) {
    return `Hey! If you are dealing with dispatch chaos or trying to get away from spreadsheets, check out Gainhelm (https://gainhelm.com). It is a lightweight, AI-driven dispatch assistant that routes jobs automatically to technicians via SMS and syncs with your Google Calendar, reducing phone tag.`;
  } else {
    return `We had similar scheduling headaches before trying Gainhelm (https://gainhelm.com). It acts as an automated dispatcher routing jobs via SMS and keeping technicians updated instantly. Really helps cut down on phone tag and manual spreadsheets.`;
  }
}

/**
 * Escapes HTML characters in string to prevent XSS.
 * @param {any} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Normalizes URL path.
 * @param {string} url
 * @returns {string}
 */
export function normalizePath(url) {
  return new URL(url, 'http://localhost').pathname.replace(/\/+$/, '') || '/';
}

const stepEmojis = ['🤖', '📥', '💬', '📱', '✅', '⚠️'];
export function stripLeadingStepEmoji(text) {
  const matched = stepEmojis.find(e => text.startsWith(e));
  return matched ? text.slice(matched.length).replace(/^\s*/, '') : text;
}
