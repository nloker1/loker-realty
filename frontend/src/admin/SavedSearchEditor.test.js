import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SavedSearchEditor from './SavedSearchEditor';

let saved;
const preview = { total: 1, page: 1, pages: 1, items: [{ id: 1, address: '1 Fictional Lane', city: 'White Salmon', price: 550000, beds: 3, baths: 2 }], note: 'Current matches; future alerts include newly added listings.' };
beforeEach(() => {
  saved = jest.fn();
  global.fetch = jest.fn(url => Promise.resolve({ ok: true, status: 200, json: async () => url.includes('search-preview') ? preview : { id: 2, is_active: false } }));
});
afterEach(() => jest.restoreAllMocks());
function mount(props = {}) {
  return render(<SavedSearchEditor clientId={1} csrfToken="synthetic-csrf" onSaved={saved} onClose={jest.fn()} onExpired={jest.fn()} {...props} />);
}
test('previews typed filters, clears stale matches, and saves a paused search', async () => {
  mount();
  fireEvent.change(screen.getByLabelText('Cities, separated by commas'), { target: { value: 'White Salmon, Hood River' } });
  fireEvent.change(screen.getByLabelText('Maximum price'), { target: { value: '700000' } });
  expect(screen.getByRole('button', { name: 'Save paused search' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Preview matching homes' }));
  expect(await screen.findByText('1 Fictional Lane')).toBeInTheDocument();
  const body = JSON.parse(global.fetch.mock.calls[0][1].body);
  expect(body.criteria).toEqual({ cities: ['White Salmon', 'Hood River'], maxPrice: 700000 });
  fireEvent.change(screen.getByLabelText('Maximum price'), { target: { value: '650000' } });
  expect(screen.queryByText('1 Fictional Lane')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Save paused search' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Preview matching homes' }));
  await screen.findByText('1 Fictional Lane');
  fireEvent.click(screen.getByRole('button', { name: 'Save paused search' }));
  await waitFor(() => expect(saved).toHaveBeenCalled());
  const request = global.fetch.mock.calls.find(([url]) => url.endsWith('/clients/1/searches'));
  expect(request[1].method).toBe('POST');
  expect(request[1].headers['X-CSRF-Token']).toBe('synthetic-csrf');
});
test('read-only production preview allows matching but disables saving', async () => {
  mount({ readOnly: true });
  expect(screen.getByText(/Saving is disabled/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Preview matching homes' }));
  await screen.findByText('1 Fictional Lane');
  expect(screen.getByRole('button', { name: 'Save paused search' })).toBeDisabled();
  expect(saved).not.toHaveBeenCalled();
});
test('editing retains criteria and uses the owned search update route', async () => {
  mount({ search: { id: 7, criteria: { cities: ['White Salmon'], minBeds: 3 } } });
  expect(screen.getByLabelText('Minimum bedrooms')).toHaveValue(3);
  fireEvent.click(screen.getByRole('button', { name: 'Preview matching homes' }));
  await screen.findByText('1 Fictional Lane');
  fireEvent.click(screen.getByRole('button', { name: 'Save paused search' }));
  await waitFor(() => expect(saved).toHaveBeenCalled());
  expect(global.fetch.mock.calls.find(([url]) => url.endsWith('/searches/7'))[1].method).toBe('PUT');
});
