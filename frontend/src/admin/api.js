const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const origin = (process.env.REACT_APP_ADMIN_API_URL || (isLocal ? `http://${window.location.hostname}:8000` : '')).replace(/\/$/, '');

export async function adminRequest(path, options = {}) {
  let response;
  try { response = await fetch(`${origin}/api/admin${path}`, {
    ...options,
    credentials: 'include',
    cache: 'no-store',
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
  }); } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Unable to connect. Please try again.');
  }
  if (!response.ok) {
    const error = new Error(response.status === 429 ? 'Too many sign-in attempts. Please try again in ten minutes.'
      : response.status === 503 ? 'This service is temporarily unavailable. Please try again later.'
        : response.status === 404 ? 'This record could not be found.' : 'Unable to complete this request. Please try again.');
    error.status = response.status;
    throw error;
  }
  try { return await response.json(); }
  catch { throw new Error('Unable to load this information. Please try again.'); }
}

export function safeLink(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

export function dateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium', timeStyle: 'short',
  }).format(date);
}

const labels = {
  sent: 'Sent', accepted: 'Accepted by provider', logged_unverified: 'Logged · unverified',
  delivered: 'Delivered', delivery_delayed: 'Delivery delayed', scheduled: 'Scheduled',
  bounced: 'Bounced', complained: 'Spam complaint', failed: 'Failed', suppressed: 'Suppressed',
  opened: 'Recorded open', clicked: 'Recorded click',
};
export const statusLabel = value => labels[value?.replace('email.', '')] || 'Unknown';

export function criteriaSummary(criteria = {}) {
  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  const range = (min, max, format = String) => min && max ? `${format(min)}–${format(max)}` : min ? `${format(min)}+` : max ? `Up to ${format(max)}` : null;
  return [
    criteria.mls_number && `MLS ${criteria.mls_number}`,
    (Array.isArray(criteria.cities) ? criteria.cities.join(', ') : '') || criteria.city,
    criteria.search && `Search: ${criteria.search}`,
    criteria.propertyType,
    range(criteria.minPrice, criteria.maxPrice, money),
    criteria.minBeds && `${criteria.minBeds}+ beds`, criteria.minBaths && `${criteria.minBaths}+ baths`,
    (criteria.minSqft || criteria.maxSqft) && `${range(criteria.minSqft, criteria.maxSqft)} sq ft`,
    (criteria.minAcres || criteria.maxAcres) && `${range(criteria.minAcres, criteria.maxAcres)} acres`,
  ].filter(Boolean).join(' · ') || 'All eligible listings';
}
