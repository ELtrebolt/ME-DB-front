import { render, screen } from '@testing-library/react';
import { api as axios } from './app/api';
import App from './App';

jest.mock('./app/api', () => ({
  api: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
  setUnauthorizedHandler: jest.fn(),
}));

// Make the landing page render synchronously in tests so we don't race Suspense/lazy loading.
jest.mock('./landing/pages/Intro', () => {
  const React = require('react');
  return () => React.createElement('div', null, 'Sign in with Google');
});

beforeAll(() => {
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

beforeEach(() => {
  axios.get.mockRejectedValue({ response: { status: 401 } });
});

afterEach(() => {
  jest.clearAllMocks();
});

test('shows landing page when not authenticated', async () => {
  render(<App />);
  expect(await screen.findAllByText(/sign in/i)).not.toHaveLength(0);
});
