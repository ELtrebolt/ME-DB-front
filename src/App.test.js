import { render, screen } from '@testing-library/react';
import { api as axios } from './app/api';
import App from './App';

jest.mock('./app/api', () => ({
  api: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

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
