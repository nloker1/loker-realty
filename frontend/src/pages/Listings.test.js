import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Listings from './Listings';

jest.mock('../components/Header', () => () => null);
jest.mock('../components/Footer', () => () => null);
jest.mock('../components/map/ListingsMap', () => () => null);

const property = { mls_number: 'SYNTHETIC', address: '8 Fictional Test Lane', city: 'WhiteSalmon',
  zipcode: '98672', price: 550000, photo_url: '/demo-listing.svg' };
afterEach(() => jest.restoreAllMocks());

test('loads local active and sold fixtures and displays the date in the badge', async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [{ ...property, status: 'Active' }] })
    .mockResolvedValueOnce({ ok: true, json: async () => [{ ...property, status: 'Sold', close_date: '2026-10-30' }] });
  render(<MemoryRouter><Listings embedded /></MemoryRouter>);
  await screen.findByText('8 Fictional Test Lane');
  fireEvent.click(screen.getByRole('button', { name: 'Sold (1)' }));
  const date = await screen.findByText('Oct 30, 2026');
  expect(date.closest('.card-badge')).toHaveTextContent('Sold');
  expect(screen.getByText('White Salmon, 98672')).toBeInTheDocument();
  expect(global.fetch.mock.calls[1][0]).toContain('sort=sold_date_desc');
});

test('API errors are shown as errors instead of empty listing results', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
  render(<MemoryRouter><Listings embedded /></MemoryRouter>);
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load listings');
  expect(screen.queryByText('No listings found in this category.')).not.toBeInTheDocument();
});
