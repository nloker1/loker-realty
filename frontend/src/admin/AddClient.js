import React, { useState } from 'react';
import { adminRequest } from './api';

export default function AddClient({ csrfToken, readOnly, onCreated, onCancel, onExpired }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    if (readOnly || busy) return;
    setBusy(true); setError('');
    try {
      const client = await adminRequest('/clients', {
        method: 'POST', headers: { 'X-CSRF-Token': csrfToken },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      onCreated(client);
    } catch (failure) {
      if (failure.status === 401) onExpired();
      else setError(failure.status === 422 ? 'Enter a name and a valid email address.' : failure.message);
    } finally { setBusy(false); }
  }
  return <section className="admin-search-editor" aria-label="Add client">
    <h2>Add a new client</h2>
    <p>Add their contact details first, then create a saved search on their profile. This does not send an email.</p>
    {readOnly && <p className="admin-note">Read-only preview: adding clients is disabled. Use the fictional local database to test saving.</p>}
    <form onSubmit={submit}>
      <fieldset className="admin-editor-grid" disabled={busy || readOnly}>
        <label>Name<input autoFocus autoComplete="name" required maxLength={200} value={name} onChange={event => setName(event.target.value)} /></label>
        <label>Email address<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} /></label>
      </fieldset>
      {error && <p className="admin-error" role="alert">{error}</p>}
      <div className="admin-editor-actions">
        <button type="submit" disabled={busy || readOnly}>{busy ? 'Adding client…' : 'Create client'}</button>
        <button type="button" disabled={busy} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  </section>;
}
