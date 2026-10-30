import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminActivity from './AdminActivity';
import { safeLink, criteriaSummary } from './api';

const session = { username: 'owner', csrf_token: 'synthetic-csrf' };
const client = { id: 1, name: 'Synthetic Buyer', email: 'buyer@example.test', created_at: '2026-01-01T12:00:00Z',
  active_search_count: 1, email_count: 1, recorded_open_count: 1, recorded_click_count: 1 };
const email = { id: 7, search_id: 1, listing_id: 'SYNTHETIC-MATCH', listing_address: '1 Fictional Test Lane',
  recipient: client.email, accepted_at: '2026-01-03T12:00:00Z', delivery_status: 'delivered',
  recorded_open_count: 1, recorded_click_count: 1, legacy_open_count: 1, legacy_click_count: 1 };
const page = items => ({ items, total: items.length, page: 1, page_size: 25, pages: 1 });
let authenticated, failLogin, expireDirectory;
function response(data, status = 200) { return Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(data) }); }
beforeEach(() => {
  authenticated = false; failLogin = false; expireDirectory = false;
  global.fetch = jest.fn((url, options = {}) => {
    const path = new URL(url, 'http://localhost').pathname.replace('/api/admin', '');
    if (path === '/session') return response(authenticated ? session : {}, authenticated ? 200 : 401);
    if (path === '/login') { authenticated = !failLogin; return response(session, failLogin ? 401 : 200); }
    if (path === '/logout') { authenticated = false; return response({ status: 'signed_out' }); }
    if (!authenticated || expireDirectory) return response({}, 401);
    if (path === '/clients') return response(page([client]));
    if (path === '/clients/1') return response(client);
    if (path === '/clients/1/searches') return response(page([{ id: 1, frequency: 'instant', is_active: true,
      criteria: { cities: ['White Salmon'], minPrice: 400000, minBeds: 3 } }]));
    if (path === '/clients/1/emails') return response(page([email]));
    if (path === '/clients/1/emails/7') return response(email);
    if (path === '/clients/1/emails/7/events') return response(page([{ id: 1, event_type: 'email.clicked',
      is_listing_click: true, clicked_url: 'https://gorgerealty.com/property/test/SYNTHETIC-MATCH',
      engagement_source: 'unclassified', occurred_at: '2026-01-03T13:00:00Z' }]));
    throw new Error(`Unexpected synthetic request: ${path}`);
  });
});
afterEach(() => jest.restoreAllMocks());
function mount() {
  return render(<MemoryRouter initialEntries={['/admin']}><Routes><Route path="/admin/*" element={<AdminActivity />} /></Routes></MemoryRouter>);
}
async function login() {
  await screen.findByLabelText('Username');
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'owner' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'synthetic-only-password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
}

test('sign-in, client history, timeline and logout use protected requests', async () => {
  mount(); await screen.findByLabelText('Username');
  expect(global.fetch.mock.calls.some(([url]) => url.includes('/clients'))).toBe(false);
  await login(); fireEvent.click(await screen.findByRole('link', { name: 'Synthetic Buyer' }));
  await screen.findByRole('heading', { name: 'Saved searches' });
  expect(await screen.findByText(/White Salmon.*3\+ beds/)).toBeInTheDocument();
  fireEvent.click(await screen.findByRole('link', { name: 'Timeline →' }));
  expect(await screen.findByText('Listing link clicked')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /https:\/\/gorgerealty/ })).toHaveAttribute('rel', 'noopener noreferrer');
  expect(screen.getByText(/human or automated source unknown/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
  await screen.findByLabelText('Password');
  expect(screen.queryByText(client.email)).not.toBeInTheDocument();
  const logout = global.fetch.mock.calls.find(([url]) => url.endsWith('/logout'));
  expect(logout[1].headers['X-CSRF-Token']).toBe('synthetic-csrf');
  expect(global.fetch.mock.calls.every(([, options]) => options.credentials === 'include' && options.cache === 'no-store')).toBe(true);
});
test('invalid credentials do not fetch client data', async () => {
  failLogin = true; mount(); await login();
  expect(await screen.findByRole('alert')).toHaveTextContent('username or password is incorrect');
  expect(screen.getByLabelText('Password')).toHaveValue('');
  expect(global.fetch.mock.calls.some(([url]) => url.includes('/clients'))).toBe(false);
});
test('expired reporting sessions clear the workspace', async () => {
  authenticated = true; expireDirectory = true; mount();
  expect(await screen.findByLabelText('Username')).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('session expired');
  expect(screen.queryByText(client.email)).not.toBeInTheDocument();
});
test('search is encoded and clicked links allow only HTTP and HTTPS', async () => {
  authenticated = true; mount();
  fireEvent.change(await screen.findByLabelText('Search clients by name or email'), { target: { value: 'buyer+test@example.test' } });
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  await waitFor(() => expect(global.fetch.mock.calls.some(([url]) => url.includes('q=buyer%2Btest%40example.test'))).toBe(true));
  await screen.findByRole('link', { name: 'Synthetic Buyer' });
  expect(safeLink('javascript:alert(1)')).toBeNull();
  expect(safeLink('data:text/html,unsafe')).toBeNull();
  expect(safeLink('https://example.test/listing')).toBe('https://example.test/listing');
  expect(criteriaSummary({ minAcres: .25, minSqft: 1800 })).toContain('0.25+ acres');
});
