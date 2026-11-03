import React, { useState } from 'react';
import { adminRequest } from './api';

const fields = [
  ['minPrice', 'Minimum price', 1], ['maxPrice', 'Maximum price', 1],
  ['minBeds', 'Minimum bedrooms', 1], ['minBaths', 'Minimum bathrooms', 0.5],
  ['minSqft', 'Minimum square feet', 1], ['maxSqft', 'Maximum square feet', 1],
  ['minAcres', 'Minimum acres', 0.01], ['maxAcres', 'Maximum acres', 0.01],
];

export default function SavedSearchEditor({ clientId, search, csrfToken, readOnly, onClose, onSaved, onExpired }) {
  const [values, setValues] = useState(search?.criteria || {});
  const [cities, setCities] = useState((search?.criteria.cities || []).join(', '));
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const filters = () => ({
    ...Object.fromEntries(fields.filter(([key]) => values[key] !== undefined && values[key] !== '').map(([key]) => [key, Number(values[key])])),
    cities: cities.split(',').map(city => city.trim()).filter(Boolean),
    ...(values.propertyType?.trim() ? { propertyType: values.propertyType.trim() } : {}),
  });
  function change(key, value) { setValues(previous => ({ ...previous, [key]: value })); setPreview(null); setError(''); }
  async function request(save, page = 1) {
    setBusy(true); setError('');
    try {
      const path = save ? `/clients/${clientId}/searches${search ? `/${search.id}` : ''}` : `/clients/${clientId}/search-preview?page=${page}`;
      const data = await adminRequest(path, {
        method: save && search ? 'PUT' : 'POST',
        headers: { 'X-CSRF-Token': csrfToken }, body: JSON.stringify({ criteria: filters() }),
      });
      if (save) onSaved(); else setPreview(data);
    } catch (failure) {
      if (failure.status === 401) onExpired();
      else setError(failure.message);
    } finally { setBusy(false); }
  }
  return <section className="admin-search-editor" aria-label="Saved search editor">
    <h3>{search ? 'Edit listing search' : 'New listing search'}</h3>
    <p>Choose matching criteria. New searches and edits are saved paused, ready for review.</p>
    {readOnly && <p className="admin-note">Read-only preview: try filters and preview matching homes. Saving is disabled.</p>}
    <form onSubmit={event => { event.preventDefault(); request(false); }}>
      <fieldset disabled={busy} className="admin-editor-grid">
        <label className="admin-editor-wide">Cities, separated by commas
          <input value={cities} maxLength={5000} placeholder="Hood River, White Salmon" onChange={event => { setCities(event.target.value); setPreview(null); }} />
        </label>
        {fields.map(([key, label, step]) => <label key={key}>{label}
          <input type="number" min="0" step={step} value={values[key] ?? ''} onChange={event => change(key, event.target.value)} />
        </label>)}
        <label className="admin-editor-wide">Property type (exact listing value; blank for all)
          <input list="admin-property-types" maxLength={100} value={values.propertyType || ''} onChange={event => change('propertyType', event.target.value)} />
          <datalist id="admin-property-types"><option value="Residential" /><option value="Land" /><option value="MultiFamily" /></datalist>
        </label>
      </fieldset>
      {error && <p className="admin-error" role="alert">{error}</p>}
      <div className="admin-editor-actions">
        <button disabled={busy} type="submit">{busy ? 'Working…' : 'Preview matching homes'}</button>
        <button type="button" disabled={busy || readOnly || !preview} onClick={event => { if (event.currentTarget.form.reportValidity()) request(true); }}>Save paused search</button>
        <button type="button" disabled={busy} onClick={onClose}>Cancel</button>
      </div>
      <p className="admin-muted">Preview your filters before saving. Blank filters include all active, published homes.</p>
    </form>
    {preview && <div aria-live="polite">
      <h4>{preview.total} matching {preview.total === 1 ? 'home' : 'homes'}</h4>
      <p className="admin-note">{preview.note}</p>
      <ul className="admin-preview-list">{preview.items.map(listing => <li key={listing.id}>
        <strong>{listing.address}</strong><span>{listing.city} · {listing.price == null ? 'Price unavailable' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(listing.price)} · {listing.beds ?? '—'} beds · {listing.baths ?? '—'} baths</span>
      </li>)}</ul>
      {preview.pages > 1 && <nav className="admin-pagination" aria-label="Matching homes pages">
        <button disabled={busy || preview.page <= 1} onClick={() => request(false, preview.page - 1)}>Previous homes</button>
        <span>Page {preview.page} of {preview.pages}</span>
        <button disabled={busy || preview.page >= preview.pages} onClick={() => request(false, preview.page + 1)}>Next homes</button>
      </nav>}
    </div>}
  </section>;
}
