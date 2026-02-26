import { render, screen } from '@testing-library/react';
import axios from 'axios';
import App from './App';

jest.mock('axios');

beforeAll(() => {
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

beforeEach(() => {
  axios.defaults = { withCredentials: false };
  axios.get.mockRejectedValue({ response: { status: 401 } });
});

afterEach(() => {
  jest.clearAllMocks();
});

test('shows landing page when not authenticated', async () => {
  render(<App />);
  expect(await screen.findAllByText(/sign in/i)).not.toHaveLength(0);
});
