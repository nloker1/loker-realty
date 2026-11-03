import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { adminRequest, criteriaSummary, dateTime, friendlyTime, safeLink, statusLabel } from './api';
import './AdminActivity.css';
import SavedSearchEditor from './SavedSearchEditor';
import AddClient from './AddClient';

const Session = createContext();
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

function useResource(path) {
  const { expired } = useContext(Session);
  const [version, setVersion] = useState(0);
  const [state, setState] = useState({ loading: true, data: null, error: null });
  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true, data: null, error: null });
    adminRequest(path, { signal: controller.signal }).then(data => {
      if (!controller.signal.aborted) setState({ loading: false, data, error: null });
    }).catch(error => {
      if (controller.signal.aborted) return;
      if (error.status === 401) expired();
      else setState({ loading: false, data: null, error: error.message });
    });
    return () => controller.abort();
  }, [path, version, expired]);
  return { ...state, refresh: () => setVersion(value => value + 1) };
}

function Notice({ resource }) {
  if (resource.loading) return <p className="admin-muted" role="status">Loading activity…</p>;
  if (resource.error) return <div className="admin-error" role="alert">{resource.error} <button onClick={resource.refresh}>Retry</button></div>;
  return null;
}
function Badge({ value, children }) {
  return <span className={`admin-badge admin-badge-${value || 'neutral'}`}>{children || statusLabel(value)}</span>;
}
function Pagination({ data, setPage }) {
  if (!data || data.pages <= 1) return null;
  return <nav className="admin-pagination" aria-label="Pagination">
    <button disabled={data.page <= 1} onClick={() => setPage(data.page - 1)}>Previous</button>
    <span>Page {data.page} of {data.pages} · {data.total} records</span>
    <button disabled={data.page >= data.pages} onClick={() => setPage(data.page + 1)}>Next</button>
  </nav>;
}
function Title({ eyebrow, title, children }) {
  return <header className="admin-page-title"><div><p className="admin-eyebrow">{eyebrow}</p><h1>{title}</h1></div>{children}</header>;
}
function ActivityTime({ value }) {
  return value ? <time dateTime={value} title={dateTime(value)}>{friendlyTime(value)}</time> : <span>No activity yet</span>;
}
function Metrics({ client }) {
  return <div className="admin-metrics">
    {[['Emails logged', client.email_count], ['Email opens', client.recorded_open_count],
      ['Link clicks', client.recorded_click_count], ['Active searches', client.active_search_count]].map(([label, value]) =>
      <div className="admin-metric" key={label}><span>{label}</span><strong>{value ?? 0}</strong></div>)}
  </div>;
}

function Login({ signedIn, message }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(message || '');
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const session = await adminRequest('/login', { method: 'POST', body: JSON.stringify({ username, password }) });
      setPassword(''); signedIn(session);
    } catch (failure) {
      setPassword('');
      setError(failure.status === 401 ? 'The username or password is incorrect.' : failure.message);
    } finally { setBusy(false); }
  }
  return <main className="admin-login"><div className="admin-login-brand">G<span>Gorge Realty</span></div>
    <div className="admin-login-card"><p className="admin-eyebrow">Private workspace</p><h1>Client activity</h1>
      <p className="admin-muted">Sign in to follow your clients’ housing searches and email activity.</p>
      <form onSubmit={submit}>
        <label htmlFor="admin-username">Username</label><input id="admin-username" autoComplete="username" required maxLength={100} value={username} onChange={e => setUsername(e.target.value)} />
        <label htmlFor="admin-password">Password</label><input id="admin-password" type="password" autoComplete="current-password" required maxLength={1024} value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p className="admin-error" role="alert">{error}</p>}
        <button className="admin-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <Link className="admin-return" to="/">← Return to the website</Link>
    </div><p className="admin-login-foot">Client information is private. Authorized access only.</p>
  </main>;
}

function OpenedEmails({ clientId, days }) {
  const [page, setPage] = useState(1);
  const resource = useResource(`/clients/${clientId}/emails?opened_only=true&days=${days}&page=${page}`);
  return <div className="admin-opened-emails">
    <h3>Opened emails</h3>
    <Notice resource={resource} />
    {resource.data && <>
      <p className="admin-muted">{resource.data.total} distinct {resource.data.total === 1 ? 'email' : 'emails'} opened · repeated opens stay on the same email</p>
      {resource.data.items.length ? <ul>{resource.data.items.map(email => <li key={email.id}>
        <div><Link to={`/admin/clients/${clientId}/emails/${email.id}`}>{email.listing_address || (email.listing_id?.startsWith('market-') ? 'Market update' : email.listing_id || 'Email alert')}</Link>
          <span className="admin-cell-secondary">Last opened <ActivityTime value={email.last_recorded_open_at} /></span></div>
        <span>{email.period_open_count} {email.period_open_count === 1 ? 'open' : 'opens'}</span>
        <Link className="admin-text-link" to={`/admin/clients/${clientId}/emails/${email.id}`}>View activity →</Link>
      </li>)}</ul> : <p>No opened emails in this period. Link clicks can still appear in the client summary.</p>}
      <Pagination data={resource.data} setPage={setPage} />
    </>}
  </div>;
}

function ActivityDashboard() {
  const [params, setParams] = useSearchParams();
  const days = ['7', '30', '0'].includes(params.get('days')) ? params.get('days') : '30';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const resource = useResource(`/activity?days=${days}&page=${page}`);
  const summary = resource.data?.summary;
  const [expanded, setExpanded] = useState({});
  const actionLabel = kind => kind === 'listing_click' ? 'Clicked a listing' : kind === 'email_open' ? 'Opened an email' : 'Clicked an email link';
  return <>
    <Title eyebrow="Stay close to your clients" title="Client activity"><button onClick={resource.refresh}>Refresh activity</button></Title>
    <p className="admin-description">See who is engaging with your emails, then open their history to follow the details.</p>
    <div className="admin-metrics admin-activity-metrics">
      {[['Clients with activity', summary?.active_clients], ['Email opens', summary?.recorded_opens],
        ['Link clicks', summary?.recorded_clicks]].map(([label, value]) =>
        <div className="admin-metric" key={label}><span>{label}</span><strong>{value ?? '—'}</strong></div>)}
    </div>
    <section className="admin-panel">
      <div className="admin-panel-bar"><div><h2>Recently engaged clients</h2><p>Most recent activity first · expand a client to see their opened emails</p></div>
        <div className="admin-period"><label htmlFor="activity-period">Show</label><select id="activity-period" value={days}
          onChange={event => setParams({ days: event.target.value })}>
          <option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="0">All time</option>
        </select></div>
      </div>
      <Notice resource={resource} />
      {resource.data && (resource.data.items.length ? <div className="admin-table-scroll"><table><thead><tr>
        <th>Client</th><th>Latest activity</th><th>Property or update</th><th>Opens</th><th>Link clicks</th><th />
      </tr></thead><tbody>{resource.data.items.map(client => <React.Fragment key={client.id}><tr>
        <td><div className="admin-activity-client"><span className="admin-avatar" aria-hidden="true">{(client.name || client.email || '?').slice(0, 1).toUpperCase()}</span><div>
          <Link className="admin-client-name" to={`/admin/clients/${client.id}`}>{client.name || client.email || 'Unnamed client'}</Link>
          <span className="admin-cell-secondary">{client.email || 'No email address'}</span>
          {client.is_unsubscribed && <span className="admin-cell-secondary">Unsubscribed</span>}
        </div></div></td>
        <td><span className={`admin-action admin-action-${client.last_activity_kind}`}>{actionLabel(client.last_activity_kind)}</span>
          <span className="admin-cell-secondary"><ActivityTime value={client.last_activity_at} /></span></td>
        <td><Link to={`/admin/clients/${client.id}/emails/${client.last_email_id}`}>
          {client.listing_address || (client.listing_id?.startsWith('market-') ? 'Market update' : client.listing_id || 'Email alert')}
        </Link></td>
        <td className="admin-activity-count">{client.recorded_open_count}</td><td className="admin-activity-count">{client.recorded_click_count}</td>
        <td><button aria-expanded={!!expanded[client.id]} aria-controls={`opened-emails-${client.id}`} onClick={() => setExpanded(value => ({ ...value, [client.id]: !value[client.id] }))}>
          {expanded[client.id] ? 'Hide opened emails' : 'Show opened emails'}</button></td>
      </tr>{expanded[client.id] && <tr><td colSpan={6} id={`opened-emails-${client.id}`}>
        <OpenedEmails key={`${client.id}-${days}-${client.last_activity_at}`} clientId={client.id} days={days} />
      </td></tr>}</React.Fragment>)}</tbody></table></div> : <div className="admin-empty"><h3>No recorded opens or clicks{days !== '0' ? ` in the last ${days} days` : ''}</h3>
        <p>{days !== '0' ? 'Choose All time to see older activity, or browse your client directory.' : 'Clients will appear here when open or click events are recorded.'}</p>
        <Link className="admin-text-link" to="/admin/clients">View all clients →</Link></div>)}
      <Pagination data={resource.data} setPage={value => setParams({ days, page: String(value) })} />
    </section>
    <p className="admin-muted">Email opens are recorded signals, not confirmed listing views. Listing clicks are identified separately from other email links.</p>
  </>;
}

function Clients() {
  const { session, expired } = useContext(Session);
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [search, setSearch] = useState(q);
  useEffect(() => setSearch(q), [q]);
  const resource = useResource(`/clients?q=${encodeURIComponent(q)}&page=${page}`);
  return <>
    <Title eyebrow="Your relationships" title="Clients"><div className="admin-editor-actions">
      <button onClick={() => setAdding(true)}>Add client</button><button onClick={resource.refresh}>Refresh activity</button>
    </div></Title>
    <p className="admin-description">Saved searches, delivery history, and the activity behind every email.</p>
    {adding && <AddClient csrfToken={session.csrf_token} readOnly={session.data_mode === 'production_readonly'}
      onExpired={expired} onCancel={() => setAdding(false)} onCreated={client => navigate(`/admin/clients/${client.id}`)} />}

    <section className="admin-panel">
      <div className="admin-panel-bar"><div><h2>Client directory</h2><p>{resource.data ? `${resource.data.total} clients` : 'Your client list'}</p></div>
        <form className="admin-search" onSubmit={e => { e.preventDefault(); setParams(search ? { q: search } : {}); }}>
          <label className="admin-sr-only" htmlFor="client-search">Search clients by name or email</label>
          <input id="client-search" placeholder="Search name or email" value={search} maxLength={100} onChange={e => setSearch(e.target.value)} /><button>Search</button>
        </form></div>
      <Notice resource={resource} />
      {resource.data && (resource.data.items.length ? <div className="admin-table-scroll"><table><thead><tr>
        <th>Client</th><th>Alert settings</th><th>Last email sent</th><th>Email activity</th><th><span className="admin-sr-only">View</span></th>
      </tr></thead><tbody>{resource.data.items.map(client => <tr key={client.id}>
        <td><Link className="admin-client-name" to={`/admin/clients/${client.id}`}>{client.name || client.email || 'Unnamed client'}</Link><span className="admin-cell-secondary">{client.email || 'No email address'}</span></td>
        <td><Badge value={client.is_unsubscribed ? 'neutral' : client.active_search_count ? 'active' : 'neutral'}>
          {client.is_unsubscribed ? 'Unsubscribed' : client.active_search_count ? `${client.active_search_count} active searches` : 'No active searches'}</Badge></td>
        <td><ActivityTime value={client.last_email_at} /></td>
        <td><span>{client.recorded_open_count} opens · {client.recorded_click_count} clicks</span><span className="admin-cell-secondary">Last open: <ActivityTime value={client.last_recorded_open_at} /></span></td>
        <td><Link className="admin-text-link" to={`/admin/clients/${client.id}`}>View →</Link></td>
      </tr>)}</tbody></table></div> : <div className="admin-empty"><h3>{q ? 'No matching clients' : 'No clients yet'}</h3><p>{q ? 'Try another name or email address.' : 'Use Add client to create your first client.'}</p></div>)}
      <Pagination data={resource.data} setPage={value => setParams({ ...(q ? { q } : {}), page: String(value) })} />
    </section>
  </>;
}

function SearchList({ clientId, unsubscribed, onChanged }) {
  const { session, expired } = useContext(Session);
  const readOnly = session.data_mode === 'production_readonly';
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const resource = useResource(`/clients/${clientId}/searches?page=${page}`);
  async function toggle(search) {
    setBusy(true); setError('');
    try {
      await adminRequest(`/clients/${clientId}/searches/${search.id}/state`, {
        method: 'PATCH', headers: { 'X-CSRF-Token': session.csrf_token }, body: JSON.stringify({ is_active: !search.is_active }),
      });
      resource.refresh(); onChanged();
    } catch (failure) { if (failure.status === 401) expired(); else setError(failure.message); }
    finally { setBusy(false); }
  }
  return <section className="admin-panel"><div className="admin-panel-bar"><h2>Saved searches</h2>
    <button onClick={() => setEditing({})}>New listing search</button></div><Notice resource={resource} />
    {error && <p className="admin-error" role="alert">{error}</p>}
    {editing && <SavedSearchEditor key={editing.id || 'new'} clientId={clientId} search={editing.id ? editing : null}
      csrfToken={session.csrf_token} readOnly={readOnly} onExpired={expired} onClose={() => setEditing(null)}
      onSaved={() => { setEditing(null); resource.refresh(); onChanged(); }} />}
    {resource.data && (resource.data.items.length ? <ul className="admin-search-list">{resource.data.items.map(search => <li key={search.id}>
      <div><strong>{search.criteria.alert_type === 'property' ? 'Property watch' : search.criteria.alert_type === 'market' ? 'Weekly market update' : 'Listing search'}</strong>
        <p>{criteriaSummary(search.criteria)}</p><span className="admin-muted">{search.criteria.alert_type === 'market' ? 'Weekly' : search.frequency === 'daily' ? 'Daily setting' : 'Instant setting'} · Last alert: {dateTime(search.last_alert_sent)}</span>
        {search.editable === false && <p className="admin-muted">This search has settings the listing editor does not support. Its criteria are preserved.</p>}
        <div className="admin-editor-actions">
          {search.editable && <button onClick={() => setEditing(search)}>{readOnly ? 'Preview criteria' : 'Edit criteria'}</button>}
          <button disabled={busy || readOnly || (!search.is_active && (unsubscribed || !search.editable))} onClick={() => toggle(search)}>{search.is_active ? 'Pause search' : 'Activate search'}</button>
        </div>
      </div>
      <Badge value={search.is_active && !unsubscribed ? 'active' : 'neutral'}>{unsubscribed ? 'Unsubscribed' : search.is_active ? 'Active' : 'Paused'}</Badge>
    </li>)}</ul> : <div className="admin-empty">No saved searches.</div>)}
    {unsubscribed && <p className="admin-note">This client is unsubscribed. Editing searches will not resubscribe them.</p>}
    <Pagination data={resource.data} setPage={setPage} />
  </section>;
}

function EmailList({ clientId }) {
  const [page, setPage] = useState(1);
  const resource = useResource(`/clients/${clientId}/emails?page=${page}`);
  return <section className="admin-panel"><div className="admin-panel-bar"><div><h2>Email history</h2><p>See which emails were delivered and which links were clicked.</p></div></div><Notice resource={resource} />
    {resource.data && (resource.data.items.length ? <div className="admin-table-scroll"><table><thead><tr><th>Property or update</th><th>Submitted to email service</th><th>Delivery status</th><th>Email activity</th><th /></tr></thead>
      <tbody>{resource.data.items.map(email => <tr key={email.id}>
        <td><strong>{email.listing_address || (email.listing_id?.startsWith('market-') ? 'Market update' : email.listing_id || 'Email alert')}</strong><span className="admin-cell-secondary">Search #{email.search_id}</span></td>
        <td><ActivityTime value={email.accepted_at} /></td><td><Badge value={email.delivery_status} /></td>
        <td>{email.recorded_open_count} opens · {email.recorded_click_count} clicks</td>
        <td><Link className="admin-text-link" to={`/admin/clients/${clientId}/emails/${email.id}`}>View activity →</Link></td>
      </tr>)}</tbody></table></div> : <div className="admin-empty">No emails logged for this client.</div>)}
    <Pagination data={resource.data} setPage={setPage} />
  </section>;
}

function ClientDetail() {
  const { clientId } = useParams();
  const resource = useResource(`/clients/${clientId}`);
  if (!resource.data) return <><Link className="admin-back" to="/admin/clients">← All clients</Link><Notice resource={resource} /></>;
  const client = resource.data;
  return <>
    <Link className="admin-back" to="/admin/clients">← All clients</Link>
    <Title eyebrow="Client overview" title={client.name || client.email || 'Unnamed client'}><button onClick={resource.refresh}>Refresh overview</button></Title>
    <div className="admin-client-meta"><span>{client.email || 'No email address'}</span><Badge value={client.is_unsubscribed ? 'neutral' : 'active'}>{client.is_unsubscribed ? 'Unsubscribed' : 'Subscribed'}</Badge><span>Joined {dateTime(client.created_at)}</span></div>
    <Metrics client={client} />
    <SearchList key={`search-${clientId}`} clientId={clientId} unsubscribed={client.is_unsubscribed} onChanged={resource.refresh} />
    <EmailList key={`email-${clientId}`} clientId={clientId} />
  </>;
}

function EmailDetail() {
  const { clientId, emailId } = useParams();
  const [page, setPage] = useState(1);
  const email = useResource(`/clients/${clientId}/emails/${emailId}`);
  const activity = useResource(`/clients/${clientId}/emails/${emailId}/events?page=${page}`);
  const row = email.data;
  return <>
    <Link className="admin-back" to={`/admin/clients/${clientId}`}>← Client overview</Link>
    <Title eyebrow="Email activity" title={row?.listing_address || 'Email timeline'}><button onClick={() => { email.refresh(); activity.refresh(); }}>Refresh activity</button></Title>
    <Notice resource={email} />
    {row && <><section className="admin-email-summary"><div><span className="admin-muted">Recipient</span><strong>{row.recipient || '—'}</strong></div><div><span className="admin-muted">Submitted to email service</span><strong><ActivityTime value={row.accepted_at} /></strong></div><Badge value={row.delivery_status} /></section>
      <div className="admin-metrics admin-metrics-two"><div className="admin-metric"><span>Email opens</span><strong>{row.recorded_open_count}</strong></div><div className="admin-metric"><span>Link clicks</span><strong>{row.recorded_click_count}</strong></div></div>
      {(row.legacy_open_count > row.recorded_open_count || row.legacy_click_count > row.recorded_click_count) && <p className="admin-note">Legacy tracking counters: {row.legacy_open_count} opens and {row.legacy_click_count} clicks. These may include activity without a verified event history and are shown separately.</p>}
      <section className="admin-panel"><div className="admin-panel-bar"><div><h2>Email activity</h2><p>Follow delivery, opens, and clicks in the order they happened.</p></div></div><Notice resource={activity} />
        {activity.data && (activity.data.items.length ? <ol className="admin-timeline">{activity.data.items.map(event => {
          const href = safeLink(event.clicked_url);
          return <li key={event.id}><span className={`admin-event-dot admin-event-${event.event_type.replace('email.', '')}`} /><div>
            <strong>{event.is_listing_click ? 'Clicked a listing' : statusLabel(event.event_type)}</strong><ActivityTime value={event.occurred_at} />
            {event.clicked_url && <p>{href ? <a href={href} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">{event.is_listing_click ? 'View listing ↗' : 'View clicked link ↗'}</a> : <span>Link unavailable</span>}</p>}
            {event.engagement_source && <span className="admin-muted">This activity may come from a person or an automated email tool.</span>}
          </div></li>;
        })}</ol> : <div className="admin-empty">No recorded events yet. Provider acceptance does not confirm delivery.</div>)}
        <Pagination data={activity.data} setPage={setPage} />
      </section></>}
  </>;
}

export default function AdminActivity() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const expired = useCallback(() => { setSession(null); setMessage('Your session expired. Please sign in again.'); }, []);
  useEffect(() => {
    const controller = new AbortController();
    adminRequest('/session', { signal: controller.signal }).then(data => {
      if (!controller.signal.aborted) setSession(data);
    }).catch(error => {
      if (!controller.signal.aborted && error.status !== 401) setMessage(error.message);
    }).finally(() => { if (!controller.signal.aborted) setChecking(false); });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const previous = document.title;
    document.title = 'Client activity | Gorge Realty';
    return () => { document.title = previous; };
  }, []);
  async function signOut() {
    setSigningOut(true); setMessage('');
    try {
      await adminRequest('/logout', { method: 'POST', headers: { 'X-CSRF-Token': session.csrf_token } });
      setSession(null);
    } catch (error) { if (error.status === 401) expired(); else setMessage(error.message); }
    finally { setSigningOut(false); }
  }
  if (checking) return <main className="admin-loading" role="status">Opening your workspace…</main>;
  if (!session) return <Login signedIn={data => { setMessage(''); setSession(data); }} message={message} />;
  return <Session.Provider value={{ session, expired }}><div className="admin-app">
    <aside className="admin-sidebar"><Link className="admin-brand" to="/admin"><span className="admin-brand-mark">G</span><span>Gorge Realty<small>Client workspace</small></span></Link>
      <p className="admin-sidebar-label">Workspace</p><nav className="admin-nav" aria-label="Workspace">
        <NavLink className="admin-nav-link" end to="/admin">◉ <span>Activity</span></NavLink>
        <NavLink className="admin-nav-link" to="/admin/clients">◎ <span>All clients</span></NavLink>
      </nav>
      <div className="admin-sidebar-bottom"><Link to="/">↗ Public website</Link><span>Client administration</span></div>
    </aside>
    <div className="admin-main"><div className="admin-topbar"><span>Client activity</span><div><span>{session.username}</span><button disabled={signingOut} onClick={signOut}>{signingOut ? 'Signing out…' : 'Sign out'}</button></div></div>
      <main className="admin-content">{message && <p role="alert" className="admin-error">{message}</p>}
        {session.data_mode === 'production_readonly' && <p className="admin-note" role="status">Live production data · Read-only preview. Email sending and data changes are disabled.</p>}
        <Routes><Route index element={<ActivityDashboard />} /><Route path="clients" element={<Clients />} /><Route path="clients/:clientId" element={<ClientDetail />} /><Route path="clients/:clientId/emails/:emailId" element={<EmailDetail />} /><Route path="*" element={<><h1>Page not found</h1><Link to="/admin">Return to clients</Link></>} /></Routes>
        <footer className="admin-data-note">Times shown in {timezone}. Opens and clicks may include privacy proxies or automated scanners; they do not confirm that a client read an email.</footer>
      </main>
    </div>
  </div></Session.Provider>;
}
