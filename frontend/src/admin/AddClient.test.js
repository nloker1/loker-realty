import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddClient from './AddClient';

const created = jest.fn(), expired = jest.fn();
beforeEach(() => {
  created.mockClear(); expired.mockClear();
  global.fetch = jest.fn(async () => ({ ok: true, status: 201, json: async () => ({ id: 8, name: 'Fictional Buyer' }) }));
});
afterEach(() => jest.restoreAllMocks());
function mount(props = {}) {
  render(<AddClient csrfToken="synthetic-csrf" onCreated={created} onExpired={expired} onCancel={jest.fn()} {...props} />);
}
function fill() {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: ' Fictional Buyer ' } });
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'fictional.buyer@example.com' } });
}
test('creates a client with the session CSRF token and opens the result', async () => {
  mount(); fill(); fireEvent.click(screen.getByRole('button', { name: 'Create client' }));
  await waitFor(() => expect(created).toHaveBeenCalledWith({ id: 8, name: 'Fictional Buyer' }));
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toMatch(/\/api\/admin\/clients$/);
  expect(options.headers['X-CSRF-Token']).toBe('synthetic-csrf');
  expect(JSON.parse(options.body)).toEqual({ name: 'Fictional Buyer', email: 'fictional.buyer@example.com' });
});
test('duplicate failure retains input for correction', async () => {
  global.fetch.mockResolvedValue({ ok: false, status: 409, json: async () => ({ detail: 'A client with this email already exists.' }) });
  mount(); fill(); fireEvent.click(screen.getByRole('button', { name: 'Create client' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('already exists');
  expect(screen.getByLabelText('Email address')).toHaveValue('fictional.buyer@example.com');
  expect(created).not.toHaveBeenCalled();
});
test('live preview blocks creating clients', () => {
  mount({ readOnly: true });
  expect(screen.getByRole('button', { name: 'Create client' })).toBeDisabled();
  expect(screen.getByLabelText('Email address')).toBeDisabled();
  expect(global.fetch).not.toHaveBeenCalled();
});
test('expired sessions return to login', async () => {
  global.fetch.mockResolvedValue({ ok: false, status: 401, json: async () => ({}) });
  mount(); fill(); fireEvent.click(screen.getByRole('button', { name: 'Create client' }));
  await waitFor(() => expect(expired).toHaveBeenCalled());
});
